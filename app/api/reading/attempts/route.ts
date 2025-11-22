import { NextResponse } from 'next/server'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { readingAttempts, readingQuestions } from '@/lib/db/schema'
import { scoreWithOrchestrator } from '@/lib/ai/orchestrator'
import { TestSection } from '@/lib/pte/types'
import { ReadingAttemptBodySchema } from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

async function checkRateLimit(userId: string, maxPerHour = 120) {
  // DB-only soft rate limit: count attempts in the last hour
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(readingAttempts)
    .where(
      and(
        eq(readingAttempts.userId, userId),
        sql`${readingAttempts.createdAt} > now() - interval '1 hour'`
      )
    )
  const count = Number(rows[0]?.count || 0)
  return { count, allowed: count < maxPerHour }
}

// Scoring functions for different question types
function scoreMultipleChoiceSingle(
  userResponse: any,
  correctAnswer: string
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const selected = userResponse.selectedOption
  const isCorrect = selected === correctAnswer
  return {
    accuracy: isCorrect ? 100 : 0,
    correctAnswers: isCorrect ? 1 : 0,
    totalAnswers: 1,
  }
}

function scoreMultipleChoiceMultiple(
  userResponse: any,
  correctAnswers: string[]
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const selected = userResponse.selectedOptions || []
  const correctSet = new Set(correctAnswers)
  const selectedSet = new Set(selected)

  let correctCount = 0
  let totalCorrect = correctAnswers.length
  let totalSelected = selected.length

  // Count correct selections
  for (const answer of selected) {
    if (correctSet.has(answer)) {
      correctCount++
    }
  }

  // Calculate accuracy: (correct selections / total correct) * (1 - penalty for wrong selections)
  const precision = totalCorrect > 0 ? correctCount / totalCorrect : 0
  const recall = totalSelected > 0 ? correctCount / totalSelected : 0
  const f1Score =
    totalCorrect + totalSelected > 0
      ? (2 * (precision * recall)) / (precision + recall)
      : 0

  return {
    accuracy: Math.round(f1Score * 100),
    correctAnswers: correctCount,
    totalAnswers: totalCorrect,
  }
}

function scoreReorderParagraphs(
  userResponse: any,
  correctOrder: number[]
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const userOrder = userResponse.order || []
  if (userOrder.length !== correctOrder.length) {
    return { accuracy: 0, correctAnswers: 0, totalAnswers: correctOrder.length }
  }

  let correctCount = 0
  for (let i = 0; i < correctOrder.length; i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctCount++
    }
  }

  return {
    accuracy: Math.round((correctCount / correctOrder.length) * 100),
    correctAnswers: correctCount,
    totalAnswers: correctOrder.length,
  }
}

function scoreFillInBlanks(
  userResponse: any,
  correctAnswers: any
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const userAnswers = userResponse.answers || {}
  const blanks = correctAnswers.blanks || []
  let correctCount = 0

  for (const blank of blanks) {
    const userAnswer = userAnswers[blank.index]?.toLowerCase().trim()
    const correctAnswer = blank.answer.toLowerCase().trim()
    if (userAnswer === correctAnswer) {
      correctCount++
    }
  }

  return {
    accuracy: Math.round((correctCount / blanks.length) * 100),
    correctAnswers: correctCount,
    totalAnswers: blanks.length,
  }
}

// POST /api/reading/attempts
export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Auth
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    // Validate body
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    // Validate timing window (anti-tamper)
    const timingCheck = await validateTimingFromRequest(request, {
      graceMs: 2000,
    })
    if (!timingCheck.ok) {
      return error(timingCheck.status, timingCheck.message, timingCheck.code)
    }

    const json = await request.json()
    const parsed = ReadingAttemptBodySchema.safeParse(json)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { questionId, type, userResponse, timeTaken } = parsed.data

    // Rate-limit
    const rl = await checkRateLimit(userId)
    if (!rl.allowed) {
      return error(
        429,
        'Rate limit exceeded: max 120 attempts per hour',
        'RATE_LIMITED'
      )
    }

    // Validate question exists
    const question = await db
      .select()
      .from(readingQuestions)
      .where(eq(readingQuestions.id, questionId))
      .limit(1)
    if (!question[0]) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }
    const q = question[0]

    if (q.type !== type) {
      return error(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    }
    if (q.isActive === false) {
      return error(400, 'Question is not active', 'INACTIVE_QUESTION')
    }

    // Score the attempt
    let scores: {
      accuracy: number
      correctAnswers: number
      totalAnswers: number
    }
    switch (type) {
      case 'multiple_choice_single':
        scores = scoreMultipleChoiceSingle(userResponse, q.answerKey as string)
        break
      case 'multiple_choice_multiple':
        scores = scoreMultipleChoiceMultiple(
          userResponse,
          q.answerKey as string[]
        )
        break
      case 'reorder_paragraphs':
        scores = scoreReorderParagraphs(userResponse, q.answerKey as number[])
        break
      case 'fill_in_blanks':
      case 'reading_writing_fill_blanks':
        scores = scoreFillInBlanks(userResponse, q.answerKey)
        break
      default:
        return error(400, 'Unsupported question type', 'UNSUPPORTED_TYPE')
    }

    // Optionally get AI rationale for non-perfect scores (to save AI credits)
    let rationale: string | undefined
    if (scores.accuracy < 100) {
      try {
        const orchestratorResult = await scoreWithOrchestrator({
          section: TestSection.READING,
          questionType: type,
          payload: {
            question: q.promptText,
            options: q.options,
            correct: q.answerKey,
            userSelected: (userResponse as any).selectedOption
              ? [(userResponse as any).selectedOption]
              : (userResponse as any).selectedOptions || (userResponse as any).order || [],
          },
          includeRationale: true,
          timeoutMs: 8000,
        })
        rationale = orchestratorResult.rationale
      } catch {
        // Rationale is optional, ignore errors
      }
    }

    // Persist attempt
    const scoresJson = {
      accuracy: scores.accuracy,
      correctAnswers: scores.correctAnswers,
      totalAnswers: scores.totalAnswers,
      ...(rationale ? { rationale } : {}),
    }

    const [attempt] = await db
      .insert(readingAttempts)
      .values({
        userId,
        questionId,
        userResponse,
        scores: scoresJson as any,
        timeTaken,
      })
      .returning()

    return NextResponse.json(
      {
        attempt,
        scores: scoresJson,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/reading/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// GET /api/reading/attempts?questionId=<id>&page=1&pageSize=25
export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const url = new URL(request.url)
    const questionId = url.searchParams.get('questionId') || undefined
    const page = Math.max(
      parseInt(url.searchParams.get('page') || '1', 10) || 1,
      1
    )
    const pageSize = Math.min(
      Math.max(parseInt(url.searchParams.get('pageSize') || '25', 10) || 25, 1),
      100
    )

    const offset = (page - 1) * pageSize

    let whereConditions = [eq(readingAttempts.userId, userId)]
    if (questionId) {
      whereConditions.push(eq(readingAttempts.questionId, questionId))
    }

    const whereExpr = and(...whereConditions)

    // Get total count
    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(readingAttempts)
      .where(whereExpr)
    const total = Number(countRows[0]?.count || 0)

    // Get attempts with question info
    const items = await db
      .select({
        id: readingAttempts.id,
        userResponse: readingAttempts.userResponse,
        scores: readingAttempts.scores,
        timeTaken: readingAttempts.timeTaken,
        createdAt: readingAttempts.createdAt,
        question: {
          id: readingQuestions.id,
          title: readingQuestions.title,
          type: readingQuestions.type,
          difficulty: readingQuestions.difficulty,
        },
      })
      .from(readingAttempts)
      .innerJoin(
        readingQuestions,
        eq(readingAttempts.questionId, readingQuestions.id)
      )
      .where(whereExpr)
      .orderBy(desc(readingAttempts.createdAt))
      .limit(pageSize)
      .offset(offset)

    return NextResponse.json(
      {
        items,
        count: total,
        page,
        pageSize,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('[GET /api/reading/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

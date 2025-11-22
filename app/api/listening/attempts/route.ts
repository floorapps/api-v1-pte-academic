import { NextResponse } from 'next/server'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { listeningAttempts, listeningQuestions } from '@/lib/db/schema'
import {
  countWords,
  ListeningAttemptBodySchema,
  textLengthValidation,
} from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

async function checkRateLimit(userId: string, maxPerHour = 120) {
  // DB-only soft rate limit: count attempts in the last hour
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(listeningAttempts)
    .where(
      and(
        eq(listeningAttempts.userId, userId),
        sql`${listeningAttempts.createdAt} > now() - interval '1 hour'`
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

  // Calculate F1 score for accuracy
  const precision = totalCorrect > 0 ? correctCount / totalCorrect : 0
  const recall = totalSelected > 0 ? correctCount / totalSelected : 0
  const f1Score =
    precision + recall > 0
      ? (2 * (precision * recall)) / (precision + recall)
      : 0

  return {
    accuracy: Math.round(f1Score * 100),
    correctAnswers: correctCount,
    totalAnswers: totalCorrect,
  }
}

function scoreFillInBlanks(
  userResponse: any,
  correctAnswers: any
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const userAnswers = userResponse.answers || {}
  const blanks = Array.isArray(correctAnswers)
    ? correctAnswers
    : correctAnswers.blanks || []
  let correctCount = 0

  for (const blank of blanks) {
    const userAnswer = userAnswers[blank.index]?.toLowerCase().trim()
    const correctAnswer = blank.answer.toLowerCase().trim()
    if (userAnswer === correctAnswer) {
      correctCount++
    }
  }

  return {
    accuracy:
      blanks.length > 0 ? Math.round((correctCount / blanks.length) * 100) : 0,
    correctAnswers: correctCount,
    totalAnswers: blanks.length,
  }
}

function scoreHighlightIncorrectWords(
  userResponse: any,
  correctIndices: number[]
): { accuracy: number; correctAnswers: number; totalAnswers: number } {
  const userIndices = userResponse.indices || []
  const correctSet = new Set(correctIndices)
  const userSet = new Set(userIndices)

  let correctCount = 0
  for (const idx of userIndices) {
    if (correctSet.has(idx)) {
      correctCount++
    }
  }

  // F1 score calculation
  const precision =
    correctIndices.length > 0 ? correctCount / correctIndices.length : 0
  const recall = userIndices.length > 0 ? correctCount / userIndices.length : 0
  const f1Score =
    precision + recall > 0
      ? (2 * (precision * recall)) / (precision + recall)
      : 0

  return {
    accuracy: Math.round(f1Score * 100),
    correctAnswers: correctCount,
    totalAnswers: correctIndices.length,
  }
}

function scoreWriteFromDictation(
  textAnswer: string,
  transcript: string
): {
  accuracy: number
  correctWords: number
  totalWords: number
  wordCount: number
} {
  const userWords = textAnswer.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const correctWords = transcript
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  // Simple word-by-word comparison
  let correctCount = 0
  const minLength = Math.min(userWords.length, correctWords.length)

  for (let i = 0; i < minLength; i++) {
    if (userWords[i] === correctWords[i]) {
      correctCount++
    }
  }

  return {
    accuracy:
      correctWords.length > 0
        ? Math.round((correctCount / correctWords.length) * 100)
        : 0,
    correctWords: correctCount,
    totalWords: correctWords.length,
    wordCount: userWords.length,
  }
}

function scoreSummarizeSpokenText(textAnswer: string): {
  wordCount: number
  withinRange: boolean
  score: number
} {
  const validation = textLengthValidation('summarize_spoken_text', textAnswer)
  const wc = validation.wordCount
  const withinRange = validation.withinRange

  // Basic scoring based on word count adherence
  let score = withinRange ? 75 : 55

  // Penalties for extremes
  if (wc < 30) score -= 10
  if (wc > 90) score -= 10
  if (wc < 10) score -= 20

  score = Math.max(0, Math.min(90, Math.round(score)))

  return {
    wordCount: wc,
    withinRange,
    score,
  }
}

// POST /api/listening/attempts
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
    const parsed = ListeningAttemptBodySchema.safeParse(json)
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
      .from(listeningQuestions)
      .where(eq(listeningQuestions.id, questionId))
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

    // Score the attempt based on type
    let scores: any

    switch (type) {
      case 'multiple_choice_single': {
        const correctAnswer = Array.isArray(q.correctAnswers)
          ? q.correctAnswers[0]
          : (q.correctAnswers as any)?.answer || ''
        scores = scoreMultipleChoiceSingle(userResponse, correctAnswer)
        break
      }

      case 'multiple_choice_multiple': {
        const correctAnswers = Array.isArray(q.correctAnswers)
          ? q.correctAnswers
          : (q.correctAnswers as any)?.answers || []
        scores = scoreMultipleChoiceMultiple(userResponse, correctAnswers)
        break
      }

      case 'fill_in_blanks': {
        scores = scoreFillInBlanks(userResponse, q.correctAnswers)
        break
      }

      case 'highlight_correct_summary':
      case 'select_missing_word': {
        const correctAnswer = Array.isArray(q.correctAnswers)
          ? q.correctAnswers[0]
          : (q.correctAnswers as any)?.answer || ''
        scores = scoreMultipleChoiceSingle(userResponse, correctAnswer)
        break
      }

      case 'highlight_incorrect_words': {
        const correctIndices = Array.isArray(q.correctAnswers)
          ? q.correctAnswers
          : (q.correctAnswers as any)?.indices || []
        scores = scoreHighlightIncorrectWords(userResponse, correctIndices)
        break
      }

      case 'write_from_dictation': {
        const textAnswer = (userResponse as any).textAnswer || ''
        const transcript = q.transcript || ''
        scores = scoreWriteFromDictation(textAnswer, transcript)
        break
      }

      case 'summarize_spoken_text': {
        const textAnswer = (userResponse as any).textAnswer || ''
        scores = scoreSummarizeSpokenText(textAnswer)
        break
      }

      default:
        return error(400, 'Unsupported question type', 'UNSUPPORTED_TYPE')
    }

    // Persist attempt
    const [attempt] = await db
      .insert(listeningAttempts)
      .values({
        userId,
        questionId,
        userResponse: userResponse as any,
        scores: scores as any,
        timeTaken: timeTaken ?? null,
      })
      .returning()

    return NextResponse.json(
      {
        attempt,
        scores,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/listening/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// GET /api/listening/attempts?questionId=<id>&page=1&pageSize=25
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

    let whereConditions = [eq(listeningAttempts.userId, userId)]
    if (questionId) {
      whereConditions.push(eq(listeningAttempts.questionId, questionId))
    }

    const whereExpr = and(...whereConditions)

    // Get total count
    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(listeningAttempts)
      .where(whereExpr)
    const total = Number(countRows[0]?.count || 0)

    // Get attempts with question info
    const items = await db
      .select({
        id: listeningAttempts.id,
        userResponse: listeningAttempts.userResponse,
        scores: listeningAttempts.scores,
        timeTaken: listeningAttempts.timeTaken,
        createdAt: listeningAttempts.createdAt,
        question: {
          id: listeningQuestions.id,
          title: listeningQuestions.title,
          type: listeningQuestions.type,
          difficulty: listeningQuestions.difficulty,
        },
      })
      .from(listeningAttempts)
      .innerJoin(
        listeningQuestions,
        eq(listeningAttempts.questionId, listeningQuestions.id)
      )
      .where(whereExpr)
      .orderBy(desc(listeningAttempts.createdAt))
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
    console.error('[GET /api/listening/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

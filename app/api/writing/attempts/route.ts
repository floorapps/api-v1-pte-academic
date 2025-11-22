import { NextResponse } from 'next/server'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { writingAttempts, writingQuestions } from '@/lib/db/schema'
import { scoreWithOrchestrator } from '@/lib/ai/orchestrator'
import { TestSection } from '@/lib/pte/types'
import {
  basicLengthValidation,
  countWords,
  WritingAttemptBodySchema,
} from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

async function checkRateLimit(userId: string, maxPerHour = 30) {
  // DB-based soft rate limit in last hour
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(writingAttempts)
    .where(
      and(
        eq(writingAttempts.userId, userId),
        sql`${writingAttempts.createdAt} > now() - interval '1 hour'`
      )
    )
  const count = Number(rows[0]?.count || 0)
  return { count, allowed: count < maxPerHour }
}

// Light-weight metrics helpers
function sentenceCountOf(text: string): number {
  const cleaned = String(text || '').trim()
  if (!cleaned) return 0
  // naive: split on . ! ? (keep it simple)
  const parts = cleaned
    .split(/[.!?]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length
}

function uniqueWordRatio(text: string): number {
  const tokens = String(text || '')
    .toLowerCase()
    .replace(/[^a-zA-Z\u00C0-\u024F']+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!tokens.length) return 0
  const uniq = new Set(tokens)
  return uniq.size / tokens.length
}

function computeTotalScore(
  type: 'summarize_written_text' | 'write_essay',
  wordCount: number,
  withinRange: boolean
): number {
  // Basic scoring: mostly word count and length adherence
  // Start baseline, then adjust
  let total = withinRange ? 75 : 55

  // Gentle adjustments for extremes
  if (type === 'summarize_written_text') {
    if (wordCount < 10) total -= 5
    if (wordCount > 100) total -= 5
  } else {
    if (wordCount < 120) total -= 8
    if (wordCount > 520) total -= 8
  }

  // Clamp 0..90 (consistent with speaking score scale)
  total = Math.max(0, Math.min(90, Math.round(total)))
  return total
}

// POST /api/writing/attempts
export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Auth
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    // Validate content-type
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    // Validate body
    // Validate timing window (anti-tamper)
    const timingCheck = await validateTimingFromRequest(request, {
      graceMs: 2000,
    })
    if (!timingCheck.ok) {
      return error(timingCheck.status, timingCheck.message, timingCheck.code)
    }

    const json = await request.json()
    const parsed = WritingAttemptBodySchema.safeParse(json)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { questionId, type, textAnswer, timeTaken } = parsed.data

    // Rate limit
    const rl = await checkRateLimit(userId)
    if (!rl.allowed) {
      return error(
        429,
        'Rate limit exceeded: max 30 writing attempts per hour',
        'RATE_LIMITED'
      )
    }

    // Validate question
    const qRows = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.id, questionId))
      .limit(1)
    const q = qRows[0]
    if (!q) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }
    if (q.type !== type) {
      return error(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    }
    if (q.isActive === false) {
      return error(400, 'Question is not active', 'INACTIVE_QUESTION')
    }

    // Compute basic metrics
    const wc = countWords(textAnswer)
    const lengthCheck = basicLengthValidation(type, textAnswer)
    const sc = sentenceCountOf(textAnswer)
    const uwr = uniqueWordRatio(textAnswer)
    const charCount = String(textAnswer || '').length

    // Use AI orchestrator for scoring
    let scoresJson: Record<string, unknown> = {
      wordCount: wc,
      sentenceCount: sc,
      length: {
        min: lengthCheck.min,
        max: lengthCheck.max,
        withinRange: lengthCheck.withinRange,
      },
      metrics: {
        uniqueWordRatio: Number(uwr.toFixed(3)),
        charCount,
      },
    }

    let total = 0

    try {
      // Get question for prompt context
      const orchestratorResult = await scoreWithOrchestrator({
        section: TestSection.WRITING,
        questionType: type,
        payload: {
          text: textAnswer,
          prompt: q.promptText || q.title,
        },
        includeRationale: true,
        timeoutMs: 15000, // Writing may need more time
      })

      // Extract AI scores
      total = orchestratorResult.overall || 0
      const providerMeta = orchestratorResult.metadata?.providers?.[0]

      scoresJson = {
        ...scoresJson,
        // AI-powered subscores (0-90 scale)
        grammar: orchestratorResult.subscores?.grammar || null,
        vocabulary: orchestratorResult.subscores?.vocabulary || null,
        coherence: orchestratorResult.subscores?.coherence || null,
        content: orchestratorResult.subscores?.content || null,
        taskResponse: lengthCheck.withinRange ? 1 : 0,
        total,
        rationale: orchestratorResult.rationale,
        provider: {
          name: providerMeta?.provider,
          latencyMs: providerMeta?.latencyMs,
        },
      }
    } catch (err) {
      // Fallback to heuristic scoring
      total = computeTotalScore(type, wc, lengthCheck.withinRange)
      scoresJson.total = total
      scoresJson.grammar = null
      scoresJson.vocabulary = null
      scoresJson.coherence = null
      scoresJson.taskResponse = lengthCheck.withinRange ? 1 : 0
      scoresJson.error = err instanceof Error ? err.message : 'orchestrator_failed'
    }

    // Persist attempt
    const [attempt] = await db
      .insert(writingAttempts)
      .values({
        userId,
        questionId,
        userResponse: textAnswer,
        scores: scoresJson as any,
        timeTaken: timeTaken ?? null,
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
    console.error('[POST /api/writing/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// GET /api/writing/attempts?questionId=<id>&page=1&pageSize=25
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

    const whereParts = [eq(writingAttempts.userId, userId)]
    if (questionId) {
      whereParts.push(eq(writingAttempts.questionId, questionId))
    }
    const whereExpr = and(...whereParts)

    // Count
    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(writingAttempts)
      .where(whereExpr)
    const total = Number(countRows[0]?.count || 0)

    // Items with question meta
    const items = await db
      .select({
        id: writingAttempts.id,
        userResponse: writingAttempts.userResponse,
        scores: writingAttempts.scores,
        timeTaken: writingAttempts.timeTaken,
        createdAt: writingAttempts.createdAt,
        question: {
          id: writingQuestions.id,
          title: writingQuestions.title,
          type: writingQuestions.type,
          difficulty: writingQuestions.difficulty,
        },
      })
      .from(writingAttempts)
      .innerJoin(
        writingQuestions,
        eq(writingAttempts.questionId, writingQuestions.id)
      )
      .where(whereExpr)
      .orderBy(desc(writingAttempts.createdAt))
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
    console.error('[GET /api/writing/attempts]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

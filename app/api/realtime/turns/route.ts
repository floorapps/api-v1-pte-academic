import 'server-only'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import {
  conversationSessions,
  conversationTurns,
  type ConversationTurn,
} from '@/lib/db/schema'
import { trackRealtimeUsage } from '@/lib/ai/credit-tracker'
import { z } from 'zod'

export const maxDuration = 60

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

const TurnSchema = z.object({
  sessionId: z.string().uuid(),
  turnIndex: z.number().int().min(0),
  role: z.enum(['user', 'assistant', 'system']),
  audioUrl: z.string().url().optional(),
  transcript: z.string(),
  scores: z.record(z.any()).optional(),
  durationMs: z.number().int().min(0).optional(),
  wordsPerMinute: z.string().optional(),
  pauseCount: z.number().int().min(0).optional(),
  fillerWordCount: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional(),
})

const SaveTurnsSchema = z.object({
  sessionId: z.string().uuid(),
  turns: z.array(TurnSchema),
  sessionStatus: z.enum(['completed', 'abandoned', 'error']).optional(),
  tokenUsage: z.record(z.any()).optional(),
})

// POST /api/realtime/turns
// Saves conversation turns to database
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
    const json = await request.json()
    const parsed = SaveTurnsSchema.safeParse(json)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }

    const { sessionId, turns, sessionStatus, tokenUsage } = parsed.data

    // Verify session belongs to user
    const [conversationSession] = await db
      .select()
      .from(conversationSessions)
      .where(eq(conversationSessions.id, sessionId))
      .limit(1)

    if (!conversationSession) {
      return error(404, 'Session not found', 'NOT_FOUND')
    }

    if (conversationSession.userId !== userId) {
      return error(403, 'Forbidden', 'FORBIDDEN')
    }

    // Save turns
    const savedTurns: ConversationTurn[] = []
    for (const turn of turns) {
      const [saved] = await db
        .insert(conversationTurns)
        .values({
          sessionId,
          turnIndex: turn.turnIndex,
          role: turn.role as any,
          audioUrl: turn.audioUrl,
          transcript: turn.transcript,
          scores: turn.scores as any,
          durationMs: turn.durationMs,
          wordsPerMinute: turn.wordsPerMinute,
          pauseCount: turn.pauseCount,
          fillerWordCount: turn.fillerWordCount,
          metadata: turn.metadata as any,
        })
        .returning()
      savedTurns.push(saved)
    }

    // Update session status
    const totalDurationMs = turns.reduce(
      (acc, t) => acc + (t.durationMs || 0),
      0
    )
    await db
      .update(conversationSessions)
      .set({
        status: sessionStatus || 'completed',
        endedAt: new Date(),
        totalTurns: turns.length,
        totalDurationMs,
        tokenUsage: tokenUsage as any,
      })
      .where(eq(conversationSessions.id, sessionId))

    // Track AI credit usage
    const audioSeconds = totalDurationMs / 1000
    const inputTokens = (tokenUsage as any)?.input_tokens || 0
    const outputTokens = (tokenUsage as any)?.output_tokens || 0

    await trackRealtimeUsage({
      userId,
      sessionId,
      audioSeconds,
      inputTokens,
      outputTokens,
      metadata: {
        totalTurns: turns.length,
        sessionStatus: sessionStatus || 'completed',
      },
    })

    return NextResponse.json(
      {
        sessionId,
        savedTurns: savedTurns.length,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/realtime/turns]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

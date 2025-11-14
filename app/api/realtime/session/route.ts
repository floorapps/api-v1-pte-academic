import 'server-only'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { conversationSessions } from '@/lib/db/schema'
import OpenAI from 'openai'

export const maxDuration = 60

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

// POST /api/realtime/session
// Creates a new OpenAI Realtime session and returns ephemeral token
export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Auth
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    // Parse request body for session type
    const body = await request.json().catch(() => ({}))
    const sessionType = body.sessionType || 'customer_support'
    const metadata = body.metadata || {}

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Create ephemeral session token for Realtime API
    const realtimeSession = await openai.beta.realtime.sessions.create({
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'verse',
    })

    // Create conversation session in database
    const [conversationSession] = await db
      .insert(conversationSessions)
      .values({
        userId,
        sessionType: sessionType as any,
        status: 'active',
        startedAt: new Date(),
        aiProvider: 'openai',
        modelUsed: 'gpt-4o-realtime-preview-2024-12-17',
        metadata: metadata as any,
      })
      .returning()

    return NextResponse.json(
      {
        sessionId: conversationSession.id,
        realtimeToken: realtimeSession.client_secret.value,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('[POST /api/realtime/session]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

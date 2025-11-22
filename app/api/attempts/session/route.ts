import 'server-only'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export const preferredRegion = 'auto'
export const maxDuration = 60

// Types
type PteSection = 'speaking' | 'writing' | 'reading' | 'listening'

type PostBody = {
  section: PteSection
  questionType?: string
  questionId: string
  durationMs: number
  startDelayMs?: number // optional delay before start (e.g., audio length)
}

type SessionClaims = {
  sessionId: string
  userId: string
  section: PteSection
  questionType?: string
  questionId: string
  startAt: number // epoch ms
  endAt: number // epoch ms
  iat: number // issued at (serverNow epoch ms)
  v: 1 // version
}

// Utilities
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function getSecret(): string {
  const s = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || ''
  if (!s) {
     
    console.warn(
      '[attempts/session] Missing AUTH_SECRET. Falling back to non-secret dev key.'
    )
    return 'dev-secret-not-for-production'
  }
  return s
}

async function hmacSha256(input: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(input))
  const bytes = new Uint8Array(sig)
  return base64url(bytes)
}

function base64url(bytes: Uint8Array | string): string {
  const s =
    typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('base64')
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64').toString('utf8')
}

function safeJson<T = unknown>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function error(status: number, message: string, code?: string) {
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}) },
    { status }
  )
}

// Create signed token from claims
async function signClaims(claims: SessionClaims): Promise<string> {
  const json = JSON.stringify(claims)
  const payload = base64url(json)
  const sig = await hmacSha256(payload, getSecret())
  return `${payload}.${sig}`
}

// Verify token, return claims if valid
async function verifyToken(token: string): Promise<SessionClaims | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = await hmacSha256(payload, getSecret())
  if (sig !== expected) return null

  try {
    const json = fromBase64url(payload)
    const claims = JSON.parse(json) as SessionClaims
    if (!claims || typeof claims !== 'object') return null
    // Basic shape validation
    if (
      !claims.sessionId ||
      !claims.userId ||
      !claims.section ||
      !claims.questionId ||
      typeof claims.startAt !== 'number' ||
      typeof claims.endAt !== 'number' ||
      typeof claims.iat !== 'number'
    ) {
      return null
    }
    return claims
  } catch {
    return null
  }
}

// POST /api/attempts/session
// Body: { section, questionType?, questionId, durationMs, startDelayMs? }
export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    const json = (await request.json()) as PostBody
    if (!json || typeof json !== 'object') {
      return error(400, 'Invalid JSON body', 'BAD_REQUEST')
    }

    const section = String(json.section || '').toLowerCase() as PteSection
    if (!['speaking', 'writing', 'reading', 'listening'].includes(section)) {
      return error(400, 'Invalid section', 'BAD_REQUEST')
    }

    const questionId = String(json.questionId || '').trim()
    if (!questionId) {
      return error(400, 'questionId is required', 'BAD_REQUEST')
    }

    const durationMsRaw = Number(json.durationMs)
    if (!Number.isFinite(durationMsRaw) || durationMsRaw <= 0) {
      return error(400, 'durationMs must be a positive number', 'BAD_REQUEST')
    }

    // Guardrails on duration
    // Speaking items typically <= 2 minutes; Writing up to 20m; Reading/Listening section timers up to 60m.
    // We allow up to 3 hours as a hard cap to avoid abuse.
    const durationMs = clamp(
      Math.floor(durationMsRaw),
      1000,
      3 * 60 * 60 * 1000
    )
    const startDelayMs = clamp(
      Math.floor(Number(json.startDelayMs || 0)),
      0,
      15 * 60 * 1000
    )

    const serverNow = Date.now()
    const startAt = serverNow + startDelayMs
    const endAt = startAt + durationMs

    const claims: SessionClaims = {
      sessionId: crypto.randomUUID(),
      userId,
      section,
      questionType: json.questionType
        ? String(json.questionType).toLowerCase()
        : undefined,
      questionId,
      startAt,
      endAt,
      iat: serverNow,
      v: 1,
    }

    const token = await signClaims(claims)

    // Note: We do not persist sessions in DB to avoid schema migration here.
    // Anti-tamper is enforced via HMAC signature and server-side validation on GET/submit.

    return NextResponse.json(
      {
        sessionId: claims.sessionId,
        serverNow,
        startAt,
        endAt,
        token,
      },
      { status: 201 }
    )
  } catch (e) {
     
    console.error('[POST /api/attempts/session]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// GET /api/attempts/session?token=...
// Returns authoritative times and session metadata if token is valid and belongs to current user
export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const userId = session.user.id

    const url = new URL(request.url)
    const token =
      url.searchParams.get('token') ||
      request.headers.get('x-session-token') ||
      ''

    const claims = await verifyToken(token || '')
    if (!claims) {
      return error(400, 'Invalid session token', 'INVALID_TOKEN')
    }

    if (claims.userId !== userId) {
      return error(403, 'Forbidden: token mismatch', 'FORBIDDEN')
    }

    const serverNow = Date.now()

    return NextResponse.json(
      {
        sessionId: claims.sessionId,
        serverNow,
        startAt: claims.startAt,
        endAt: claims.endAt,
        section: claims.section,
        questionType: claims.questionType,
        questionId: claims.questionId,
        token, // echo
      },
      { status: 200 }
    )
  } catch (e) {
     
    console.error('[GET /api/attempts/session]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// Helper to validate timing windows from token (can be reused by other routes)
/**
 * validateTimingFromRequest
 * - Extracts x-session-token header
 * - Verifies signature and user ownership
 * - Validates that serverNow is within [startAt, endAt]
 * - Optional graceMs to allow submission within small grace period
 */
async function validateTimingFromRequest(
  request: Request,
  opts?: { graceMs?: number }
): Promise<
  | { ok: true; claims: SessionClaims; serverNow: number }
  | { ok: false; status: number; message: string; code?: string }
> {
  const session = await getSession()
  if (!session?.user?.id) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    }
  }
  const userId = session.user.id

  const token =
    request.headers.get('x-session-token') ||
    new URL(request.url).searchParams.get('token') ||
    ''

  const claims = await verifyToken(token || '')
  if (!claims) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid session token',
      code: 'INVALID_TOKEN',
    }
  }

  if (claims.userId !== userId) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden: token mismatch',
      code: 'FORBIDDEN',
    }
  }

  const serverNow = Date.now()
  const grace = clamp(Math.floor(opts?.graceMs ?? 1000), 0, 30_000)

  if (serverNow + grace < claims.startAt) {
    return {
      ok: false,
      status: 422,
      message: 'Session has not started yet',
      code: 'NOT_STARTED',
    }
  }
  if (serverNow - grace > claims.endAt) {
    return {
      ok: false,
      status: 422,
      message: 'Session has expired',
      code: 'EXPIRED',
    }
  }

  return { ok: true, claims, serverNow }
}

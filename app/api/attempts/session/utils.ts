import 'server-only'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export type SessionClaims = {
  sessionId: string
  userId: string
  section: 'speaking' | 'writing' | 'reading' | 'listening'
  questionType?: string
  questionId: string
  startAt: number // epoch ms
  endAt: number // epoch ms
  iat: number // issued at (serverNow epoch ms)
  v: 1 // version
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

async function verifyToken(token: string): Promise<SessionClaims | null> {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  if (!payload || !sig) return null

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  function fromBase64url(str: string): string {
    return decoder.decode(
      new Uint8Array(
        atob(str.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => c.charCodeAt(0))
      )
    )
  }

  async function hmacSha256(input: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(input)
    )
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

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

/**
 * validateTimingFromRequest
 * - Extracts x-session-token header
 * - Verifies signature and user ownership
 * - Validates that serverNow is within [startAt, endAt]
 * - Optional graceMs to allow submission within small grace period
 */
export async function validateTimingFromRequest(
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
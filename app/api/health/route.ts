import 'server-only'
import { NextResponse } from 'next/server'
import { GeminiProvider } from '@/lib/ai/providers/gemini'
import { OpenAIProvider } from '@/lib/ai/providers/openai'
import { VercelAIProvider } from '@/lib/ai/providers/vercel'

export async function GET() {
  const startedAt = Date.now()

  const providers = [
    new OpenAIProvider(),
    new GeminiProvider(),
    new VercelAIProvider(),
  ]

  const results = await Promise.allSettled(providers.map((p) => p.health()))

  const health = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    const provider = ['openai', 'gemini', 'vercel'][i] as
      | 'openai'
      | 'gemini'
      | 'vercel'
    return {
      provider,
      ok: false,
      error: (r.reason as Error)?.message ?? 'unknown_error',
    }
  })

  const ok = health.every((h) => h.ok)

  const body = {
    ok,
    version: '1',
    uptimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
    providers: health,
  } as const

  const status = ok ? 200 : 503
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  })
}

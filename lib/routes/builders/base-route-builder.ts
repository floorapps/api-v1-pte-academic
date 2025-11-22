import { z } from 'zod'
import type { RouteHandler } from '@/lib/routes/types'

export type Middleware = (req: Request) => Promise<void> | void

export class BaseRouteBuilder {
  private middlewares: Middleware[] = []

  use(mw: Middleware) {
    this.middlewares.push(mw)
    return this
  }

  validate<T>(schema: z.ZodSchema<T>) {
    return async (req: Request): Promise<T> => {
      const body = await req.json().catch(() => undefined)
      const res = schema.safeParse(body)
      if (!res.success) {
        const message = res.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')
        return Promise.reject(Object.assign(new Error(message), { code: 'invalid_request' }))
      }
      return res.data
    }
  }

  build(handler: RouteHandler): RouteHandler {
    return async (req: Request) => {
      const t0 = Date.now()
      try {
        for (const mw of this.middlewares) await mw(req)
        const res = await handler(req)
        const headers = new Headers(res.headers)
        headers.set('x-duration-ms', String(Date.now() - t0))
        headers.set('cache-control', 'no-store')
        return new Response(res.body, { status: res.status, headers })
      } catch (e: any) {
        const code = e?.code === 'invalid_request' ? 400 : 500
        return new Response(JSON.stringify({ error: { code: e?.code || 'internal_error', message: e?.message || 'Unexpected error' }, meta: { durationMs: Date.now() - t0 } }), {
          status: code,
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        })
      }
    }
  }
}
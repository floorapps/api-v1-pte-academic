import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { listeningQuestions } from '@/lib/db/schema'
import { ListeningListQuerySchema, normalizeDifficulty } from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const parsed = ListeningListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    )
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }

    const {
      type,
      page,
      pageSize,
      search = '',
      isActive = true,
      sortBy,
      sortOrder,
    } = parsed.data
    const difficulty = normalizeDifficulty(parsed.data.difficulty)

    const conditions: any[] = [eq(listeningQuestions.type, type)]
    if (typeof isActive === 'boolean')
      conditions.push(eq(listeningQuestions.isActive, isActive))
    if (difficulty !== 'All')
      conditions.push(eq(listeningQuestions.difficulty, difficulty))

    if (search) {
      const pattern = `%${search}%`
      conditions.push(
        sql`( ${listeningQuestions.title} ILIKE ${pattern} OR ${listeningQuestions.promptText} ILIKE ${pattern} )`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const countRows = await (whereExpr
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(listeningQuestions)
          .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(listeningQuestions))
    const total = Number(countRows[0]?.count || 0)

    const orderBy =
      sortOrder === 'asc'
        ? asc(listeningQuestions[sortBy])
        : desc(listeningQuestions[sortBy])

    const baseSelect = db.select().from(listeningQuestions)
    const items = await (whereExpr ? baseSelect.where(whereExpr) : baseSelect)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const res = NextResponse.json(
      {
        page,
        pageSize,
        total,
        items,
      },
      { status: 200 }
    )
    res.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=600'
    )
    return res
  } catch (e) {
    console.error('[GET /api/listening/questions]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

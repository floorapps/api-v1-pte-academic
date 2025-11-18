import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { readingQuestions } from '@/lib/db/schema'
import { normalizeDifficulty, ReadingListQuerySchema } from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const parsed = ReadingListQuerySchema.safeParse(
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

    const conditions: any[] = [eq(readingQuestions.type, type)]
    if (typeof isActive === 'boolean')
      conditions.push(eq(readingQuestions.isActive, isActive))
    if (difficulty !== 'All')
      conditions.push(eq(readingQuestions.difficulty, difficulty))

    if (search) {
      const pattern = `%${search}%`
      conditions.push(
        sql`( ${readingQuestions.title} ILIKE ${pattern} OR ${readingQuestions.promptText} ILIKE ${pattern} )`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const countRows = await (whereExpr
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(readingQuestions)
          .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(readingQuestions))
    const total = Number(countRows[0]?.count || 0)

    const orderBy =
      sortOrder === 'asc'
        ? asc(readingQuestions[sortBy])
        : desc(readingQuestions[sortBy])

    const baseSelect = db.select().from(readingQuestions)
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
    console.error('[GET /api/reading/questions]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

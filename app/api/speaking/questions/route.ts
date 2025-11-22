import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql, getTableColumns } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { speakingQuestions, speakingAttempts } from '@/lib/db/schema'
import { normalizeDifficulty, SpeakingListQuerySchema } from '../schemas'
import { getSession } from '@/lib/auth/server'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    const userId = session?.user?.id

    const parsed = SpeakingListQuerySchema.safeParse(
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

    const conditions: any[] = [eq(speakingQuestions.type, type)]
    if (typeof isActive === 'boolean')
      conditions.push(eq(speakingQuestions.isActive, isActive))
    if (difficulty !== 'All')
      conditions.push(eq(speakingQuestions.difficulty, difficulty))

    if (search) {
      const pattern = `%${search}%`
      // Prefer Postgres ILIKE; for SQLite compatibility, use LOWER(...) LIKE LOWER(...)
      conditions.push(
        sql`( ${speakingQuestions.title} ILIKE ${pattern} OR ${speakingQuestions.promptText} ILIKE ${pattern} )`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const countRows = await (whereExpr
      ? db
        .select({ count: sql<number>`count(*)` })
        .from(speakingQuestions)
        .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(speakingQuestions))
    const total = Number(countRows[0]?.count || 0)

    const orderBy =
      sortOrder === 'asc'
        ? asc(speakingQuestions[sortBy])
        : desc(speakingQuestions[sortBy])

    // Select all columns plus the practiced count subquery
    const baseSelect = db
      .select({
        ...getTableColumns(speakingQuestions),
        practicedCount: userId
          ? sql<number>`(
              SELECT count(*) 
              FROM ${speakingAttempts} 
              WHERE ${speakingAttempts.questionId} = ${speakingQuestions.id} 
              AND ${speakingAttempts.userId} = ${userId}
            )`.mapWith(Number)
          : sql<number>`0`.mapWith(Number),
      })
      .from(speakingQuestions)

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
    // Reduce cache time since practiced status is user-specific
    res.headers.set(
      'Cache-Control',
      'private, max-age=0, no-cache, no-store, must-revalidate'
    )
    return res
  } catch (e) {
    console.error('[GET /api/speaking/questions]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

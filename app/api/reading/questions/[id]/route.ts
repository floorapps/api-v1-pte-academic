import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { readingQuestions } from '@/lib/db/schema'
import { ReadingIdParamsSchema } from '../../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()

  try {
    const params = await ctx.params
    const parsed = ReadingIdParamsSchema.safeParse(params)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { id } = parsed.data

    // 1) Fetch question
    const rows = await db
      .select()
      .from(readingQuestions)
      .where(eq(readingQuestions.id, id))
      .limit(1)
    const question = rows[0]
    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    // 2) Compute prev/next within same type ordered by createdAt, id (ASC)
    // Convert Date to ISO string for SQL comparison
    const createdAtISO =
      question.createdAt instanceof Date
        ? question.createdAt.toISOString()
        : question.createdAt
    const prevRow = await db
      .select({ id: readingQuestions.id })
      .from(readingQuestions)
      .where(
        and(
          eq(readingQuestions.type, question.type),
          sql`(${readingQuestions.createdAt} < ${createdAtISO} OR (${readingQuestions.createdAt} = ${createdAtISO} AND ${readingQuestions.id} < ${question.id}))`
        )
      )
      .orderBy(desc(readingQuestions.createdAt), desc(readingQuestions.id))
      .limit(1)

    const nextRow = await db
      .select({ id: readingQuestions.id })
      .from(readingQuestions)
      .where(
        and(
          eq(readingQuestions.type, question.type),
          sql`(${readingQuestions.createdAt} > ${createdAtISO} OR (${readingQuestions.createdAt} = ${createdAtISO} AND ${readingQuestions.id} > ${question.id}))`
        )
      )
      .orderBy(asc(readingQuestions.createdAt), asc(readingQuestions.id))
      .limit(1)

    const res = NextResponse.json(
      {
        question,
        prevId: prevRow[0]?.id ?? null,
        nextId: nextRow[0]?.id ?? null,
      },
      { status: 200 }
    )
    res.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=600'
    )
    return res
  } catch (e) {
    console.error('[GET /api/reading/questions/[id]]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

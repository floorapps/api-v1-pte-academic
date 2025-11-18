import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import { WritingIdParamsSchema } from '../../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

// GET /api/writing/questions/[id]
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()

  try {
    const params = await ctx.params
    const parsed = WritingIdParamsSchema.safeParse(params)
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
      .from(writingQuestions)
      .where(eq(writingQuestions.id, id))
      .limit(1)
    const question = rows[0]
    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    console.log('Fetched question:', { id: question.id, createdAt: question.createdAt, type: typeof question.createdAt })
    const createdAtStr = question.createdAt.toISOString()
    console.log('createdAtStr:', createdAtStr)

    // 2) Compute prev/next within same type ordered by createdAt, id
    console.log('About to run prev query')
    const prevRow = await db
      .select({ id: writingQuestions.id })
      .from(writingQuestions)
      .where(
        and(
          eq(writingQuestions.type, question.type),
          sql`(${writingQuestions.createdAt} < ${createdAtStr} OR (${writingQuestions.createdAt} = ${createdAtStr} AND ${writingQuestions.id} < ${question.id}))`
        )
      )
      .orderBy(desc(writingQuestions.createdAt), desc(writingQuestions.id))
      .limit(1)

   console.log('Prev query done, about to run next query')
   const nextRow = await db
      .select({ id: writingQuestions.id })
      .from(writingQuestions)
      .where(
        and(
          eq(writingQuestions.type, question.type),
          sql`(${writingQuestions.createdAt} > ${createdAtStr} OR (${writingQuestions.createdAt} = ${createdAtStr} AND ${writingQuestions.id} > ${question.id}))`
        )
      )
      .orderBy(asc(writingQuestions.createdAt), asc(writingQuestions.id))
      .limit(1)

   console.log('Next query done, about to create response')
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
    console.error('[GET /api/writing/questions/[id]]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { speakingQuestions } from '@/lib/db/schema'
import { SpeakingIdParamsSchema } from '../../schemas'

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
    const parsed = SpeakingIdParamsSchema.safeParse(params)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { id } = parsed.data

    console.log(`[API] Fetching speaking question with ID: ${id}`)
    // 1) Fetch question
    const rows = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.id, id))
      .limit(1)
    const question = rows[0]
    if (!question) {
      console.log(`[API] Question not found for ID: ${id}`)
      return error(404, 'Question not found', 'NOT_FOUND')
    }
    console.log(`[API] Question found: ${question.id}, type: ${question.type}`)
    console.log(`[API] Question isActive: ${question.isActive}`)

    // 2) Compute prev/next within same type ordered by createdAt, id (ASC)
    // Convert Date to ISO string for SQL comparison
    const createdAtISO =
      question.createdAt instanceof Date
        ? question.createdAt.toISOString()
        : question.createdAt

    const prevRow = await db
      .select({ id: speakingQuestions.id })
      .from(speakingQuestions)
      .where(
        and(
          eq(speakingQuestions.type, question.type),
          sql`(${speakingQuestions.createdAt} < ${createdAtISO} OR (${speakingQuestions.createdAt} = ${createdAtISO} AND ${speakingQuestions.id} < ${question.id}))`
        )
      )
      .orderBy(desc(speakingQuestions.createdAt), desc(speakingQuestions.id))
      .limit(1)

    const nextRow = await db
      .select({ id: speakingQuestions.id })
      .from(speakingQuestions)
      .where(
        and(
          eq(speakingQuestions.type, question.type),
          sql`(${speakingQuestions.createdAt} > ${createdAtISO} OR (${speakingQuestions.createdAt} = ${createdAtISO} AND ${speakingQuestions.id} > ${question.id}))`
        )
      )
      .orderBy(asc(speakingQuestions.createdAt), asc(speakingQuestions.id))
      .limit(1)

    // Serialize the question object to handle Date fields
    const serializedQuestion = {
      ...question,
      createdAt:
        question.createdAt instanceof Date
          ? question.createdAt.toISOString()
          : question.createdAt,
    }

    const res = NextResponse.json(
      {
        question: serializedQuestion,
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
    console.error('[GET /api/speaking/questions/[id]]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

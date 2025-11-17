import { NextResponse } from 'next/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import {
  normalizeDifficulty,
  WritingListQuerySchema,
  WritingQuestionTypeSchema,
} from '../schemas'

type JsonError = { error: string; code?: string }

function error(status: number, message: string, code?: string) {
  const body: JsonError = { error: message, ...(code ? { code } : {}) }
  return NextResponse.json(body, { status })
}

// GET /api/writing/questions
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const parsed = WritingListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    )
    if (!parsed.success) {
      console.log('[DEBUG GET /api/writing/questions]', { requestId, validationError: parsed.error.issues })
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }

    const { type, page, pageSize, search = '', isActive = true } = parsed.data
    const difficulty = normalizeDifficulty(parsed.data.difficulty)

    console.log('[DEBUG GET /api/writing/questions]', { requestId, type, page, pageSize, search, isActive, difficulty })

    const conditions: any[] = [eq(writingQuestions.type, type)]
    if (typeof isActive === 'boolean')
      conditions.push(eq(writingQuestions.isActive, isActive))
    if (difficulty !== 'All')
      conditions.push(eq(writingQuestions.difficulty, difficulty))

    if (search) {
      const pattern = `%${search}%`
      conditions.push(
        sql`( ${writingQuestions.title} ILIKE ${pattern} OR ${writingQuestions.promptText} ILIKE ${pattern} )`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    console.log('[DEBUG GET /api/writing/questions]', { requestId, conditions, whereExpr })

    const countRows = await (whereExpr
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(writingQuestions)
          .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(writingQuestions))
    const total = Number(countRows[0]?.count || 0)

    console.log('[DEBUG GET /api/writing/questions]', { requestId, total })

    const baseSelect = db.select().from(writingQuestions)
    const items = await (whereExpr ? baseSelect.where(whereExpr) : baseSelect)
      .orderBy(desc(writingQuestions.createdAt), desc(writingQuestions.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    console.log('[DEBUG GET /api/writing/questions]', { requestId, itemsCount: items.length })

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
    console.error('[GET /api/writing/questions]', { requestId, error: e, stack: e?.stack })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// POST /api/writing/questions (admin only)
const CreateWritingQuestionSchema = z.object({
  title: z.string().min(1),
  type: WritingQuestionTypeSchema,
  promptText: z.string().min(1),
  options: z.any().optional().nullable(),
  answerKey: z.any().optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium').optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    // Simple role check - requires 'admin'
    const role = (session.user as any).role || 'student'
    if (role !== 'admin') {
      return error(403, 'Forbidden', 'FORBIDDEN')
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return error(
        415,
        'Content-Type must be application/json',
        'UNSUPPORTED_MEDIA_TYPE'
      )
    }

    const json = await request.json()
    const parsed = CreateWritingQuestionSchema.safeParse(json)
    if (!parsed.success) {
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }

    const {
      title,
      type,
      promptText,
      options = null,
      answerKey = null,
      difficulty = 'Medium',
      tags = [],
      isActive = true,
    } = parsed.data

    // Optional idempotency: skip insert if existing (type, title)
    const exists = await db
      .select({ id: writingQuestions.id })
      .from(writingQuestions)
      .where(
        and(eq(writingQuestions.type, type), eq(writingQuestions.title, title))
      )
      .limit(1)

    if (exists.length) {
      return NextResponse.json(
        { id: exists[0].id, created: false },
        { status: 200 }
      )
    }

    const [row] = await db
      .insert(writingQuestions)
      .values({
        type,
        title: title.trim(),
        promptText,
        options,
        answerKey,
        difficulty,
        tags,
        isActive,
      })
      .returning()

    return NextResponse.json({ id: row.id, created: true }, { status: 201 })
  } catch (e) {
    console.error('[POST /api/writing/questions]', { requestId, error: e })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

import { NextResponse } from 'next/server'
import 'server-only'
import { and, eq, sql, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { pteQuestions } from '@/lib/db/schema'

// Shared pagination type
type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

function toNumber(v: string | null, def: number) {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def
}

// GET /api/pte-practice/questions
// Query params:
//   section?: 'speaking' | 'writing' | 'reading' | 'listening'
//   type?: questionType code e.g. 's_read_aloud'
//   difficulty?: 'easy' | 'medium' | 'hard'
//   search?: string (matches question text)
//   page?: number (default 1)
//   limit?: number (default 20)
//   sort?: 'newest' | 'oldest' (default newest)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const section = searchParams.get('section')?.toLowerCase() || null
    const type =
      searchParams.get('type') || searchParams.get('questionType') || null
    const difficulty = searchParams.get('difficulty')?.toLowerCase() || null
    const search = searchParams.get('search') || null

    const page = toNumber(searchParams.get('page'), 1)
    const limit = Math.min(toNumber(searchParams.get('limit'), 20), 100)
    const sort = (searchParams.get('sort') || 'newest').toLowerCase()

    // Build conditions array with precise Drizzle SQL wrappers
    const conditions: Array<ReturnType<typeof eq> | SQL> = []

    if (section) conditions.push(eq(pteQuestions.section, section))
    if (type) conditions.push(eq(pteQuestions.questionType, type))
    if (difficulty) conditions.push(eq(pteQuestions.difficulty, difficulty))

    // For search across question text and questionData.text (if present)
    if (search) {
      // Use ILIKE against concatenated fields
      const pattern = `%${search}%`
      conditions.push(
        sql`(${pteQuestions.question} ILIKE ${pattern} OR CAST(${pteQuestions.questionData} AS TEXT) ILIKE ${pattern})`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    // Total count (avoid reassign to satisfy Drizzle's typing)
    const countRows = await (whereExpr
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(pteQuestions)
          .where(whereExpr)
      : db.select({ count: sql<number>`count(*)` }).from(pteQuestions))
    const [{ count }] = countRows

    // Data page (avoid reassign to satisfy Drizzle's typing)
    const baseRowsQuery = db
      .select({
        id: pteQuestions.id,
        question: pteQuestions.question,
        questionType: pteQuestions.questionType,
        section: pteQuestions.section,
        difficulty: pteQuestions.difficulty,
        questionData: pteQuestions.questionData,
        tags: pteQuestions.tags,
        createdAt: pteQuestions.createdAt,
        externalId: pteQuestions.externalId,
        source: pteQuestions.source,
      })
      .from(pteQuestions)

    const rows = await (
      whereExpr ? baseRowsQuery.where(whereExpr) : baseRowsQuery
    )
      .orderBy(
        sort === 'oldest'
          ? pteQuestions.createdAt
          : sql`(${pteQuestions.createdAt}) DESC`
      )
      .limit(limit)
      .offset((page - 1) * limit)

    const result: Paginated<(typeof rows)[number]> = {
      items: rows,
      page,
      pageSize: limit,
      total: Number(count || 0),
    }

    return NextResponse.json(result, { status: 200 })
  } catch (e: unknown) {
    console.error('[GET /api/pte-practice/questions] error', e)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/pte-practice/questions
// Body (JSON): minimal shape to create a local question
// {
//   question: string,
//   questionType: string,     // e.g., 's_read_aloud'
//   section: string,          // 'speaking' | 'writing' | 'reading' | 'listening'
//   difficulty?: 'easy' | 'medium' | 'hard',
//   questionData?: object,
//   tags?: string[]
// }
export async function POST(request: Request) {
  try {
    // In production, enforce admin authorization here.
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      )
    }

    const body = await request.json()
    const {
      question,
      questionType,
      section,
      difficulty = 'medium',
      questionData = null,
      tags = null,
      points = 1,
      orderIndex = 0,
      source = 'local',
      externalId = null,
    } = body || {}

    if (!question || !questionType || !section) {
      return NextResponse.json(
        { error: 'Missing required fields: question, questionType, section' },
        { status: 400 }
      )
    }

    const [created] = await db
      .insert(pteQuestions)
      .values({
        testId: null,
        question,
        questionType,
        section: String(section).toLowerCase(),
        questionData,
        tags,
        difficulty: String(difficulty).toLowerCase(),
        points,
        orderIndex,
        source,
        externalId,
      })
      .returning()

    return NextResponse.json(created, { status: 201 })
  } catch (e: unknown) {
    console.error('[POST /api/pte-practice/questions] error', e)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

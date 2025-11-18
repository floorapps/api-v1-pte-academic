import { NextResponse } from 'next/server'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getSession } from '@/lib/auth/session'
import { getUserProfile } from '@/lib/db/queries'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import {
  normalizeDifficulty,
  WritingListQuerySchema,
  WritingQuestionTypeSchema,
} from '../schemas'
import { logActivity } from '@/lib/db/queries'
import { revalidateCacheTags } from '@/lib/revalidate'
import { CacheTags } from '@/lib/cache'

type JsonError = { error: string; code?: string }

// Define proper session interface with role
interface SessionUser {
  id: string
  role: string
}

interface SessionData {
  user: SessionUser
  expires: string
}

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
      console.error('[GET /api/writing/questions] Validation failed', {
        requestId,
        errors: parsed.error.issues
      })
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'VALIDATION_ERROR'
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

    // Improved type safety for conditions array
    const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof sql>> = [
      eq(writingQuestions.type, type)
    ]

    if (typeof isActive === 'boolean') {
      conditions.push(eq(writingQuestions.isActive, isActive))
    }

    if (difficulty !== 'All') {
      conditions.push(eq(writingQuestions.difficulty, difficulty))
    }

    // Use parameterized queries for search to prevent SQL injection
    if (search.trim()) {
      const sanitizedSearch = search.trim()
      conditions.push(
        sql`${writingQuestions.title} ILIKE ${`%${sanitizedSearch}%`} OR ${writingQuestions.promptText} ILIKE ${`%${sanitizedSearch}%`}`
      )
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const orderBy =
      sortOrder === 'asc'
        ? asc(writingQuestions[sortBy])
        : desc(writingQuestions[sortBy])

    // Combine count and select queries for better performance using window function
    const result = await db
      .select({
        // Select all question fields
        id: writingQuestions.id,
        type: writingQuestions.type,
        title: writingQuestions.title,
        promptText: writingQuestions.promptText,
        options: writingQuestions.options,
        answerKey: writingQuestions.answerKey,
        difficulty: writingQuestions.difficulty,
        tags: writingQuestions.tags,
        isActive: writingQuestions.isActive,
        createdAt: writingQuestions.createdAt,
        // Get total count using window function
        total: sql<number>`count(*) over ()`.as('total')
      })
      .from(writingQuestions)
      .where(whereExpr)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    const total = result.length > 0 ? result[0].total : 0
    const items = result.map(({ total: _, ...item }) => item)

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
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    const errorStack = e instanceof Error ? e.stack : undefined
    console.error('[GET /api/writing/questions]', { requestId, error: errorMessage, stack: errorStack })
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

// Define specific schemas for options and answerKey based on question types
const SummarizeWrittenTextOptionsSchema = z.object({
  wordLimit: z.number().min(1).max(100).optional(),
}).optional()

const WriteEssayOptionsSchema = z.object({
  wordLimit: z.number().min(100).max(500).optional(),
  timeLimit: z.number().min(1).max(60).optional(), // minutes
}).optional()

const SummarizeWrittenTextAnswerKeySchema = z.object({
  sampleAnswer: z.string().min(1).max(1000).optional(),
  keyPoints: z.array(z.string()).optional(),
}).optional()

const WriteEssayAnswerKeySchema = z.object({
  sampleAnswer: z.string().min(1).max(5000).optional(),
  gradingCriteria: z.object({
    content: z.number().min(0).max(5),
    form: z.number().min(0).max(5),
    grammar: z.number().min(0).max(5),
    vocabulary: z.number().min(0).max(5),
  }).optional(),
}).optional()

// POST /api/writing/questions (admin only)
const CreateWritingQuestionSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  type: WritingQuestionTypeSchema,
  promptText: z.string().min(1).max(5000).trim(),
  options: z.union([SummarizeWrittenTextOptionsSchema, WriteEssayOptionsSchema]).optional().nullable(),
  answerKey: z.union([SummarizeWrittenTextAnswerKeySchema, WriteEssayAnswerKeySchema]).optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium').optional(),
  tags: z.array(z.string().max(50).trim()).max(10).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  // Additional validation: ensure options match question type
  if (data.type === 'summarize_written_text' && data.options) {
    return SummarizeWrittenTextOptionsSchema.safeParse(data.options).success
  }
  if (data.type === 'write_essay' && data.options) {
    return WriteEssayOptionsSchema.safeParse(data.options).success
  }
  return true
}, {
  message: "Options must match the question type",
  path: ["options"]
}).refine((data) => {
  // Additional validation: ensure answerKey matches question type
  if (data.type === 'summarize_written_text' && data.answerKey) {
    return SummarizeWrittenTextAnswerKeySchema.safeParse(data.answerKey).success
  }
  if (data.type === 'write_essay' && data.answerKey) {
    return WriteEssayAnswerKeySchema.safeParse(data.answerKey).success
  }
  return true
}, {
  message: "Answer key must match the question type",
  path: ["answerKey"]
})

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  let userProfile: any = null

  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    // Get user profile with role instead of unsafe type assertion
    userProfile = await getUserProfile()
    if (!userProfile || userProfile.role !== 'admin') {
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

    // Additional input sanitization beyond Zod
    const rawJson = await request.json()

    // Sanitize string inputs
    const sanitizeString = (str: string) => str.replace(/[<>\"'&]/g, '').trim()
    const sanitizeTags = (tags: string[]) => tags.map(tag => tag.replace(/[<>\"'&]/g, '').trim()).filter(Boolean)

    const sanitizedJson = {
      ...rawJson,
      title: rawJson.title ? sanitizeString(rawJson.title) : rawJson.title,
      promptText: rawJson.promptText ? sanitizeString(rawJson.promptText) : rawJson.promptText,
      tags: rawJson.tags ? sanitizeTags(rawJson.tags) : rawJson.tags,
    }

    const parsed = CreateWritingQuestionSchema.safeParse(sanitizedJson)
    if (!parsed.success) {
      console.error('[POST /api/writing/questions] Validation failed', {
          requestId,
          userId: userProfile?.id || 'unknown',
          errors: parsed.error.issues
        })
      return error(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'VALIDATION_ERROR'
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

    // Use transaction to fix race condition in idempotency check
    const result = await db.transaction(async (tx) => {
      // Check for existing question with unique constraint approach
      const existing = await tx
        .select({ id: writingQuestions.id })
        .from(writingQuestions)
        .where(
          and(eq(writingQuestions.type, type), eq(writingQuestions.title, title))
        )
        .limit(1)

      if (existing.length > 0) {
        return { id: existing[0].id, created: false }
      }

      // Insert new question
      const [row] = await tx
        .insert(writingQuestions)
        .values({
          type,
          title,
          promptText,
          options,
          answerKey,
          difficulty,
          tags,
          isActive,
        })
        .returning()

      return { id: row.id, created: true }
    })

    // Audit logging for admin operations
    await logActivity(`Created writing question: ${title}`, request.headers.get('x-forwarded-for') || undefined)

    // Invalidate writing questions cache after admin operations
    await revalidateCacheTags([CacheTags.WRITING_QUESTIONS])

    const statusCode = result.created ? 201 : 200
    return NextResponse.json(result, { status: statusCode })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    const errorStack = e instanceof Error ? e.stack : undefined
    console.error('[POST /api/writing/questions] Error occurred', {
      requestId,
      userId: userProfile?.id,
      error: errorMessage,
      stack: errorStack
    })

    // Structured error handling with appropriate HTTP status codes
    if (e instanceof Error) {
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        return error(409, 'Question with this title and type already exists', 'CONFLICT')
      }
      if (errorMessage.includes('check constraint') || errorMessage.includes('invalid input')) {
        return error(422, 'Invalid data provided', 'VALIDATION_ERROR')
      }
    }

    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}

'use server'

import { db } from '@/lib/db'
import {
  speakingQuestions,
  speakingAttempts,
  users,
  readingQuestions,
  writingQuestions,
  listeningQuestions,
} from '@/lib/db/schema'
import { scoreReadAloud } from '@/lib/ai/scoring'
import { eq, and, desc, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function getQuestions(options: {
  category: 'speaking' | 'reading' | 'writing' | 'listening'
  type?: string
  page?: number
  limit?: number
  difficulty?: string
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const { category, type, page = 1, limit = 20, difficulty } = options
  const offset = (page - 1) * limit

  if (category === 'speaking') {
    const whereClauses = and(
      eq(speakingQuestions.isActive, true),
      type ? eq(speakingQuestions.type, type as any) : undefined,
      difficulty ? eq(speakingQuestions.difficulty, difficulty as any) : undefined
    )

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(speakingQuestions)
      .where(whereClauses)

    const rows = await db
      .select({
        id: speakingQuestions.id,
        type: speakingQuestions.type,
        title: speakingQuestions.title,
        difficulty: speakingQuestions.difficulty,
        isActive: speakingQuestions.isActive,
        createdAt: speakingQuestions.createdAt,
      })
      .from(speakingQuestions)
      .where(whereClauses)
      .limit(limit)
      .offset(offset)
      .orderBy(speakingQuestions.createdAt)

    return { data: rows, total: count, limit }
  }

  if (category === 'reading') {
    const whereClauses = and(
      eq(readingQuestions.isActive, true),
      type ? eq(readingQuestions.type, type as any) : undefined,
      difficulty ? eq(readingQuestions.difficulty, difficulty as any) : undefined
    )

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(readingQuestions)
      .where(whereClauses)

    const rows = await db
      .select({
        id: readingQuestions.id,
        type: readingQuestions.type,
        title: readingQuestions.title,
        difficulty: readingQuestions.difficulty,
        isActive: readingQuestions.isActive,
        createdAt: readingQuestions.createdAt,
      })
      .from(readingQuestions)
      .where(whereClauses)
      .limit(limit)
      .offset(offset)
      .orderBy(readingQuestions.createdAt)

    return { data: rows, total: count, limit }
  }

  if (category === 'writing') {
    const whereClauses = and(
      eq(writingQuestions.isActive, true),
      type ? eq(writingQuestions.type, type as any) : undefined,
      difficulty ? eq(writingQuestions.difficulty, difficulty as any) : undefined
    )

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(writingQuestions)
      .where(whereClauses)

    const rows = await db
      .select({
        id: writingQuestions.id,
        type: writingQuestions.type,
        title: writingQuestions.title,
        difficulty: writingQuestions.difficulty,
        isActive: writingQuestions.isActive,
        createdAt: writingQuestions.createdAt,
      })
      .from(writingQuestions)
      .where(whereClauses)
      .limit(limit)
      .offset(offset)
      .orderBy(writingQuestions.createdAt)

    return { data: rows, total: count, limit }
  }

  if (category === 'listening') {
    const whereClauses = and(
      eq(listeningQuestions.isActive, true),
      type ? eq(listeningQuestions.type, type as any) : undefined,
      difficulty ? eq(listeningQuestions.difficulty, difficulty as any) : undefined
    )

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listeningQuestions)
      .where(whereClauses)

    const rows = await db
      .select({
        id: listeningQuestions.id,
        type: listeningQuestions.type,
        title: listeningQuestions.title,
        difficulty: listeningQuestions.difficulty,
        isActive: listeningQuestions.isActive,
        createdAt: listeningQuestions.createdAt,
      })
      .from(listeningQuestions)
      .where(whereClauses)
      .limit(limit)
      .offset(offset)
      .orderBy(listeningQuestions.createdAt)

    return { data: rows, total: count, limit }
  }

  return { data: [], total: 0, limit }
}

export async function submitAttempt(data: {
  questionId: string
  questionType: string
  audioUrl: string
  transcript: string
  durationMs: number
}) {
  console.log('[submitAttempt] Starting submission:', { questionId: data.questionId, type: data.questionType })

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    console.error('[submitAttempt] No user session found')
    throw new Error('Unauthorized')
  }

  // Check AI credits
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    console.error('[submitAttempt] User not found in DB:', session.user.id)
    throw new Error('User not found')
  }

  // Check if user has AI credits
  if (user.aiCreditsUsed >= user.dailyAiCredits) {
    console.warn('[submitAttempt] Credits exhausted for user:', user.email)
    throw new Error('Daily AI credits exhausted. Upgrade to VIP for unlimited scoring.')
  }

  // Get question details
  const question = await db.query.speakingQuestions.findFirst({
    where: eq(speakingQuestions.id, data.questionId),
  })

  if (!question) {
    console.error('[submitAttempt] Question not found:', data.questionId)
    throw new Error('Question not found')
  }

  let aiScore;
  try {
    console.log('[submitAttempt] Calling AI scoring...')
    aiScore = await scoreReadAloud(
      question.promptText || question.title,
      data.transcript,
      data.durationMs
    )
    console.log('[submitAttempt] AI scoring successful')
  } catch (error) {
    console.error('[submitAttempt] AI scoring failed:', error)
    throw new Error('AI scoring failed. Please try again.')
  }

  // Save attempt
  const [attempt] = await db
    .insert(speakingAttempts)
    .values({
      userId: session.user.id,
      questionId: data.questionId,
      type: data.questionType as any,
      audioUrl: data.audioUrl,
      transcript: data.transcript,
      scores: aiScore,
      durationMs: data.durationMs,
      timings: {
        prepTime: 0,
        recordTime: data.durationMs,
      },
    })
    .returning()

  // Update user AI credits
  await db
    .update(users)
    .set({
      aiCreditsUsed: sql`${users.aiCreditsUsed} + 1`,
    })
    .where(eq(users.id, session.user.id))

  console.log('[submitAttempt] Submission complete. Credits remaining:', user.dailyAiCredits - user.aiCreditsUsed - 1)

  return {
    attempt,
    score: aiScore,
    creditsRemaining: user.dailyAiCredits - user.aiCreditsUsed - 1,
  }
}

export async function getUserAttempts(questionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const attempts = await db.query.speakingAttempts.findMany({
    where: and(
      eq(speakingAttempts.questionId, questionId),
      eq(speakingAttempts.userId, session.user.id)
    ),
    orderBy: [desc(speakingAttempts.createdAt)],
    limit: 10,
  })

  return attempts
}

export async function getQuestionById(options: { id: string; category: 'speaking' | 'reading' | 'writing' | 'listening' }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const { id, category } = options

  if (category === 'speaking') {
    const row = await db.query.speakingQuestions.findFirst({ where: eq(speakingQuestions.id, id) })
    return row || null
  }
  if (category === 'reading') {
    const row = await db.query.readingQuestions.findFirst({ where: eq(readingQuestions.id, id) })
    return row || null
  }
  if (category === 'writing') {
    const row = await db.query.writingQuestions.findFirst({ where: eq(writingQuestions.id, id) })
    return row || null
  }
  if (category === 'listening') {
    const row = await db.query.listeningQuestions.findFirst({ where: eq(listeningQuestions.id, id) })
    return row || null
  }

  return null
}

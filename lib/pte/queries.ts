import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'

// Re-export optimized dashboard query
export { getAcademicDashboardDataOptimized } from './queries-optimized'
import {
  practiceSessions,
  pteQuestions,
  pteTests,
  speakingAttempts,
  speakingQuestions,
  testAnswers,
  testAttempts,
  userSubscriptions,
} from '@/lib/db/schema'
import type { SpeakingType } from '@/lib/pte/types'
import { cacheShort, CacheTags, generateCacheKey } from '@/lib/cache'

// Get all tests with optional filtering
export async function getTests(isPremium?: boolean) {
  const query =
    isPremium !== undefined
      ? db
          .select()
          .from(pteTests)
          .where(eq(pteTests.isPremium, isPremium ? 'true' : 'false'))
      : db.select().from(pteTests)

  return await query
}

// Get test by ID with questions
export async function getTestWithQuestions(testId: string) {
  const test = await db.select().from(pteTests).where(eq(pteTests.id, testId))

  if (!test.length) return null

  const questions = await db
    .select()
    .from(pteQuestions)
    .where(eq(pteQuestions.testId, testId))
    .orderBy(pteQuestions.orderIndex)

  return {
    ...test[0],
    questions,
  }
}

// Get user's subscription
export async function getUserSubscription(userId: string) {
  const subscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      )
    )
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1)

  return subscriptions[0] || null
}

// Create or get user's free subscription
export async function ensureUserSubscription(userId: string) {
  const existing = await getUserSubscription(userId)

  if (existing) return existing

  const [subscription] = await db
    .insert(userSubscriptions)
    .values({
      userId,
      planType: 'free',
      status: 'active',
    })
    .returning()

  return subscription
}

// Create test attempt
export async function createTestAttempt(userId: string, testId: string) {
  const [attempt] = await db
    .insert(testAttempts)
    .values({
      userId,
      testId,
      status: 'in_progress',
    })
    .returning()

  return attempt
}

// Get user's test attempts
export async function getUserTestAttempts(userId: string, limit = 10) {
  const attempts = await db
    .select({
      id: testAttempts.id,
      testId: testAttempts.testId,
      status: testAttempts.status,
      startedAt: testAttempts.startedAt,
      completedAt: testAttempts.completedAt,
      totalScore: testAttempts.totalScore,
      readingScore: testAttempts.readingScore,
      writingScore: testAttempts.writingScore,
      listeningScore: testAttempts.listeningScore,
      speakingScore: testAttempts.speakingScore,
      testTitle: pteTests.title,
      testType: pteTests.testType,
    })
    .from(testAttempts)
    .innerJoin(pteTests, eq(testAttempts.testId, pteTests.id))
    .where(eq(testAttempts.userId, userId))
    .orderBy(desc(testAttempts.startedAt))
    .limit(limit)

  return attempts
}

// Get section items (distinct question types under a section and test type)
export async function getSectionQuestionTypes(params: {
  testType: string
  section: string
}) {
  const { testType, section } = params
  // Return distinct question types with counts by section and test type
  const rows = await db
    .select({
      questionType: pteQuestions.questionType,
    })
    .from(pteQuestions)
    .innerJoin(pteTests, eq(pteQuestions.testId, pteTests.id))
    .where(
      and(eq(pteTests.testType, testType), eq(pteQuestions.section, section))
    )

  // Group distinct
  const map = new Map<string, number>()
  rows.forEach((r) =>
    map.set(r.questionType, (map.get(r.questionType) || 0) + 1)
  )
  return Array.from(map.entries()).map(([questionType, count]) => ({
    questionType,
    count,
  }))
}

// Get test attempt with answers
export async function getTestAttemptWithAnswers(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(testAttempts)
    .where(eq(testAttempts.id, attemptId))

  if (!attempt) return null

  const answers = await db
    .select({
      id: testAnswers.id,
      questionId: testAnswers.questionId,
      userAnswer: testAnswers.userAnswer,
      isCorrect: testAnswers.isCorrect,
      pointsEarned: testAnswers.pointsEarned,
      aiFeedback: testAnswers.aiFeedback,
      submittedAt: testAnswers.submittedAt,
      question: pteQuestions.question,
      questionType: pteQuestions.questionType,
      section: pteQuestions.section,
      questionData: pteQuestions.questionData,
      correctAnswer: pteQuestions.correctAnswer,
    })
    .from(testAnswers)
    .innerJoin(pteQuestions, eq(testAnswers.questionId, pteQuestions.id))
    .where(eq(testAnswers.attemptId, attemptId))

  return {
    ...attempt,
    answers,
  }
}

// Submit answer
export async function submitAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string,
  isCorrect?: boolean,
  pointsEarned?: number | null,
  aiFeedback?: string
) {
  const [answer] = await db
    .insert(testAnswers)
    .values({
      attemptId,
      questionId,
      userAnswer,
      isCorrect: isCorrect !== undefined ? isCorrect : null,
      pointsEarned: pointsEarned ?? null,
      aiFeedback,
    })
    .returning()

  return answer
}

// Complete test attempt
export async function completeTestAttempt(
  attemptId: string,
  scores: {
    totalScore: string
    readingScore?: string
    writingScore?: string
    listeningScore?: string
    speakingScore?: string
  }
) {
  const [attempt] = await db
    .update(testAttempts)
    .set({
      status: 'completed',
      completedAt: new Date(),
      ...scores,
    })
    .where(eq(testAttempts.id, attemptId))
    .returning()

  return attempt
}

// Get user statistics
export async function getUserStats(userId: string) {
  const attempts = await db
    .select()
    .from(testAttempts)
    .where(
      and(eq(testAttempts.userId, userId), eq(testAttempts.status, 'completed'))
    )

  if (!attempts.length) {
    return {
      totalTestsTaken: 0,
      averageScore: 0,
      sectionScores: {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
      },
    }
  }

  const totalScore = attempts.reduce((sum, a) => {
    const score = parseFloat(a.totalScore || '0')
    return sum + score
  }, 0)

  const readingScores = attempts
    .filter((a) => a.readingScore)
    .map((a) => parseFloat(a.readingScore!))
  const writingScores = attempts
    .filter((a) => a.writingScore)
    .map((a) => parseFloat(a.writingScore!))
  const listeningScores = attempts
    .filter((a) => a.listeningScore)
    .map((a) => parseFloat(a.listeningScore!))
  const speakingScores = attempts
    .filter((a) => a.speakingScore)
    .map((a) => parseFloat(a.speakingScore!))

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  return {
    totalTestsTaken: attempts.length,
    averageScore: totalScore / attempts.length,
    sectionScores: {
      reading: avg(readingScores),
      writing: avg(writingScores),
      listening: avg(listeningScores),
      speaking: avg(speakingScores),
    },
  }
}

/**
 * DEPRECATED: Use getAcademicDashboardDataOptimized from queries-optimized.ts
 * This function is kept for backward compatibility but makes 5+ sequential DB queries.
 * The optimized version reduces this to 2 parallel queries with SQL aggregations.
 * Performance improvement: ~3-5x faster
 */
// Get academic dashboard data
export async function getAcademicDashboardData(
  userId: string,
  userTargetScore: number = 0
) {
  try {
    // Get user stats from completed test attempts
    const userStats = await getUserStats(userId)

    // Get user's test attempts for progress tracking
    const userTestAttempts = await db
      .select({
        id: testAttempts.id,
        startedAt: testAttempts.startedAt,
        totalScore: testAttempts.totalScore,
        readingScore: testAttempts.readingScore,
        writingScore: testAttempts.writingScore,
        listeningScore: testAttempts.listeningScore,
        speakingScore: testAttempts.speakingScore,
      })
      .from(testAttempts)
      .where(
        and(
          eq(testAttempts.userId, userId),
          eq(testAttempts.status, 'completed')
        )
      )
      .orderBy(desc(testAttempts.startedAt))
      .limit(50) // Get last 50 attempts for progress calculation

    // Calculate monthly progress from test attempts
    const academicProgress = calculateMonthlyProgress(userTestAttempts)

    // Calculate section performance from test attempts
    const academicPerformance = calculateSectionPerformance(userTestAttempts)

    // Get recent practice sessions for activity tracking
    const recentPractice = await db
      .select({
        id: practiceSessions.id,
        score: practiceSessions.score,
        submittedAt: practiceSessions.submittedAt,
        questionType: pteQuestions.questionType,
        section: pteQuestions.section,
      })
      .from(practiceSessions)
      .innerJoin(pteQuestions, eq(practiceSessions.questionId, pteQuestions.id))
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.submittedAt))
      .limit(20)

    // Calculate current overall score
    const currentOverallScore = userStats.averageScore || 0

    // Calculate study streak and hours from practice sessions
    const { streak, studyHours } = calculateStudyMetrics(recentPractice)

    // Create academic goals based on real data
    const academicGoals = [
      {
        id: 1,
        title: `Reach Overall Score of ${userTargetScore || 65}`,
        current: Math.round(currentOverallScore),
        target: userTargetScore || 65,
        status:
          currentOverallScore >= (userTargetScore || 65)
            ? 'completed'
            : 'in-progress',
      },
      {
        id: 2,
        title: 'Improve Listening Score to 80+',
        current: Math.round(
          academicPerformance.find((p) => p.section === 'Listening')?.score || 0
        ),
        target: 80,
        status:
          (academicPerformance.find((p) => p.section === 'Listening')?.score ||
            0) >= 80
            ? 'completed'
            : 'in-progress',
      },
      {
        id: 3,
        title: 'Complete 50 Practice Sessions',
        current: recentPractice.length,
        target: 50,
        status: recentPractice.length >= 50 ? 'completed' : 'in-progress',
      },
    ]

    // Real stats data
    const stats = {
      overallScore: Math.round(currentOverallScore),
      targetScore: userTargetScore || 65,
      readingScore: Math.round(
        academicPerformance.find((p) => p.section === 'Reading')?.score || 0
      ),
      writingScore: Math.round(
        academicPerformance.find((p) => p.section === 'Writing')?.score || 0
      ),
      listeningScore: Math.round(
        academicPerformance.find((p) => p.section === 'Listening')?.score || 0
      ),
      speakingScore: Math.round(
        academicPerformance.find((p) => p.section === 'Speaking')?.score || 0
      ),
      testsCompleted: userStats.totalTestsTaken,
      studyHours: Math.round(studyHours),
      streak: streak,
    }

    return {
      stats,
      progress: academicProgress,
      performance: academicPerformance,
      goals: academicGoals,
      recentActivity: recentPractice.slice(0, 5), // Return last 5 practice sessions
    }
  } catch (error) {
    console.error('Error fetching academic dashboard data:', error)
    // Return fallback data if database queries fail
    return {
      stats: {
        overallScore: 0,
        targetScore: userTargetScore || 65,
        readingScore: 0,
        writingScore: 0,
        listeningScore: 0,
        speakingScore: 0,
        testsCompleted: 0,
        studyHours: 0,
        streak: 0,
      },
      progress: [{ month: 'No Data', score: 0 }],
      performance: [
        { section: 'Reading', score: 0 },
        { section: 'Writing', score: 0 },
        { section: 'Listening', score: 0 },
        { section: 'Speaking', score: 0 },
      ],
      goals: [
        {
          id: 1,
          title: `Reach Overall Score of ${userTargetScore || 65}`,
          current: 0,
          target: userTargetScore || 65,
          status: 'in-progress',
        },
        {
          id: 2,
          title: 'Improve Listening Score to 80+',
          current: 0,
          target: 80,
          status: 'in-progress',
        },
        {
          id: 3,
          title: 'Complete 50 Practice Sessions',
          current: 0,
          target: 50,
          status: 'in-progress',
        },
      ],
      recentActivity: [],
    }
  }
}

// Helper function to calculate monthly progress
function calculateMonthlyProgress(
  attempts: { startedAt: Date | string; totalScore: string | null }[]
) {
  const monthlyData: { [key: string]: { total: number; count: number } } = {}

  attempts.forEach((attempt) => {
    const date = new Date(attempt.startedAt)
    const monthKey = date.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    })

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, count: 0 }
    }

    const score = parseFloat(attempt.totalScore || '0')
    monthlyData[monthKey].total += score
    monthlyData[monthKey].count += 1
  })

  // Convert to array and sort by date
  const progress = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      score: Math.round(data.total / data.count),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month + ' 1, 2000')
      const dateB = new Date(b.month + ' 1, 2000')
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6) // Last 6 months

  return progress.length > 0 ? progress : [{ month: 'No Data', score: 0 }]
}

// Helper function to calculate section performance
function calculateSectionPerformance(
  attempts: Array<{
    readingScore?: string | null
    writingScore?: string | null
    listeningScore?: string | null
    speakingScore?: string | null
  }>
) {
  const sections = ['Reading', 'Writing', 'Listening', 'Speaking']
  const sectionData: { [key: string]: { total: number; count: number } } = {}

  sections.forEach((section) => {
    sectionData[section] = { total: 0, count: 0 }
  })

  attempts.forEach((attempt) => {
    sections.forEach((section) => {
      const scoreKey = `${section.toLowerCase()}Score`
      const score = parseFloat(((attempt as any)[scoreKey] ?? '0') as string)
      if (score > 0) {
        sectionData[section].total += score
        sectionData[section].count += 1
      }
    })
  })

  return sections.map((section) => ({
    section,
    score:
      sectionData[section].count > 0
        ? Math.round(sectionData[section].total / sectionData[section].count)
        : 0,
  }))
}

// Helper function to calculate study metrics
function calculateStudyMetrics(
  practiceSessions: Array<{ submittedAt: Date | string }>
) {
  let streak = 0
  let studyHours = 0

  if (practiceSessions.length > 0) {
    // Calculate study hours (assuming 30 minutes per session)
    studyHours = (practiceSessions.length * 30) / 60 // in hours

    // Calculate streak (consecutive days with practice)
    const dates = practiceSessions
      .map((p) => new Date(p.submittedAt).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0

    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i])
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (date.toDateString() === expectedDate.toDateString()) {
        currentStreak++
      } else {
        break
      }
    }

    streak = currentStreak
  }

  return { streak, studyHours }
}

// Speaking queries

export async function listSpeakingQuestions(filters: {
  type: SpeakingType
  page?: number
  pageSize?: number
  search?: string
  difficulty?: 'All' | 'Easy' | 'Medium' | 'Hard'
  isActive?: boolean
}) {
  const {
    type,
    page = 1,
    pageSize = 20,
    search = '',
    difficulty = 'All',
    isActive = true,
  } = filters

  const conditions: any[] = [eq(speakingQuestions.type, type)]
  if (isActive !== undefined)
    conditions.push(eq(speakingQuestions.isActive, isActive))
  if (difficulty && difficulty !== 'All')
    conditions.push(eq(speakingQuestions.difficulty, difficulty))
  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      sql`(${speakingQuestions.title} ILIKE ${pattern} OR ${speakingQuestions.promptText} ILIKE ${pattern})`
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

  const base = db.select().from(speakingQuestions)
  const items = await (whereExpr ? base.where(whereExpr) : base)
    .orderBy(desc(speakingQuestions.createdAt), desc(speakingQuestions.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { items, total }
}

export async function getSpeakingQuestionById(id: string) {
  const rows = await db
    .select()
    .from(speakingQuestions)
    .where(eq(speakingQuestions.id, id))
    .limit(1)
  return rows[0] || null
}

export async function insertSpeakingAttempt(
  data: typeof speakingAttempts.$inferInsert
) {
  const [row] = await db.insert(speakingAttempts).values(data).returning()
  return row
}

export async function listSpeakingAttemptsByUser(
  userId: string,
  opts?: { questionId?: string; limit?: number; offset?: number }
) {
  const { questionId, limit = 25, offset = 0 } = opts || {}
  const conditions: any[] = [eq(speakingAttempts.userId, userId)]
  if (questionId) conditions.push(eq(speakingAttempts.questionId, questionId))
  const whereExpr = and(...conditions)

  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(speakingAttempts)
    .where(whereExpr)
  const total = Number(countRows[0]?.count || 0)

  const items = await db
    .select()
    .from(speakingAttempts)
    .where(whereExpr)
    .orderBy(desc(speakingAttempts.createdAt), desc(speakingAttempts.id))
    .limit(limit)
    .offset(offset)

  return { items, total }
}

// Shared fetch utilities for question lists

type Section = 'speaking' | 'reading' | 'writing' | 'listening'

interface QuestionsApiParams {
  page?: number
  pageSize?: number
  difficulty?: string
  tags?: string[]
  search?: string
}

interface FetchQuestionsResult {
  items: any[]
  page: number
  pageSize: number
  total: number
}

/**
 * Build API URL for fetching questions by section and type
 */
export function getQuestionsApiUrl(
  section: Section,
  questionType: string,
  params?: QuestionsApiParams
): string {
  const { page = 1, pageSize = 100, difficulty, tags, search } = params || {}

  const urlParams = new URLSearchParams()
  urlParams.set('type', questionType)
  urlParams.set('page', String(page))
  urlParams.set('pageSize', String(pageSize))

  if (difficulty && difficulty !== 'All') {
    urlParams.set('difficulty', difficulty)
  }

  if (search) {
    urlParams.set('search', search)
  }

  if (tags && tags.length > 0) {
    tags.forEach((tag) => urlParams.append('tags', tag))
  }

  return `/api/${section}/questions?${urlParams.toString()}`
}

/**
 * Build absolute URL for server-side fetching (requires headers from Next.js)
 */
export function buildAbsoluteUrl(path: string, headers: any): string {
  const proto = headers.get('x-forwarded-proto') ?? 'http'
  const host =
    headers.get('x-forwarded-host') ??
    headers.get('host') ??
    `localhost:${process.env.PORT || 3000}`
  return `${proto}://${host}${path}`
}

/**
 * Fetch questions from the API (server-side with headers)
 * Use this in Server Components with Next.js headers
 */
export async function fetchQuestionsServer(
  section: Section,
  questionType: string,
  headers: any,
  params?: QuestionsApiParams
): Promise<FetchQuestionsResult> {
  const url = getQuestionsApiUrl(section, questionType, params)
  const absoluteUrl = buildAbsoluteUrl(url, headers)

  try {
    const response = await fetch(absoluteUrl, {
      cache: 'no-store',
      headers: {
        'x-request-id': crypto.randomUUID(),
      },
    })

    if (!response.ok) {
      console.error(
        `[fetchQuestionsServer] Failed to fetch ${section}/${questionType}: ${response.status}`
      )
      return { items: [], page: 1, pageSize: params?.pageSize || 100, total: 0 }
    }

    const data = await response.json()

    return {
      items: data.items || [],
      page: data.page || 1,
      pageSize: data.pageSize || params?.pageSize || 100,
      total: data.total || 0,
    }
  } catch (error) {
    console.error(
      `[fetchQuestionsServer] Error fetching ${section}/${questionType}:`,
      error
    )
    return { items: [], page: 1, pageSize: params?.pageSize || 100, total: 0 }
  }
}

/**
 * Fetch questions from the API (client-side, no headers needed)
 * Use this in Client Components
 */
export async function fetchQuestionsClient(
  section: Section,
  questionType: string,
  params?: QuestionsApiParams
): Promise<FetchQuestionsResult> {
  const url = getQuestionsApiUrl(section, questionType, params)

  try {
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      console.error(
        `[fetchQuestionsClient] Failed to fetch ${section}/${questionType}: ${response.status}`
      )
      return { items: [], page: 1, pageSize: params?.pageSize || 100, total: 0 }
    }

    const data = await response.json()

    return {
      items: data.items || [],
      page: data.page || 1,
      pageSize: data.pageSize || params?.pageSize || 100,
      total: data.total || 0,
    }
  } catch (error) {
    console.error(
      `[fetchQuestionsClient] Error fetching ${section}/${questionType}:`,
      error
    )
    return { items: [], page: 1, pageSize: params?.pageSize || 100, total: 0 }
  }
}

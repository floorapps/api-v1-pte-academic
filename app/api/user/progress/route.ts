import { getUserProgress, getUserAnalytics } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import { sql } from 'drizzle-orm'
import {
  speakingAttempts,
  writingAttempts,
  readingAttempts,
  listeningAttempts,
  testAttempts,
} from '@/lib/db/schema'

interface ProgressData {
  overallScore: number
  speakingScore: number
  writingScore: number
  readingScore: number
  listeningScore: number
  testsCompleted: number
  questionsAnswered: number
  studyStreak: number
  totalStudyTime: number
}

export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Try to get progress from userProgress table first
    const userProgress = await getUserProgress()
    if (userProgress) {
      return Response.json({
        overallScore: userProgress.overallScore || 0,
        speakingScore: userProgress.speakingScore || 0,
        writingScore: userProgress.writingScore || 0,
        readingScore: userProgress.readingScore || 0,
        listeningScore: userProgress.listeningScore || 0,
        testsCompleted: userProgress.testsCompleted || 0,
        questionsAnswered: userProgress.questionsAnswered || 0,
        studyStreak: userProgress.studyStreak || 0,
        totalStudyTime: Math.floor((userProgress.totalStudyTime || 0) / 60), // Convert minutes to hours
      } satisfies ProgressData)
    }

    // Fallback: Calculate progress from attempts and analytics
    const analytics = await getUserAnalytics()

    // Count questions answered from all attempt types
    const [questionCounts] = await db
      .select({
        speaking: sql<number>`count(${speakingAttempts.id})`,
        writing: sql<number>`count(${writingAttempts.id})`,
        reading: sql<number>`count(${readingAttempts.id})`,
        listening: sql<number>`count(${listeningAttempts.id})`,
      })
      .from(speakingAttempts)
      .fullJoin(writingAttempts, sql`true`)
      .fullJoin(readingAttempts, sql`true`)
      .fullJoin(listeningAttempts, sql`true`)
      .where(sql`${speakingAttempts.userId} = ${authUser.id} OR ${writingAttempts.userId} = ${authUser.id} OR ${readingAttempts.userId} = ${authUser.id} OR ${listeningAttempts.userId} = ${authUser.id}`)
      .limit(1)

    const questionsAnswered =
      (questionCounts?.speaking || 0) +
      (questionCounts?.writing || 0) +
      (questionCounts?.reading || 0) +
      (questionCounts?.listening || 0)

    // Calculate total study time from conversation sessions (in hours)
    const [studyTimeResult] = await db
      .select({
        totalDurationMs: sql<number>`coalesce(sum(${sql`total_duration_ms`}), 0)`,
      })
      .from(sql`conversation_sessions`)
      .where(sql`user_id = ${authUser.id}`)

    const totalStudyTime = Math.floor((studyTimeResult?.totalDurationMs || 0) / (1000 * 60 * 60)) // Convert ms to hours

    // Use analytics scores if available, otherwise defaults
    const progressData: ProgressData = {
      overallScore: analytics?.averageScores?.overall || 0,
      speakingScore: analytics?.averageScores?.speaking || 0,
      writingScore: analytics?.averageScores?.writing || 0,
      readingScore: analytics?.averageScores?.reading || 0,
      listeningScore: analytics?.averageScores?.listening || 0,
      testsCompleted: analytics?.totalAttempts || 0,
      questionsAnswered: questionsAnswered || 0,
      studyStreak: 0, // Not available from current data
      totalStudyTime: totalStudyTime || 0,
    }

    return Response.json(progressData)
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return Response.json({ error: 'Failed to get user progress' }, { status: 500 })
  }
}
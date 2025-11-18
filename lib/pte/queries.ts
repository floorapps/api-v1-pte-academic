import 'server-only'

import { and, count, eq } from 'drizzle-orm'
import { db } from '../db/drizzle'
import {
  pteQuestions,
  pteTests,
  testAttempts,
  users,
} from '../db/schema'
import { auth } from '../auth/auth'

/**
 * Fetches the current authenticated user's session.
 * @returns The user object or null if not authenticated.
 */
async function getSessionUser() {
  const session = await auth.getsession()
  if (!session?.user) {
    return null
  }
  return session.user
}

/**
 * Fetches aggregated statistics for dashboard features.
 * This is a placeholder and should be expanded with real queries.
 */
export async function getFeatureStats() {
  const user = await getSessionUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const totalQuestionsQuery = db.select({ value: count() }).from(pteQuestions)
  const totalMockTestsQuery = db
    .select({ value: count() })
    .from(pteTests)
    .where(eq(pteTests.testType, 'mock'))

  const [totalQuestionsResult, totalMockTestsResult] = await Promise.all([
    totalQuestionsQuery,
    totalMockTestsQuery,
  ])

  const totalQuestions = totalQuestionsResult[0].value
  const totalMockTests = totalMockTestsResult[0].value

  // The rest of the stats are still mock data.
  // In a real implementation, these would also be database queries.
  const featureStats = {
    ptePractice: {
      totalQuestions: totalQuestions,
      sections: {
        listening: 1200,
        reading: 1500,
        speaking: 1200,
        writing: 1100,
      },
      lastUpdated: new Date().toISOString(),
    },
    mockTests: {
      totalTests: totalMockTests,
      completedByUser: 5,
      averageScore: 68,
      lastCompleted: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    templates: {
      totalTemplates: 20,
      categories: ['speaking', 'writing', 'reading'],
      downloads: 150,
    },
    studyTools: {
      vocabBooks: {
        totalWords: 5000,
        completedWords: 1200,
        progress: 24,
      },
      shadowing: {
        totalHours: 50,
        completedHours: 12,
        progress: 24,
      },
      mp3Files: {
        totalFiles: 1000,
        downloadedFiles: 150,
        progress: 15,
      },
    },
  }

  return featureStats
}
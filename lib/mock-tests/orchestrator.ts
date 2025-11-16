/**
 * Mock Test Orchestrator
 * Manages test flow, section progression, and state for mock test attempts
 */

import 'server-only'
import {
  mockTests,
  mockTestQuestions,
  mockTestAttempts,
  mockTestAnswers,
  type MockTestAttempt,
  type MockTestQuestion,
} from '@/lib/db/schema-mock-tests'
import {
  speakingQuestions,
  writingQuestions,
  readingQuestions,
  listeningQuestions,
} from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { timingFor } from '@/lib/pte/timing'

export type LoadedQuestion = {
  mockTestQuestionId: string
  questionId: string
  questionTable: string
  section: string
  orderIndex: number
  timeLimitSeconds: number | null
  questionData: any // Full question data from the appropriate table
}

export type TestSession = {
  attemptId: string
  mockTestId: string
  testNumber: number
  testTitle: string
  currentSection: string
  currentQuestionIndex: number
  totalQuestions: number
  timeRemainingSeconds: number | null
  status: string
  questions: LoadedQuestion[]
  completedQuestionIds: string[]
}

/**
 * Load a mock test with all its questions
 */
export async function loadMockTest(mockTestId: string) {
  const [test] = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.id, mockTestId))

  if (!test) {
    throw new Error(`Mock test not found: ${mockTestId}`)
  }

  const questions = await db
    .select()
    .from(mockTestQuestions)
    .where(eq(mockTestQuestions.mockTestId, mockTestId))
    .orderBy(asc(mockTestQuestions.orderIndex))

  return { test, questions }
}

/**
 * Load full question data polymorphically
 */
export async function loadQuestionData(
  questionId: string,
  questionTable: string
) {
  let table
  switch (questionTable) {
    case 'speaking_questions':
      table = speakingQuestions
      break
    case 'writing_questions':
      table = writingQuestions
      break
    case 'reading_questions':
      table = readingQuestions
      break
    case 'listening_questions':
      table = listeningQuestions
      break
    default:
      throw new Error(`Unknown question table: ${questionTable}`)
  }

  const [question] = await db.select().from(table).where(eq(table.id, questionId))

  if (!question) {
    throw new Error(
      `Question not found: ${questionId} in ${questionTable}`
    )
  }

  return question
}

/**
 * Start a new mock test attempt
 */
export async function startMockTestAttempt(userId: string, mockTestId: string) {
  // Check if user already has an in-progress attempt for this test
  const existingAttempt = await db
    .select()
    .from(mockTestAttempts)
    .where(
      and(
        eq(mockTestAttempts.userId, userId),
        eq(mockTestAttempts.mockTestId, mockTestId),
        eq(mockTestAttempts.status, 'in_progress')
      )
    )

  if (existingAttempt.length > 0) {
    throw new Error('You already have an in-progress attempt for this test')
  }

  // Load test data
  const { test, questions } = await loadMockTest(mockTestId)

  // Create new attempt
  const [attempt] = await db
    .insert(mockTestAttempts)
    .values({
      userId,
      mockTestId,
      status: 'in_progress',
      currentQuestionIndex: 0,
      currentSection: 'speaking',
      startedAt: new Date(),
      timeRemainingSeconds: test.durationMinutes * 60,
      pauseCount: 0,
      timeSpent: {
        speaking: 0,
        writing: 0,
        reading: 0,
        listening: 0,
        totalSeconds: 0,
      },
    })
    .returning()

  return {
    attemptId: attempt.id,
    test,
    totalQuestions: questions.length,
  }
}

/**
 * Get current test session state
 */
export async function getTestSession(
  attemptId: string
): Promise<TestSession> {
  const [attempt] = await db
    .select()
    .from(mockTestAttempts)
    .where(eq(mockTestAttempts.id, attemptId))

  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`)
  }

  const { test, questions } = await loadMockTest(attempt.mockTestId)

  // Get completed answers
  const completedAnswers = await db
    .select()
    .from(mockTestAnswers)
    .where(eq(mockTestAnswers.attemptId, attemptId))

  const completedQuestionIds = completedAnswers.map((a) => a.mockTestQuestionId)

  // Load full question data
  const loadedQuestions: LoadedQuestion[] = await Promise.all(
    questions.map(async (q) => {
      const questionData = await loadQuestionData(q.questionId, q.questionTable)
      return {
        mockTestQuestionId: q.id,
        questionId: q.questionId,
        questionTable: q.questionTable,
        section: q.section,
        orderIndex: q.orderIndex,
        timeLimitSeconds: q.timeLimitSeconds,
        questionData,
      }
    })
  )

  return {
    attemptId: attempt.id,
    mockTestId: attempt.mockTestId,
    testNumber: test.testNumber,
    testTitle: test.title,
    currentSection: attempt.currentSection || 'speaking',
    currentQuestionIndex: attempt.currentQuestionIndex,
    totalQuestions: questions.length,
    timeRemainingSeconds: attempt.timeRemainingSeconds,
    status: attempt.status,
    questions: loadedQuestions,
    completedQuestionIds,
  }
}

/**
 * Submit an answer for a question
 */
export async function submitAnswer(params: {
  attemptId: string
  mockTestQuestionId: string
  questionId: string
  questionTable: string
  userResponse: any
  timeTakenSeconds: number
}) {
  const {
    attemptId,
    mockTestQuestionId,
    questionId,
    questionTable,
    userResponse,
    timeTakenSeconds,
  } = params

  // TODO: Calculate score based on question type
  // For now, store the answer without scoring (scoring will be done in score-aggregator)
  const [answer] = await db
    .insert(mockTestAnswers)
    .values({
      attemptId,
      mockTestQuestionId,
      questionId,
      questionTable,
      userResponse,
      timeTakenSeconds,
      submittedAt: new Date(),
    })
    .returning()

  return answer
}

/**
 * Move to next question
 */
export async function moveToNextQuestion(attemptId: string) {
  const session = await getTestSession(attemptId)
  const nextIndex = session.currentQuestionIndex + 1

  if (nextIndex >= session.totalQuestions) {
    throw new Error('No more questions in the test')
  }

  const nextQuestion = session.questions[nextIndex]

  // Update attempt
  await db
    .update(mockTestAttempts)
    .set({
      currentQuestionIndex: nextIndex,
      currentSection: nextQuestion.section,
      updatedAt: new Date(),
    })
    .where(eq(mockTestAttempts.id, attemptId))

  return nextQuestion
}

/**
 * Pause test attempt
 */
export async function pauseAttempt(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(mockTestAttempts)
    .where(eq(mockTestAttempts.id, attemptId))

  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`)
  }

  if (attempt.pauseCount >= 2) {
    throw new Error('Maximum pause limit reached (2 pauses per test)')
  }

  // Can only pause between sections
  const session = await getTestSession(attemptId)
  const currentQuestion = session.questions[session.currentQuestionIndex]
  const isAtSectionBoundary =
    session.currentQuestionIndex === 0 ||
    currentQuestion.section !==
      session.questions[session.currentQuestionIndex - 1]?.section

  if (!isAtSectionBoundary) {
    throw new Error('Can only pause between sections')
  }

  await db
    .update(mockTestAttempts)
    .set({
      status: 'paused',
      pausedAt: new Date(),
      pauseCount: attempt.pauseCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(mockTestAttempts.id, attemptId))

  return { success: true }
}

/**
 * Resume paused attempt
 */
export async function resumeAttempt(attemptId: string) {
  await db
    .update(mockTestAttempts)
    .set({
      status: 'in_progress',
      resumedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mockTestAttempts.id, attemptId))

  return { success: true }
}

/**
 * Complete test attempt
 */
export async function completeAttempt(attemptId: string) {
  // Get session
  const session = await getTestSession(attemptId)

  // Calculate final scores (done in score-aggregator)
  // For now, just mark as completed
  await db
    .update(mockTestAttempts)
    .set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mockTestAttempts.id, attemptId))

  return { success: true, attemptId }
}

/**
 * Check if user has access to a mock test
 */
export async function checkMockTestAccess(
  userId: string,
  mockTestId: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  const [test] = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.id, mockTestId))

  if (!test) {
    return { hasAccess: false, reason: 'Test not found' }
  }

  // Test #1 is always free
  if (test.isFree) {
    return { hasAccess: true }
  }

  // TODO: Check user subscription status
  // For now, allow all users (will be implemented in subscription integration)
  return { hasAccess: true }
}

/**
 * Get user's test history
 */
export async function getUserMockTestHistory(userId: string) {
  const attempts = await db
    .select()
    .from(mockTestAttempts)
    .where(eq(mockTestAttempts.userId, userId))
    .orderBy(asc(mockTestAttempts.createdAt))

  const attemptsWithTests = await Promise.all(
    attempts.map(async (attempt) => {
      const [test] = await db
        .select()
        .from(mockTests)
        .where(eq(mockTests.id, attempt.mockTestId))

      return { attempt, test }
    })
  )

  return attemptsWithTests
}

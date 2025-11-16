import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './schema'

/**
 * Mock Test System Schema
 * November 2025 Update - PTE Academic Mock Test Implementation
 *
 * This schema implements a complete mock test system matching official PTE Academic exam structure:
 * - 200 mock tests total (Test #1 free, rest paid)
 * - 52-64 questions per test
 * - 2-hour duration (November 2025 update)
 * - Pause/resume functionality
 * - Complete score tracking with enabling skills
 */

// Enums
export const mockTestStatusEnum = pgEnum('mock_test_status', [
  'draft',
  'published',
  'archived',
])

export const mockTestDifficultyEnum = pgEnum('mock_test_difficulty', [
  'easy',
  'medium',
  'hard',
])

export const attemptStatusEnum = pgEnum('attempt_status', [
  'not_started',
  'in_progress',
  'paused',
  'completed',
  'abandoned',
  'expired',
])

export const mockTestSectionEnum = pgEnum('mock_test_section', [
  'speaking',
  'writing',
  'reading',
  'listening',
])

export const questionTableEnum = pgEnum('question_table', [
  'speaking_questions',
  'writing_questions',
  'reading_questions',
  'listening_questions',
])

// Mock Tests Table - Defines the 200 mock tests
export const mockTests = pgTable(
  'mock_tests',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    testNumber: integer('test_number').notNull().unique(), // 1-200
    title: text('title').notNull(),
    description: text('description'),
    difficulty: mockTestDifficultyEnum('difficulty').notNull().default('medium'),
    totalQuestions: integer('total_questions').notNull(), // 52-64 questions
    durationMinutes: integer('duration_minutes').notNull().default(120), // 2 hours (November 2025)
    isFree: boolean('is_free').notNull().default(false), // Only test #1 is free
    status: mockTestStatusEnum('status').notNull().default('published'),
    metadata: jsonb('metadata').$type<{
      speakingQuestions?: number
      writingQuestions?: number
      readingQuestions?: number
      listeningQuestions?: number
      estimatedScoreRange?: { min: number; max: number }
      tags?: string[]
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    testNumberIdx: index('idx_mock_tests_test_number').on(table.testNumber),
    difficultyIdx: index('idx_mock_tests_difficulty').on(table.difficulty),
    isFreeIdx: index('idx_mock_tests_is_free').on(table.isFree),
    statusIdx: index('idx_mock_tests_status').on(table.status),
  })
)

// Mock Test Questions - Polymorphic links to questions from all sections
export const mockTestQuestions = pgTable(
  'mock_test_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mockTestId: uuid('mock_test_id')
      .notNull()
      .references(() => mockTests.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id').notNull(), // Polymorphic reference
    questionTable: questionTableEnum('question_table').notNull(), // Which table the question is from
    section: mockTestSectionEnum('section').notNull(), // speaking, writing, reading, listening
    orderIndex: integer('order_index').notNull(), // Order within the test
    timeLimitSeconds: integer('time_limit_seconds'), // null for section-timed questions
    metadata: jsonb('metadata').$type<{
      sectionOrder?: number
      subsection?: string
      points?: number
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    mockTestIdIdx: index('idx_mock_test_questions_test_id').on(
      table.mockTestId
    ),
    questionIdIdx: index('idx_mock_test_questions_question_id').on(
      table.questionId
    ),
    sectionIdx: index('idx_mock_test_questions_section').on(table.section),
    orderIdx: index('idx_mock_test_questions_order').on(
      table.mockTestId,
      table.orderIndex
    ),
  })
)

// Mock Test Attempts - User's test sessions
export const mockTestAttempts = pgTable(
  'mock_test_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mockTestId: uuid('mock_test_id')
      .notNull()
      .references(() => mockTests.id, { onDelete: 'cascade' }),
    status: attemptStatusEnum('status').notNull().default('not_started'),
    currentQuestionIndex: integer('current_question_index').notNull().default(0),
    currentSection: mockTestSectionEnum('current_section').default('speaking'),
    startedAt: timestamp('started_at'),
    pausedAt: timestamp('paused_at'),
    resumedAt: timestamp('resumed_at'),
    completedAt: timestamp('completed_at'),
    timeRemainingSeconds: integer('time_remaining_seconds'), // For resume functionality
    pauseCount: integer('pause_count').notNull().default(0), // Max 2 pauses allowed

    // Scores (0-90 scale)
    overallScore: integer('overall_score'),
    speakingScore: integer('speaking_score'),
    writingScore: integer('writing_score'),
    readingScore: integer('reading_score'),
    listeningScore: integer('listening_score'),

    // Enabling Skills (0-90 scale each)
    enablingSkills: jsonb('enabling_skills').$type<{
      grammar?: number
      oralFluency?: number
      pronunciation?: number
      spelling?: number
      vocabulary?: number
      writtenDiscourse?: number
    }>(),

    // Time tracking
    timeSpent: jsonb('time_spent').$type<{
      speaking?: number
      writing?: number
      reading?: number
      listening?: number
      totalSeconds?: number
    }>(),

    // Additional metadata
    metadata: jsonb('metadata').$type<{
      deviceInfo?: string
      browserInfo?: string
      ipAddress?: string
      pauseReasons?: string[]
      flaggedForReview?: boolean
      reviewNotes?: string
      [key: string]: any
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_mock_test_attempts_user_id').on(table.userId),
    mockTestIdIdx: index('idx_mock_test_attempts_test_id').on(
      table.mockTestId
    ),
    statusIdx: index('idx_mock_test_attempts_status').on(table.status),
    completedAtIdx: index('idx_mock_test_attempts_completed_at').on(
      table.completedAt
    ),
    userTestIdx: index('idx_mock_test_attempts_user_test').on(
      table.userId,
      table.mockTestId
    ),
  })
)

// Mock Test Answers - Individual question responses
export const mockTestAnswers = pgTable(
  'mock_test_answers',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => mockTestAttempts.id, { onDelete: 'cascade' }),
    mockTestQuestionId: uuid('mock_test_question_id')
      .notNull()
      .references(() => mockTestQuestions.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id').notNull(), // Polymorphic reference
    questionTable: questionTableEnum('question_table').notNull(),

    // User response (flexible for any question type)
    userResponse: jsonb('user_response').$type<{
      text?: string
      audio?: string
      selectedOptions?: string[]
      dragDropOrder?: string[]
      fillInBlanks?: Record<string, string>
      [key: string]: any
    }>(),

    // Scoring
    isCorrect: boolean('is_correct'),
    pointsEarned: integer('points_earned'),
    pointsPossible: integer('points_possible'),

    // Detailed AI scores for speaking/writing
    scores: jsonb('scores').$type<{
      overall?: number
      content?: number
      pronunciation?: number
      fluency?: number
      grammar?: number
      vocabulary?: number
      structure?: number
      coherence?: number
      spelling?: number
      [key: string]: any
    }>(),

    aiFeedback: text('ai_feedback'),
    timeTakenSeconds: integer('time_taken_seconds'),
    flaggedForHumanReview: boolean('flagged_for_human_review').default(false),
    humanReviewCompleted: boolean('human_review_completed').default(false),
    humanReviewNotes: text('human_review_notes'),

    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    attemptIdIdx: index('idx_mock_test_answers_attempt_id').on(
      table.attemptId
    ),
    questionIdIdx: index('idx_mock_test_answers_question_id').on(
      table.questionId
    ),
    flaggedIdx: index('idx_mock_test_answers_flagged').on(
      table.flaggedForHumanReview
    ),
  })
)

// Relations
export const mockTestsRelations = relations(mockTests, ({ many }) => ({
  questions: many(mockTestQuestions),
  attempts: many(mockTestAttempts),
}))

export const mockTestQuestionsRelations = relations(
  mockTestQuestions,
  ({ one, many }) => ({
    mockTest: one(mockTests, {
      fields: [mockTestQuestions.mockTestId],
      references: [mockTests.id],
    }),
    answers: many(mockTestAnswers),
  })
)

export const mockTestAttemptsRelations = relations(
  mockTestAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [mockTestAttempts.userId],
      references: [users.id],
    }),
    mockTest: one(mockTests, {
      fields: [mockTestAttempts.mockTestId],
      references: [mockTests.id],
    }),
    answers: many(mockTestAnswers),
  })
)

export const mockTestAnswersRelations = relations(
  mockTestAnswers,
  ({ one }) => ({
    attempt: one(mockTestAttempts, {
      fields: [mockTestAnswers.attemptId],
      references: [mockTestAttempts.id],
    }),
    mockTestQuestion: one(mockTestQuestions, {
      fields: [mockTestAnswers.mockTestQuestionId],
      references: [mockTestQuestions.id],
    }),
  })
)

// Type exports
export type MockTest = typeof mockTests.$inferSelect
export type NewMockTest = typeof mockTests.$inferInsert

export type MockTestQuestion = typeof mockTestQuestions.$inferSelect
export type NewMockTestQuestion = typeof mockTestQuestions.$inferInsert

export type MockTestAttempt = typeof mockTestAttempts.$inferSelect
export type NewMockTestAttempt = typeof mockTestAttempts.$inferInsert

export type MockTestAnswer = typeof mockTestAnswers.$inferSelect
export type NewMockTestAnswer = typeof mockTestAnswers.$inferInsert

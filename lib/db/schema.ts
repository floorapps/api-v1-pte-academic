import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

// Enums (Postgres)
export const speakingTypeEnum = pgEnum('speaking_type', [
  'read_aloud',
  'repeat_sentence',
  'describe_image',
  'retell_lecture',
  'answer_short_question',
  'summarize_group_discussion',
  'respond_to_a_situation',
])

export const readingQuestionTypeEnum = pgEnum('reading_question_type', [
  'multiple_choice_single',
  'multiple_choice_multiple',
  'reorder_paragraphs',
  'fill_in_blanks',
  'reading_writing_fill_blanks',
])

export const writingQuestionTypeEnum = pgEnum('writing_question_type', [
  'summarize_written_text',
  'write_essay',
])

export const listeningQuestionTypeEnum = pgEnum('listening_question_type', [
  'summarize_spoken_text',
  'multiple_choice_single',
  'multiple_choice_multiple',
  'fill_in_blanks',
  'highlight_correct_summary',
  'select_missing_word',
  'highlight_incorrect_words',
  'write_from_dictation',
])

export const difficultyEnum = pgEnum('difficulty_level', [
  'Easy',
  'Medium',
  'Hard',
])

// Better Auth: User table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  // Custom fields for your app
  dailyAiCredits: integer('daily_ai_credits').notNull().default(4),
  aiCreditsUsed: integer('ai_credits_used').notNull().default(0),
  lastCreditReset: timestamp('last_credit_reset').defaultNow(),
  organizationId: uuid('organization_id'),
  role: text('role').default('student'),
})

// Better Auth: Session table (REQUIRED - was missing!)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

// Better Auth: Account table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

// Better Auth: Verification table
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Custom: Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  planType: text('plan_type').default('free'),
  customBranding: jsonb('custom_branding'),
  settings: jsonb('settings'),
  maxUsers: integer('max_users').default(10),
  apiKey: text('api_key'),
  webhookUrl: text('webhook_url'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// PTE Tests table
export const pteTests = pgTable('pte_tests', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  testType: text('test_type').notNull(), // 'mock', 'practice', 'scored'
  section: text('section'), // 'speaking', 'writing', 'reading', 'listening'
  isPremium: text('is_premium').default('false'),
  duration: integer('duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// PTE Questions table
export const pteQuestions = pgTable('pte_questions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  testId: uuid('test_id').references(() => pteTests.id, {
    onDelete: 'cascade',
  }),
  // External source identity to support mirroring from OnePTE-like API
  externalId: text('external_id'),
  source: text('source').default('local'),
  question: text('question').notNull(),
  questionType: text('question_type').notNull(), // e.g., s_read_aloud, s_repeat_sentence, etc.
  section: text('section').notNull(), // speaking, writing, reading, listening
  questionData: jsonb('question_data'), // JSON for options, audio URLs, images, etc.
  tags: jsonb('tags'),
  correctAnswer: text('correct_answer'),
  points: integer('points').default(1),
  orderIndex: integer('order_index').default(0),
  difficulty: text('difficulty'), // 'easy', 'medium', 'hard'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Test Attempts table
export const testAttempts = pgTable('test_attempts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  testId: uuid('test_id')
    .notNull()
    .references(() => pteTests.id, { onDelete: 'cascade' }),
  status: text('status').default('in_progress'), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  totalScore: text('total_score'),
  speakingScore: text('speaking_score'),
  writingScore: text('writing_score'),
  readingScore: text('reading_score'),
  listeningScore: text('listening_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Test Answers table
export const testAnswers = pgTable('test_answers', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct'),
  pointsEarned: integer('points_earned').default(0),
  aiFeedback: text('ai_feedback'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User Progress table
export const userProgress = pgTable('user_progress', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  overallScore: integer('overall_score').default(0),
  speakingScore: integer('speaking_score').default(0),
  writingScore: integer('writing_score').default(0),
  readingScore: integer('reading_score').default(0),
  listeningScore: integer('listening_score').default(0),
  testsCompleted: integer('tests_completed').default(0),
  questionsAnswered: integer('questions_answered').default(0),
  studyStreak: integer('study_streak').default(0),
  totalStudyTime: integer('total_study_time').default(0), // in minutes
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User Subscriptions table
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planType: text('plan_type').notNull(), // 'free', 'basic', 'premium', 'enterprise'
  status: text('status').default('active'), // 'active', 'expired', 'cancelled'
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(true),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User Profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  targetScore: integer('target_score'),
  examDate: timestamp('exam_date'),
  studyGoal: text('study_goal'),
  phoneNumber: text('phone_number'),
  country: text('country'),
  timezone: text('timezone'),
  preferences: jsonb('preferences'), // JSON for user preferences
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Practice Sessions table
export const practiceSessions = pgTable('practice_sessions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  score: integer('score'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Forums table
export const forums = pgTable('forums', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  forumId: uuid('forum_id')
    .notNull()
    .references(() => forums.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').default(false),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Teams table
export const teams = pgTable('teams', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: uuid('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Team Members table
export const teamMembers = pgTable('team_members', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('member'), // 'admin', 'member', 'viewer'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Activity Logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Media linked to questions (audio, image, video)
 */
export const pteQuestionMedia = pgTable('pte_question_media', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // 'audio' | 'image' | 'video'
  url: text('url').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/**
 * Sync job tracking for external imports
 */
export const pteSyncJobs = pgTable('pte_sync_jobs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobType: text('job_type').notNull(), // 'speaking' | 'writing' | 'reading' | 'listening'
  questionType: text('question_type'),
  status: text('status').notNull().default('pending'), // 'pending' | 'running' | 'success' | 'error'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  stats: jsonb('stats'),
  error: text('error'),
})

/**
 * User exam settings that influence question selection
 */
export const pteUserExamSettings = pgTable('pte_user_exam_settings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examDate: timestamp('exam_date'),
  targetScore: integer('target_score'),
  preferences: jsonb('preferences'), // e.g., preferred difficulty, time per session, module toggles
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Speaking system tables

export const speakingQuestions = pgTable(
  'speaking_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: speakingTypeEnum('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text'),
    promptMediaUrl: text('prompt_media_url'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_speaking_questions_type').on(table.type),
    idxActive: index('idx_speaking_questions_is_active').on(table.isActive),
    idxTagsGin: index('idx_speaking_questions_tags_gin').using(
      'gin',
      table.tags
    ),
  })
)

export const speakingAttempts = pgTable(
  'speaking_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => speakingQuestions.id, { onDelete: 'cascade' }),
    type: speakingTypeEnum('type').notNull(),
    audioUrl: text('audio_url').notNull(),
    transcript: text('transcript'),
    scores: jsonb('scores')
      .notNull()
      .default(sql`'{}'::jsonb`),
    durationMs: integer('duration_ms').notNull(),
    wordsPerMinute: decimal('words_per_minute', { precision: 6, scale: 2 }),
    fillerRate: decimal('filler_rate', { precision: 6, scale: 3 }),
    timings: jsonb('timings').notNull(),
    isPublic: boolean('is_public').notNull().default(false), // For community sharing
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxQuestion: index('idx_speaking_attempts_question').on(table.questionId),
    idxUserType: index('idx_speaking_attempts_user_type').on(
      table.userId,
      table.type
    ),
    idxPublic: index('idx_speaking_attempts_public').on(table.isPublic),
  })
)

// Speaking answer templates for high-scoring examples
export const speakingTemplates = pgTable(
  'speaking_templates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: speakingTypeEnum('type').notNull(),
    title: text('title').notNull(),
    templateText: text('template_text').notNull(),
    audioUrl: text('audio_url'), // Audio example of the template
    scoreRange: text('score_range').notNull(), // e.g., "70-90", "80-90"
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    isRecommended: boolean('is_recommended').notNull().default(false),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    usageCount: integer('usage_count').notNull().default(0), // Track popularity
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_speaking_templates_type').on(table.type),
    idxRecommended: index('idx_speaking_templates_recommended').on(
      table.isRecommended
    ),
  })
)

export const readingAttempts = pgTable(
  'reading_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => readingQuestions.id, { onDelete: 'cascade' }),
    userResponse: jsonb('user_response').notNull(), // Store answers, selections, etc.
    scores: jsonb('scores'), // { accuracy: number, correctAnswers: number, totalAnswers: number }
    timeTaken: integer('time_taken'), // in seconds
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('reading_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('reading_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('reading_attempts_created_at_idx').on(table.createdAt),
  })
)

export const readingQuestions = pgTable(
  'reading_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text').notNull(),
    options: jsonb('options'),
    answerKey: jsonb('answer_key'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_reading_questions_type').on(table.type),
    idxActive: index('idx_reading_questions_is_active').on(table.isActive),
  })
)

export const writingQuestions = pgTable(
  'writing_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text').notNull(),
    options: jsonb('options'),
    answerKey: jsonb('answer_key'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_writing_questions_type').on(table.type),
    idxActive: index('idx_writing_questions_is_active').on(table.isActive),
  })
)

export const writingAttempts = pgTable(
  'writing_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => writingQuestions.id, { onDelete: 'cascade' }),
    userResponse: text('user_response').notNull(), // Store essay/summary text
    scores: jsonb('scores'), // { grammar, vocabulary, coherence, taskResponse, wordCount, etc. }
    timeTaken: integer('time_taken'), // in seconds
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('writing_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('writing_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('writing_attempts_created_at_idx').on(table.createdAt),
  })
)

// Listening system tables

export const pteCategories = pgTable('pte_categories', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  code: text('code').notNull(),
  scoring_type: text('scoring_type'),
  short_name: text('short_name'),
  first_question_id: integer('first_question_id'),
  color: text('color'),
  parent: integer('parent'),
  practice_count: integer('practice_count').default(0),
  question_count: integer('question_count').default(0),
  video_link: text('video_link'),
})

export const listeningQuestions = pgTable(
  'listening_questions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: listeningQuestionTypeEnum('type').notNull(),
    title: text('title').notNull(),
    promptText: text('prompt_text'),
    promptMediaUrl: text('prompt_media_url'),
    correctAnswers: jsonb('correct_answers').notNull(),
    options: jsonb('options'),
    transcript: text('transcript'),
    difficulty: difficultyEnum('difficulty').notNull().default('Medium'),
    tags: jsonb('tags').default(sql`'[]'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    bookmarked: boolean('bookmarked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index('listening_questions_type_idx').on(table.type),
    difficultyIdx: index('listening_questions_difficulty_idx').on(
      table.difficulty
    ),
    createdAtIdx: index('listening_questions_created_at_idx').on(
      table.createdAt
    ),
  })
)

export const listeningAttempts = pgTable(
  'listening_attempts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => listeningQuestions.id, { onDelete: 'cascade' }),
    userResponse: jsonb('user_response').notNull(),
    scores: jsonb('scores'),
    timeTaken: integer('time_taken'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('listening_attempts_user_id_idx').on(table.userId),
    questionIdIdx: index('listening_attempts_question_id_idx').on(
      table.questionId
    ),
    createdAtIdx: index('listening_attempts_created_at_idx').on(
      table.createdAt
    ),
  })
)

// User Scheduled Exam Dates table
export const userScheduledExamDates = pgTable(
  'user_scheduled_exam_dates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    examDate: timestamp('exam_date').notNull(),
    examName: text('exam_name').default('PTE Academic').notNull(),
    isPrimary: boolean('is_primary').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_user_scheduled_exam_dates_user_id').on(table.userId),
    examDateIdx: index('idx_user_scheduled_exam_dates_exam_date').on(
      table.examDate
    ),
  })
)

// ========================================
// Conversation Tables (OpenAI Realtime API)
// ========================================

// Enum for conversation session types
export const conversationSessionTypeEnum = pgEnum('conversation_session_type', [
  'speaking_practice',
  'mock_interview',
  'pronunciation_coach',
  'fluency_training',
  'customer_support',
])

// Enum for conversation status
export const conversationStatusEnum = pgEnum('conversation_status', [
  'active',
  'completed',
  'abandoned',
  'error',
])

// Enum for conversation turn roles
export const conversationRoleEnum = pgEnum('conversation_role', [
  'user',
  'assistant',
  'system',
])

// Conversation Sessions Table
export const conversationSessions = pgTable(
  'conversation_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionType: conversationSessionTypeEnum('session_type')
      .notNull()
      .default('speaking_practice'),
    status: conversationStatusEnum('status').notNull().default('active'),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    endedAt: timestamp('ended_at'),
    totalTurns: integer('total_turns').default(0).notNull(),
    totalDurationMs: integer('total_duration_ms').default(0),
    aiProvider: text('ai_provider').default('openai'),
    modelUsed: text('model_used').default('gpt-4o-realtime-preview'),
    tokenUsage: jsonb('token_usage').$type<{
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }>(),
    metadata: jsonb('metadata').$type<{
      averageResponseTimeMs?: number
      interruptionCount?: number
      conversationScore?: number
      topics?: string[]
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_conversation_sessions_user_id').on(table.userId),
    statusIdx: index('idx_conversation_sessions_status').on(table.status),
    sessionTypeIdx: index('idx_conversation_sessions_type').on(
      table.sessionType
    ),
    createdAtIdx: index('idx_conversation_sessions_created_at').on(
      table.createdAt
    ),
  })
)

// Conversation Turns Table (individual messages)
export const conversationTurns = pgTable(
  'conversation_turns',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => conversationSessions.id, { onDelete: 'cascade' }),
    turnIndex: integer('turn_index').notNull(),
    role: conversationRoleEnum('role').notNull(),
    audioUrl: text('audio_url'),
    transcript: text('transcript'),
    scores: jsonb('scores').$type<{
      pronunciation?: number
      fluency?: number
      content?: number
      grammarScore?: number
      vocabularyScore?: number
      total?: number
      feedback?: string
      [key: string]: any
    }>(),
    durationMs: integer('duration_ms'),
    silenceDurationMs: integer('silence_duration_ms'),
    wordsPerMinute: decimal('words_per_minute', { precision: 6, scale: 2 }),
    pauseCount: integer('pause_count'),
    fillerWordCount: integer('filler_word_count'),
    metadata: jsonb('metadata').$type<{
      audioFormat?: string
      sampleRate?: number
      interrupted?: boolean
      responseTimeMs?: number
      [key: string]: any
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('idx_conversation_turns_session_id').on(
      table.sessionId
    ),
    turnIndexIdx: index('idx_conversation_turns_turn_index').on(
      table.turnIndex
    ),
    roleIdx: index('idx_conversation_turns_role').on(table.role),
    createdAtIdx: index('idx_conversation_turns_created_at').on(
      table.createdAt
    ),
  })
)

// Link conversation sessions to speaking/writing attempts for scoring
export const conversationAttemptLinks = pgTable(
  'conversation_attempt_links',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => conversationSessions.id, { onDelete: 'cascade' }),
    attemptId: uuid('attempt_id').notNull(), // Can reference speakingAttempts or writingAttempts
    attemptType: text('attempt_type').notNull(), // 'speaking' | 'writing'
    linkType: text('link_type').default('generated_from'), // 'generated_from' | 'scored_as' | 'related_to'
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('idx_conversation_links_session_id').on(
      table.sessionId
    ),
    attemptIdIdx: index('idx_conversation_links_attempt_id').on(
      table.attemptId
    ),
    attemptTypeIdx: index('idx_conversation_links_attempt_type').on(
      table.attemptType
    ),
  })
)

// AI Credit Usage Tracking
export const aiUsageTypeEnum = pgEnum('ai_usage_type', [
  'transcription',
  'scoring',
  'feedback',
  'realtime_voice',
  'text_generation',
  'other',
])

export const aiCreditUsage = pgTable(
  'ai_credit_usage',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    usageType: aiUsageTypeEnum('usage_type').notNull(),
    provider: text('provider').notNull(), // 'openai' | 'gemini' | 'vercel' | etc.
    model: text('model'), // e.g., 'gpt-4o', 'gemini-1.5-pro', etc.
    inputTokens: integer('input_tokens').default(0),
    outputTokens: integer('output_tokens').default(0),
    totalTokens: integer('total_tokens').default(0),
    audioSeconds: decimal('audio_seconds', { precision: 10, scale: 2 }), // For Realtime/Whisper
    cost: decimal('cost', { precision: 10, scale: 6 }), // Estimated cost in USD
    sessionId: uuid('session_id'), // Optional: link to conversation session
    attemptId: uuid('attempt_id'), // Optional: link to attempt (speaking/writing/etc.)
    attemptType: text('attempt_type'), // 'speaking' | 'writing' | 'reading' | 'listening'
    metadata: jsonb('metadata'), // Additional tracking data
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_ai_usage_user_id').on(table.userId),
    typeIdx: index('idx_ai_usage_type').on(table.usageType),
    providerIdx: index('idx_ai_usage_provider').on(table.provider),
    createdAtIdx: index('idx_ai_usage_created_at').on(table.createdAt),
    sessionIdIdx: index('idx_ai_usage_session_id').on(table.sessionId),
    attemptIdIdx: index('idx_ai_usage_attempt_id').on(table.attemptId),
  })
)

// Relations
// New relations for Speaking system
export const speakingQuestionsRelations = relations(
  speakingQuestions,
  ({ many }) => ({
    attempts: many(speakingAttempts),
  })
)

export const speakingAttemptsRelations = relations(
  speakingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [speakingAttempts.userId],
      references: [users.id],
    }),
    question: one(speakingQuestions, {
      fields: [speakingAttempts.questionId],
      references: [speakingQuestions.id],
    }),
  })
)

export const readingAttemptsRelations = relations(
  readingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [readingAttempts.userId],
      references: [users.id],
    }),
    question: one(readingQuestions, {
      fields: [readingAttempts.questionId],
      references: [readingQuestions.id],
    }),
  })
)

export const writingAttemptsRelations = relations(
  writingAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [writingAttempts.userId],
      references: [users.id],
    }),
    question: one(writingQuestions, {
      fields: [writingAttempts.questionId],
      references: [writingQuestions.id],
    }),
  })
)

export const listeningQuestionsRelations = relations(
  listeningQuestions,
  ({ many }) => ({
    attempts: many(listeningAttempts),
  })
)

export const listeningAttemptsRelations = relations(
  listeningAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [listeningAttempts.userId],
      references: [users.id],
    }),
    question: one(listeningQuestions, {
      fields: [listeningAttempts.questionId],
      references: [listeningQuestions.id],
    }),
  })
)

export const userScheduledExamDatesRelations = relations(
  userScheduledExamDates,
  ({ one }) => ({
    user: one(users, {
      fields: [userScheduledExamDates.userId],
      references: [users.id],
    }),
  })
)
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  progress: one(userProgress),
  profile: one(userProfiles),
  subscriptions: many(userSubscriptions),
  testAttempts: many(testAttempts),
  posts: many(posts),
  comments: many(comments),
  teamMemberships: many(teamMembers),
  activityLogs: many(activityLogs),
  practiceSessions: many(practiceSessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  teams: many(teams),
}))

export const verificationsRelations = relations(verifications, () => ({}))

export const conversationSessionsRelations = relations(
  conversationSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversationSessions.userId],
      references: [users.id],
    }),
    turns: many(conversationTurns),
    attemptLinks: many(conversationAttemptLinks),
  })
)

export const conversationTurnsRelations = relations(
  conversationTurns,
  ({ one }) => ({
    session: one(conversationSessions, {
      fields: [conversationTurns.sessionId],
      references: [conversationSessions.id],
    }),
  })
)

export const conversationAttemptLinksRelations = relations(
  conversationAttemptLinks,
  ({ one }) => ({
    session: one(conversationSessions, {
      fields: [conversationAttemptLinks.sessionId],
      references: [conversationSessions.id],
    }),
  })
)

export const aiCreditUsageRelations = relations(aiCreditUsage, ({ one }) => ({
  user: one(users, {
    fields: [aiCreditUsage.userId],
    references: [users.id],
  }),
  session: one(conversationSessions, {
    fields: [aiCreditUsage.sessionId],
    references: [conversationSessions.id],
  }),
}))

export const pteTestsRelations = relations(pteTests, ({ many }) => ({
  questions: many(pteQuestions),
  attempts: many(testAttempts),
}))

export const pteQuestionsRelations = relations(
  pteQuestions,
  ({ one, many }) => ({
    test: one(pteTests, {
      fields: [pteQuestions.testId],
      references: [pteTests.id],
    }),
    answers: many(testAnswers),
    practiceSessions: many(practiceSessions),
  })
)

// New relations
export const pteQuestionMediaRelations = relations(
  pteQuestionMedia,
  ({ one }) => ({
    question: one(pteQuestions, {
      fields: [pteQuestionMedia.questionId],
      references: [pteQuestions.id],
    }),
  })
)

export const pteUserExamSettingsRelations = relations(
  pteUserExamSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [pteUserExamSettings.userId],
      references: [users.id],
    }),
  })
)

export const testAttemptsRelations = relations(
  testAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [testAttempts.userId],
      references: [users.id],
    }),
    test: one(pteTests, {
      fields: [testAttempts.testId],
      references: [pteTests.id],
    }),
    answers: many(testAnswers),
  })
)

export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [testAnswers.attemptId],
    references: [testAttempts.id],
  }),
  question: one(pteQuestions, {
    fields: [testAnswers.questionId],
    references: [pteQuestions.id],
  }),
}))

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}))

export const userSubscriptionsRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [userSubscriptions.userId],
      references: [users.id],
    }),
  })
)

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
    question: one(pteQuestions, {
      fields: [practiceSessions.questionId],
      references: [pteQuestions.id],
    }),
  })
)

export const forumsRelations = relations(forums, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  forum: one(forums, {
    fields: [posts.forumId],
    references: [forums.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  members: many(teamMembers),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type PteTest = typeof pteTests.$inferSelect
export type NewPteTest = typeof pteTests.$inferInsert
export type PteQuestion = typeof pteQuestions.$inferSelect
export type NewPteQuestion = typeof pteQuestions.$inferInsert
export type TestAttempt = typeof testAttempts.$inferSelect
export type NewTestAttempt = typeof testAttempts.$inferInsert
export type TestAnswer = typeof testAnswers.$inferSelect
export type NewTestAnswer = typeof testAnswers.$inferInsert
export type UserProgress = typeof userProgress.$inferSelect
export type NewUserProgress = typeof userProgress.$inferInsert
export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type PracticeSession = typeof practiceSessions.$inferSelect
export type NewPracticeSession = typeof practiceSessions.$inferInsert
export type Forum = typeof forums.$inferSelect
export type NewForum = typeof forums.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type TeamMember = typeof teamMembers.$inferSelect
export type NewTeamMember = typeof teamMembers.$inferInsert
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert

// New type exports
export type PteQuestionMedia = typeof pteQuestionMedia.$inferSelect
export type NewPteQuestionMedia = typeof pteQuestionMedia.$inferInsert

export type PteSyncJob = typeof pteSyncJobs.$inferSelect
export type NewPteSyncJob = typeof pteSyncJobs.$inferInsert

export type PteUserExamSettings = typeof pteUserExamSettings.$inferSelect
export type NewPteUserExamSettings = typeof pteUserExamSettings.$inferInsert
// Speaking system type exports
export type SpeakingQuestion = typeof speakingQuestions.$inferSelect
export type NewSpeakingQuestion = typeof speakingQuestions.$inferInsert

export type SpeakingAttempt = typeof speakingAttempts.$inferSelect
export type NewSpeakingAttempt = typeof speakingAttempts.$inferInsert

export type SpeakingTemplate = typeof speakingTemplates.$inferSelect
export type NewSpeakingTemplate = typeof speakingTemplates.$inferInsert

export type ReadingAttempt = typeof readingAttempts.$inferSelect
export type NewReadingAttempt = typeof readingAttempts.$inferInsert

export type ReadingQuestion = typeof readingQuestions.$inferSelect
export type NewReadingQuestion = typeof readingQuestions.$inferInsert

export type WritingQuestion = typeof writingQuestions.$inferSelect
export type NewWritingQuestion = typeof writingQuestions.$inferInsert

export type WritingAttempt = typeof writingAttempts.$inferSelect
export type NewWritingAttempt = typeof writingAttempts.$inferInsert

export type ListeningQuestion = typeof listeningQuestions.$inferSelect
export type NewListeningQuestion = typeof listeningQuestions.$inferInsert

export type ListeningAttempt = typeof listeningAttempts.$inferSelect
export type NewListeningAttempt = typeof listeningAttempts.$inferInsert

export type UserScheduledExamDate = typeof userScheduledExamDates.$inferSelect
export type NewUserScheduledExamDate =
  typeof userScheduledExamDates.$inferInsert

export type ConversationSession = typeof conversationSessions.$inferSelect
export type NewConversationSession = typeof conversationSessions.$inferInsert

export type ConversationTurn = typeof conversationTurns.$inferSelect
export type NewConversationTurn = typeof conversationTurns.$inferInsert

export type ConversationAttemptLink =
  typeof conversationAttemptLinks.$inferSelect
export type NewConversationAttemptLink =
  typeof conversationAttemptLinks.$inferInsert

export type AICreditUsage = typeof aiCreditUsage.$inferSelect
export type NewAICreditUsage = typeof aiCreditUsage.$inferInsert

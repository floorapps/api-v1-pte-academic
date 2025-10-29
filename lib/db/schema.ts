import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Better Auth tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: varchar('provider_id', { length: 50 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid('team_id').references(() => teams.id),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// PTE Test Tables
export const pteTests = pgTable('pte_tests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  testType: varchar('test_type', { length: 20 }).notNull(), // 'ACADEMIC' or 'CORE'
  duration: varchar('duration', { length: 50 }), // e.g., '2 hours'
  isPremium: varchar('is_premium', { length: 10 }).notNull().default('false'), // 'true' or 'false'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pteQuestions = pgTable('pte_questions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  testId: uuid('test_id')
    .notNull()
    .references(() => pteTests.id),
  section: varchar('section', { length: 50 }).notNull(), // 'READING', 'WRITING', 'LISTENING', 'SPEAKING'
  questionType: varchar('question_type', { length: 100 }).notNull(), // e.g., 'Multiple Choice', 'Essay', 'Read Aloud'
  question: text('question').notNull(),
  questionData: text('question_data'), // JSON string for additional data (audio URLs, images, options, etc.)
  correctAnswer: text('correct_answer'), // JSON string for answer key
  points: varchar('points', { length: 20 }).notNull().default('1'),
  orderIndex: varchar('order_index', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const testAttempts = pgTable('test_attempts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  testId: uuid('test_id')
    .notNull()
    .references(() => pteTests.id),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  totalScore: varchar('total_score', { length: 20 }),
  readingScore: varchar('reading_score', { length: 20 }),
  writingScore: varchar('writing_score', { length: 20 }),
  listeningScore: varchar('listening_score', { length: 20 }),
  speakingScore: varchar('speaking_score', { length: 20 }),
});

export const testAnswers = pgTable('test_answers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => testAttempts.id),
  questionId: uuid('question_id')
    .notNull()
    .references(() => pteQuestions.id),
  userAnswer: text('user_answer'), // JSON string for answer data
  isCorrect: varchar('is_correct', { length: 10 }), // 'true', 'false', or null for subjective
  pointsEarned: varchar('points_earned', { length: 20 }),
  aiFeedback: text('ai_feedback'), // AI-generated feedback
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
});

export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  plan: varchar('plan', { length: 20 }).notNull().default('free'), // 'free' or 'pro'
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'cancelled', 'expired'
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const pteTestsRelations = relations(pteTests, ({ many }) => ({
  questions: many(pteQuestions),
  attempts: many(testAttempts),
}));

export const pteQuestionsRelations = relations(pteQuestions, ({ one, many }) => ({
  test: one(pteTests, {
    fields: [pteQuestions.testId],
    references: [pteTests.id],
  }),
  answers: many(testAnswers),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [testAttempts.userId],
    references: [users.id],
  }),
  test: one(pteTests, {
    fields: [testAttempts.testId],
    references: [pteTests.id],
  }),
  answers: many(testAnswers),
}));

export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
  attempt: one(testAttempts, {
    fields: [testAnswers.attemptId],
    references: [testAttempts.id],
  }),
  question: one(pteQuestions, {
    fields: [testAnswers.questionId],
    references: [pteQuestions.id],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
}));

// Type exports
export type PteTest = typeof pteTests.$inferSelect;
export type NewPteTest = typeof pteTests.$inferInsert;
export type PteQuestion = typeof pteQuestions.$inferSelect;
export type NewPteQuestion = typeof pteQuestions.$inferInsert;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type NewTestAttempt = typeof testAttempts.$inferInsert;
export type TestAnswer = typeof testAnswers.$inferSelect;
export type NewTestAnswer = typeof testAnswers.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  START_TEST = 'START_TEST',
  COMPLETE_TEST = 'COMPLETE_TEST',
  UPGRADE_SUBSCRIPTION = 'UPGRADE_SUBSCRIPTION',
}

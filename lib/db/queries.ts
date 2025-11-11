import "server-only";
import { cache } from 'react';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  users,
  pteTests,
  pteQuestions,
  testAttempts,
  testAnswers,
  userProgress,
  userSubscriptions,
  userProfiles,
  forums,
  posts,
  comments,
  teams,
  teamMembers,
  activityLogs
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';

// User queries with improved error handling and caching
export const getUserProfile = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
});

export const getUser = getUserProfile;

// Get user with profile and progress data
export const getUserWithProfile = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const userData = await db
    .select({
      user: users,
      profile: userProfiles,
      progress: userProgress,
      subscription: userSubscriptions,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userProgress, eq(users.id, userProgress.userId))
    .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (userData.length === 0) {
    return null;
  }

  return userData[0];
});

// Team/Organization queries
export const getTeamForUser = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  // Note: organizations table doesn't exist in schema, using teams instead
  const userTeams = await db
    .select({
      team: teams,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, authUser.id))
    .limit(1);

  if (userTeams.length === 0) {
    return null;
  }

  return userTeams[0].team;
});

// Get team members for a user
export const getTeamMembers = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return [];
  }

  const userTeams = await db
    .select({
      team: teams,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, authUser.id));

  if (userTeams.length === 0) {
    return [];
  }

  // Get all members of user's teams
  const teamIds = userTeams.map(t => t.team.id);
  const members = await db
    .select({
      user: users,
      team: teams,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(sql`${teams.id} = ANY(${teamIds})`);

  return members;
});

// PTE Tests queries
export const getTests = cache(async () => {
  const tests = await db
    .select()
    .from(pteTests)
    .orderBy(desc(pteTests.createdAt));

  return tests;
});

export const getTestById = cache(async (testId: string) => {
  const test = await db
    .select()
    .from(pteTests)
    .where(eq(pteTests.id, testId))
    .limit(1);

  if (test.length === 0) {
    return null;
  }

  return test[0];
});

export const getTestWithQuestions = cache(async (testId: string) => {
  const test = await getTestById(testId);
  if (!test) {
    return null;
  }

  const questions = await db
    .select()
    .from(pteQuestions)
    .where(eq(pteQuestions.testId, testId))
    .orderBy(pteQuestions.orderIndex);

  return {
    ...test,
    questions,
  };
});

// Test attempts and answers
export const getUserTestAttempts = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return [];
  }

  const attempts = await db
    .select({
      attempt: testAttempts,
      test: pteTests,
    })
    .from(testAttempts)
    .innerJoin(pteTests, eq(testAttempts.testId, pteTests.id))
    .where(eq(testAttempts.userId, authUser.id))
    .orderBy(desc(testAttempts.startedAt));

  return attempts;
});

export const getTestAttemptWithAnswers = cache(async (attemptId: string) => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const attempt = await db
    .select()
    .from(testAttempts)
    .where(and(eq(testAttempts.id, attemptId), eq(testAttempts.userId, authUser.id)))
    .limit(1);

  if (attempt.length === 0) {
    return null;
  }

  const answers = await db
    .select({
      answer: testAnswers,
      question: pteQuestions,
    })
    .from(testAnswers)
    .innerJoin(pteQuestions, eq(testAnswers.questionId, pteQuestions.id))
    .where(eq(testAnswers.attemptId, attemptId))
    .orderBy(testAnswers.submittedAt);

  return {
    ...attempt[0],
    answers,
  };
});

// User progress and analytics
export const getUserProgress = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  const progress = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, authUser.id))
    .limit(1);

  if (progress.length === 0) {
    return null;
  }

  return progress[0];
});

export const getUserAnalytics = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return null;
  }

  // Get recent test attempts with scores
  const recentAttempts = await db
    .select({
      attempt: testAttempts,
      test: pteTests,
    })
    .from(testAttempts)
    .innerJoin(pteTests, eq(testAttempts.testId, pteTests.id))
    .where(and(
      eq(testAttempts.userId, authUser.id),
      eq(testAttempts.status, 'completed')
    ))
    .orderBy(desc(testAttempts.completedAt))
    .limit(10);

  // Calculate average scores
  const totalAttempts = recentAttempts.length;
  const avgScores = totalAttempts > 0 ? {
    speaking: recentAttempts.reduce((sum, a) => sum + parseFloat(a.attempt.speakingScore || '0'), 0) / totalAttempts,
    writing: recentAttempts.reduce((sum, a) => sum + parseFloat(a.attempt.writingScore || '0'), 0) / totalAttempts,
    reading: recentAttempts.reduce((sum, a) => sum + parseFloat(a.attempt.readingScore || '0'), 0) / totalAttempts,
    listening: recentAttempts.reduce((sum, a) => sum + parseFloat(a.attempt.listeningScore || '0'), 0) / totalAttempts,
    overall: recentAttempts.reduce((sum, a) => sum + parseFloat(a.attempt.totalScore || '0'), 0) / totalAttempts,
  } : null;

  return {
    recentAttempts,
    averageScores: avgScores,
    totalAttempts,
  };
});

// Community features
export const getForums = cache(async () => {
  const forumList = await db
    .select()
    .from(forums)
    .where(eq(forums.isActive, true))
    .orderBy(forums.orderIndex);

  return forumList;
});

export const getForumPosts = cache(async (forumId: string, limit = 20, offset = 0) => {
  const posts = await db
    .select({
      post: posts,
      author: users,
      commentCount: sql<number>`count(${comments.id})`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(comments, eq(posts.id, comments.postId))
    .where(eq(posts.forumId, forumId))
    .groupBy(posts.id, users.id)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return posts;
});

// User update functions
export async function updateUser(userData: Partial<typeof users.$inferInsert>) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const [updatedUser] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, authUser.id))
    .returning();

  return updatedUser;
}

export async function updateUserProfile(profileData: Partial<typeof userProfiles.$inferInsert>) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const [updatedProfile] = await db
    .update(userProfiles)
    .set(profileData)
    .where(eq(userProfiles.userId, authUser.id))
    .returning();

  return updatedProfile;
}

export async function updateUserProgress(progressData: Partial<typeof userProgress.$inferInsert>) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const [updatedProgress] = await db
    .update(userProgress)
    .set(progressData)
    .where(eq(userProgress.userId, authUser.id))
    .returning();

  return updatedProgress;
}

// Activity logging
export async function logActivity(action: string, ipAddress?: string) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return;
  }

  await db.insert(activityLogs).values({
    userId: authUser.id,
    action,
    ipAddress,
  });
}
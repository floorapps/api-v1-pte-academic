import { db } from '@/lib/db/drizzle';
import { 
  pteTests, 
  pteQuestions, 
  testAttempts, 
  testAnswers,
  userSubscriptions,
  users 
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all tests with optional filtering
export async function getTests(isPremium?: boolean) {
  const query = isPremium !== undefined
    ? db.select().from(pteTests).where(eq(pteTests.isPremium, isPremium ? 'true' : 'false'))
    : db.select().from(pteTests);
  
  return await query;
}

// Get test by ID with questions
export async function getTestWithQuestions(testId: string) {
  const test = await db.select().from(pteTests).where(eq(pteTests.id, testId));
  
  if (!test.length) return null;
  
  const questions = await db
    .select()
    .from(pteQuestions)
    .where(eq(pteQuestions.testId, testId))
    .orderBy(pteQuestions.orderIndex);
  
  return {
    ...test[0],
    questions,
  };
}

// Get user's subscription
export async function getUserSubscription(userId: string) {
  const subscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, 'active')
    ))
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1);
  
  return subscriptions[0] || null;
}

// Create or get user's free subscription
export async function ensureUserSubscription(userId: string) {
  const existing = await getUserSubscription(userId);
  
  if (existing) return existing;
  
  const [subscription] = await db
    .insert(userSubscriptions)
    .values({
      userId,
      plan: 'free',
      status: 'active',
    })
    .returning();
  
  return subscription;
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
    .returning();
  
  return attempt;
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
    .limit(limit);
  
  return attempts;
}

// Get section items (distinct question types under a section and test type)
export async function getSectionQuestionTypes(params: { testType: string; section: string; }) {
  const { testType, section } = params;
  // Return distinct question types with counts by section and test type
  const rows = await db
    .select({
      questionType: pteQuestions.questionType,
    })
    .from(pteQuestions)
    .innerJoin(pteTests, eq(pteQuestions.testId, pteTests.id))
    .where(and(eq(pteTests.testType, testType), eq(pteQuestions.section, section)));

  // Group distinct
  const map = new Map<string, number>();
  rows.forEach(r => map.set(r.questionType, (map.get(r.questionType) || 0) + 1));
  return Array.from(map.entries()).map(([questionType, count]) => ({ questionType, count }));
}

// Get test attempt with answers
export async function getTestAttemptWithAnswers(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(testAttempts)
    .where(eq(testAttempts.id, attemptId));
  
  if (!attempt) return null;
  
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
    .where(eq(testAnswers.attemptId, attemptId));
  
  return {
    ...attempt,
    answers,
  };
}

// Submit answer
export async function submitAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string,
  isCorrect?: boolean,
  pointsEarned?: string,
  aiFeedback?: string
) {
  const [answer] = await db
    .insert(testAnswers)
    .values({
      attemptId,
      questionId,
      userAnswer,
      isCorrect: isCorrect !== undefined ? (isCorrect ? 'true' : 'false') : null,
      pointsEarned,
      aiFeedback,
    })
    .returning();
  
  return answer;
}

// Complete test attempt
export async function completeTestAttempt(
  attemptId: string,
  scores: {
    totalScore: string;
    readingScore?: string;
    writingScore?: string;
    listeningScore?: string;
    speakingScore?: string;
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
    .returning();
  
  return attempt;
}

// Get user statistics
export async function getUserStats(userId: string) {
  const attempts = await db
    .select()
    .from(testAttempts)
    .where(and(
      eq(testAttempts.userId, userId),
      eq(testAttempts.status, 'completed')
    ));
  
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
    };
  }
  
  const totalScore = attempts.reduce((sum, a) => {
    const score = parseFloat(a.totalScore || '0');
    return sum + score;
  }, 0);
  
  const readingScores = attempts.filter(a => a.readingScore).map(a => parseFloat(a.readingScore!));
  const writingScores = attempts.filter(a => a.writingScore).map(a => parseFloat(a.writingScore!));
  const listeningScores = attempts.filter(a => a.listeningScore).map(a => parseFloat(a.listeningScore!));
  const speakingScores = attempts.filter(a => a.speakingScore).map(a => parseFloat(a.speakingScore!));
  
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  
  return {
    totalTestsTaken: attempts.length,
    averageScore: totalScore / attempts.length,
    sectionScores: {
      reading: avg(readingScores),
      writing: avg(writingScores),
      listening: avg(listeningScores),
      speaking: avg(speakingScores),
    },
  };
}

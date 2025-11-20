import { db } from '@/lib/db/drizzle';
import { speakingQuestions, speakingAttempts, writingAttempts } from '@/lib/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
import { auth } from '@/lib/auth/lucia';
import * as context from 'next/headers';

export async function getSpeakingQuestionById(id: string) {
  const question = await db.select().from(speakingQuestions).where(eq(speakingQuestions.id, id));
  return question[0];
}

export async function listSpeakingAttemptsByUser(userId: string, { limit = 25, offset = 0, questionId }: { limit?: number, offset?: number, questionId?: string }) {
  const where = questionId ? and(eq(speakingAttempts.userId, userId), eq(speakingAttempts.questionId, questionId)) : eq(speakingAttempts.userId, userId);
  const attempts = await db.select().from(speakingAttempts).where(where).limit(limit).offset(offset);
  const total = await db.select({ count: sql<number>`count(*)` }).from(speakingAttempts).where(where);
  return { items: attempts, total: total[0].count };
}

export async function getUser() {
  const session = await auth.getsession();
  return session?.user;
}

export async function getFeatureStats() {
  const speakingCount = await db.select({ value: count() }).from(speakingAttempts);
  const writingCount = await db.select({ value: count() }).from(writingAttempts);

  return [
    { name: 'Speaking', value: speakingCount[0].value },
    { name: 'Writing', value: writingCount[0].value },
  ];
}

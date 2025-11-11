import { db } from '../lib/db/drizzle';
import { practiceSessions, pteQuestions } from '../lib/db/schema';
import { eq, leftJoin } from 'drizzle-orm';

(async () => {
  try {
    const sessions = await db.select({
      id: practiceSessions.id,
      questionType: pteQuestions.questionType,
      questionTitle: pteQuestions.title,
      score: practiceSessions.score
    })
    .from(practiceSessions)
    .leftJoin(pteQuestions, eq(practiceSessions.questionId, pteQuestions.id))
    .limit(25);
    
    console.log('Practice sessions created:');
    sessions.forEach((s, i) => 
      console.log(`${i+1}. ${s.questionType} (${s.questionTitle}) - Score: ${s.score}`)
    );
  } catch (error) {
    console.error('Error:', error);
  }
})();
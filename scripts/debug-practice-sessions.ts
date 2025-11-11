import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { practiceSessions, users, pteQuestions, pteQuestionTypes } from '../lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Create a direct database connection
// Use DATABASE_URL (standard) or fallback to POSTGRES_URL for compatibility
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function createAllPracticeSessions() {
  try {
    console.log('Creating practice sessions for all PTE test types...');
    
    // Get a user to create practice sessions for (using the first user if available)
    const userResult = await db.select().from(users).limit(1);
    console.log('Users found in database:', userResult.length);
    
    if (userResult.length === 0) {
      console.log('No users found. Creating a sample user first...');
      
      // Create a sample user if none exists
      const [newUser] = await db.insert(users).values({
        id: crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}`,
        email: 'sample@pte.com',
        name: 'Sample User',
        emailVerified: new Date(),
      }).returning();
      
      console.log(`Created sample user: ${newUser.id}`);
    }
    
    // Get the first user again
    const [user] = await db.select().from(users).limit(1);
    const userId = user.id;
    console.log(`Using user: ${userId}`);
    
    // Define all the PTE test types as mentioned in your request
    const practiceSessionTypes = [
      // Speaking Section
      { type: 's_read_aloud', section: 'Speaking', name: 'Read Aloud' },
      { type: 's_repeat_sentence', section: 'Speaking', name: 'Repeat Sentence' },
      { type: 's_describe_image', section: 'Speaking', name: 'Describe Image' },
      { type: 's_retell_lecture', section: 'Speaking', name: 'Retell Lecture' },
      { type: 's_short_question', section: 'Speaking', name: 'Answer Short Question' },
      { type: 's_respond_to_situation', section: 'Speaking', name: 'Respond to a Situation' },
      { type: 's_summarize_group_discussion', section: 'Speaking', name: 'Summarize Group Discussion' },
      
      // Writing Section
      { type: 'w_summarize_text', section: 'Writing', name: 'Summarize Written Text' },
      { type: 'w_essay', section: 'Writing', name: 'Essay' },
      
      // Reading Section
      { type: 'r_fib_dropdown', section: 'Reading', name: 'Fill in the Blanks (Dropdown)' },
      { type: 'r_mcq_multiple', section: 'Reading', name: 'MC Multiple Answers (Reading)' },
      { type: 'r_reorder_paragraphs', section: 'Reading', name: 'Re-order Paragraphs' },
      { type: 'r_fib_drag_drop', section: 'Reading', name: 'Fill in the Blanks (Drag & Drop)' },
      { type: 'r_mcq_single', section: 'Reading', name: 'MC Single Answers (Reading)' },
      
      // Listening Section
      { type: 'l_summarize_spoken_text', section: 'Listening', name: 'Summarize Spoken Text' },
      { type: 'l_mcq_multiple', section: 'Listening', name: 'MC Multiple Answers (Listening)' },
      { type: 'l_fib', section: 'Listening', name: 'Fill in the Blanks (Listening)' },
      { type: 'l_highlight_correct_summary', section: 'Listening', name: 'Highlight Correct Summary' },
      { type: 'l_mcq_single', section: 'Listening', name: 'MC Single Answer Listening' },
      { type: 'l_select_missing_word', section: 'Listening', name: 'Select Missing Word' },
      { type: 'l_highlight_incorrect_words', section: 'Listening', name: 'Highlight Incorrect Words' },
      { type: 'l_write_from_dictation', section: 'Listening', name: 'Write from Dictation' },
    ];
    
    let createdCount = 0;
    
    // Create practice sessions for each type
    for (const sessionType of practiceSessionTypes) {
      console.log(`Creating practice session for: ${sessionType.name}`);
      
      // Check if a question of this type already exists
      const existingQuestion = await db.select()
        .from(pteQuestions)
        .where(and(
          eq(pteQuestions.questionType, sessionType.type),
          eq(pteQuestions.section, sessionType.section)
        ))
        .limit(1);
      
      let questionId: number;
      
      if (existingQuestion.length > 0) {
        // Use existing question
        questionId = existingQuestion[0].id;
        console.log(`  Using existing question ID: ${questionId}`);
      } else {
        // Create a new question for this type
        console.log(`  Creating new question for ${sessionType.name}`);
        const [newQuestion] = await db.insert(pteQuestions).values({
          testId: null, // Initially no test associated
          section: sessionType.section,
          questionType: sessionType.type,
          question: `Sample question for ${sessionType.name}`,
          title: `${sessionType.name} Sample`,
          difficulty: 1,
          points: 1,
          orderIndex: 1,
        }).returning();
        
        questionId = newQuestion.id;
        console.log(`  Created new question with ID: ${questionId}`);
      }
      
      // Create a practice session for this question
      console.log(`  Creating practice session for question ${questionId}`);
      const [practiceSession] = await db.insert(practiceSessions).values({
        userId: userId,
        questionId: questionId,
        score: Math.floor(Math.random() * 100), // Random score for demo purposes
      }).returning();
      
      console.log(`  Created practice session with ID: ${practiceSession.id}`);
      createdCount++;
    }
    
    console.log(`\nSuccessfully created ${createdCount} practice sessions!`);
    
    // Verify: Count the total practice sessions
    const totalSessionsResult = await db.execute(sql`SELECT COUNT(*) as count FROM practice_sessions`);
    const totalSessions = Number(totalSessionsResult.rows[0].count);
    console.log(`Total practice sessions in database: ${totalSessions}`);
    
  } catch (error) {
    console.error('Error creating practice sessions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the function
(async () => {
  try {
    await createAllPracticeSessions();
    console.log('All practice sessions created successfully!');
  } catch (error) {
    console.error('Failed to create practice sessions:', error);
    process.exit(1);
  }
})();
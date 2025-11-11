import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pteQuestions, pteQuestionTypes, pteTests, users } from '../lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// First, let's make sure we have question types in the database
const questionTypes = [
  { id: 1, name: 'Read Aloud', code: 's_read_aloud', description: 'Read the given text aloud' },
  { id: 2, name: 'Repeat Sentence', code: 's_repeat_sentence', description: 'Listen to and repeat the sentence' },
  { id: 3, name: 'Describe Image', code: 's_describe_image', description: 'Describe the given image' },
  { id: 4, name: 'Retell Lecture', code: 's_retell_lecture', description: 'Listen to a lecture and retell' },
  { id: 5, name: 'Answer Short Question', code: 's_short_question', description: 'Answer the short question' },
  { id: 6, name: 'Summarize Written Text', code: 'w_summarize_text', description: 'Summarize the given text' },
  { id: 7, name: 'Essay', code: 'w_essay', description: 'Write an essay on the given topic' },
  { id: 8, name: 'Multiple-choice, Choose Single Answer', code: 'r_mcq_single', description: 'Choose the single correct answer' },
  { id: 9, name: 'Multiple-choice, Choose Multiple Answers', code: 'r_mcq_multiple', description: 'Choose multiple correct answers' },
  { id: 10, name: 'Re-order Paragraphs', code: 'r_reorder', description: 'Reorder the given paragraphs' },
  { id: 11, name: 'Fill in the Blanks', code: 'r_fib', description: 'Fill in the missing words' },
  { id: 12, name: 'Summarize Spoken Text', code: 'l_summarize_spoken', description: 'Listen and summarize the spoken text' },
  { id: 13, name: 'Highlight Correct Summary', code: 'l_summary', description: 'Identify the correct summary' },
  { id: 14, name: 'Select Missing Word', code: 'l_missing_word', description: 'Select the missing word in the audio' },
  { id: 15, name: 'Highlight Incorrect Words', code: 'l_incorrect_words', description: 'Identify incorrect words in text/audio' },
  { id: 16, name: 'Write from Dictation', code: 'l_dictation', description: 'Write what you hear in the audio' },
];

// Sample test to link the questions to
const sampleTest = {
  id: 'pte-academic-sample-test',
  title: 'PTE Academic Sample Test',
  description: 'Sample test with questions for practice',
  testType: 'ACADEMIC',
  isPremium: false,
};

// Sample questions for each type
const sampleQuestions = [
  // Speaking - Read Aloud
  {
    title: 'Read Aloud Sample 1',
    section: 'Speaking',
    questionType: 's_read_aloud',
    question: 'The development of technology has significantly impacted how people live and work in the 21st century.',
    difficulty: 2,
    answerTime: 40,
  },
  {
    title: 'Read Aloud Sample 2',
    section: 'Speaking',
    questionType: 's_read_aloud',
    question: 'Climate change is one of the most critical issues facing our planet today.',
    difficulty: 3,
    answerTime: 40,
  },
  
  // Speaking - Repeat Sentence
  {
    title: 'Repeat Sentence Sample 1',
    section: 'Speaking',
    questionType: 's_repeat_sentence',
    question: 'The economic implications of renewable energy are becoming increasingly significant.',
    difficulty: 2,
    answerTime: 15,
  },
  
  // Speaking - Describe Image
  {
    title: 'Describe Image Sample 1',
    section: 'Speaking',
    questionType: 's_describe_image',
    question: 'Describe the image in detail. Include information about the people, activities, and setting.',
    difficulty: 3,
    answerTime: 40,
  },
  
  // Writing - Essay
  {
    title: 'Essay Sample 1',
    section: 'Writing',
    questionType: 'w_essay',
    question: 'Technology has transformed the way we work and communicate. Write an essay discussing both the benefits and challenges of this transformation.',
    difficulty: 4,
    answerTime: 1200, // 20 minutes in seconds
  },
  
  // Writing - Summarize Written Text
  {
    title: 'Summarize Written Text Sample 1',
    section: 'Writing',
    questionType: 'w_summarize_text',
    question: 'Reading comprehension text: The digital revolution has fundamentally changed our social interactions. With the proliferation of social media platforms, people now communicate differently than they did a few decades ago. While these technologies provide many benefits, such as connecting people across great distances, they also pose challenges, including concerns about privacy, misinformation, and reduced face-to-face interaction. The key is finding a balance between leveraging the benefits while mitigating the risks.',
    difficulty: 3,
    answerTime: 1200, // 20 minutes in seconds
  },
  
  // Reading - MCQ Single Answer
  {
    title: 'MCQ Single Answer Sample 1',
    section: 'Reading',
    questionType: 'r_mcq_single',
    question: 'According to the passage, what is the primary benefit of social media?',
    choices: [
      'Improved privacy controls',
      'Connecting people across distances',
      'Reduced face-to-face interaction',
      'Increased misinformation'
    ],
    correctAnswer: 'Connecting people across distances',
    difficulty: 2,
    answerTime: 90,
  },
  
  // Listening - Summarize Spoken Text
  {
    title: 'Summarize Spoken Text Sample 1',
    section: 'Listening',
    questionType: 'l_summarize_spoken',
    question: 'Listen to the lecture about renewable energy sources and summarize the main points discussed.',
    difficulty: 4,
    answerTime: 1200, // 20 minutes to write after listening
  },
  
  // Listening - Write from Dictation
  {
    title: 'Write from Dictation Sample 1',
    section: 'Listening',
    questionType: 'l_dictation',
    question: 'The implementation of sustainable practices requires coordinated effort from individuals, corporations, and governments alike.',
    difficulty: 3,
    answerTime: 60,
  },
];

// Create a direct database connection for the seeding script
// Use DATABASE_URL (standard) or fallback to POSTGRES_URL for compatibility
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

export async function seedPteQuestions() {
  try {
    console.log('Starting to seed PTE questions...');
    
    // Insert question types
    console.log('Inserting question types...');
    for (const qt of questionTypes) {
      await db.insert(pteQuestionTypes).values(qt).onConflictDoNothing();
    }
    
    // Insert sample test
    console.log('Inserting sample test...');
    await db.insert(pteTests).values(sampleTest).onConflictDoNothing();
    
    // Insert sample questions
    console.log('Inserting sample questions...');
    for (const q of sampleQuestions) {
      await db.insert(pteQuestions).values({
        title: q.title,
        section: q.section,
        questionType: q.questionType,
        question: q.question,
        questionData: q.questionData || null,
        correctAnswer: q.correctAnswer ? q.correctAnswer : null,
        choices: q.choices ? q.choices : null,
        difficulty: q.difficulty,
        answerTime: q.answerTime ? q.answerTime : null,
        testId: sampleTest.id,
        typeId: questionTypes.find(t => t.code === q.questionType)?.id || null,
      }).onConflictDoNothing();
    }
    
    // Get the questions we just inserted to get their IDs
    const questions = await db.select().from(pteQuestions);
    console.log(`Successfully inserted ${questions.length} questions into the database.`);
    
    // Now find a user to create practice sessions for (using the first user if available)
    const userResult = await db.select().from(users).limit(1);
    if (userResult.length > 0) {
      const userId = userResult[0].id;
      console.log(`Found user ${userId} to create practice sessions for`);
      
      // Create practice sessions for each question for the user
      for (const question of questions) {
        // Create a practice session with a random score between 0 and 1
        const score = Math.random() > 0.5 ? 1 : 0; // Random score for demo purposes
        await db.insert(require('../lib/db/schema').practiceSessions).values({
          userId: userId,
          questionId: question.id,
          score: score,
        }).onConflictDoNothing();
      }
      
      console.log(`Created practice sessions for user ${userId} for ${questions.length} questions`);
    } else {
      console.log('No users found, skipping practice session creation');
    }
    
    return questions;
  } catch (error) {
    console.error('Error seeding PTE questions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if this file is executed directly
if (typeof process !== 'undefined' && !module.parent) {
  (async () => {
    try {
      await seedPteQuestions();
      console.log('PTE questions seeding completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      process.exit(1);
    }
  })();
}
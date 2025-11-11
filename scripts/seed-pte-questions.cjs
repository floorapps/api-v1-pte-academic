const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { pteQuestions, pteQuestionTypes, pteTests, users, practiceSessions } = require('../lib/db/schema');
const { eq } = require('drizzle-orm');
const { sql } = require('drizzle-orm');

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
  { id: 17, name: 'Respond to a Situation', code: 's_respond_to_situation', description: 'Respond to a situation' },
  { id: 18, name: 'Summarize Group Discussion', code: 's_summarize_group_discussion', description: 'Summarize a group discussion' },
  { id: 19, name: 'Fill in the Blanks (Dropdown)', code: 'r_fib_dropdown', description: 'Fill in the blanks using dropdown options' },
  { id: 20, name: 'Fill in the Blanks (Drag & Drop)', code: 'r_fib_drag_drop', description: 'Fill in the blanks by dragging and dropping' },
  { id: 21, name: 'Highlight Correct Summary', code: 'l_highlight_correct_summary', description: 'Highlight the correct summary' },
  { id: 22, name: 'MC Single Answer Listening', code: 'l_mcq_single', description: 'Multiple choice single answer listening' },
  { id: 23, name: 'Select Missing Word', code: 'l_select_missing_word', description: 'Select the missing word in the audio' },
  { id: 24, name: 'Highlight Incorrect Words', code: 'l_highlight_incorrect_words', description: 'Highlight incorrect words' },
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
  
  // Speaking - Retell Lecture
  {
    title: 'Retell Lecture Sample 1',
    section: 'Speaking',
    questionType: 's_retell_lecture',
    question: 'Listen to the lecture about renewable energy sources and retell the main points discussed.',
    difficulty: 4,
    answerTime: 40,
  },
  
  // Speaking - Answer Short Question
  {
    title: 'Answer Short Question Sample 1',
    section: 'Speaking',
    questionType: 's_short_question',
    question: 'What is the capital of Australia?',
    difficulty: 1,
    answerTime: 10,
  },
  
  // Speaking - Respond to a Situation
  {
    title: 'Respond to a Situation Sample 1',
    section: 'Speaking',
    questionType: 's_respond_to_situation',
    question: 'You are asked to respond to a common workplace situation. Provide a concise but effective response.',
    difficulty: 3,
    answerTime: 60,
  },
  
  // Speaking - Summarize Group Discussion
  {
    title: 'Summarize Group Discussion Sample 1',
    section: 'Speaking',
    questionType: 's_summarize_group_discussion',
    question: 'Listen to a group discussion and summarize the key points discussed by the participants.',
    difficulty: 4,
    answerTime: 60,
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
    answerTime: 600, // 10 minutes in seconds
  },
  
  // Reading - MCQ Single Answer
  {
    title: 'MCQ Single Answer Sample 1',
    section: 'Reading',
    questionType: 'r_mcq_single',
    question: 'According to the passage, what is the primary benefit of social media?',
    choices: JSON.stringify([
      'Improved privacy controls',
      'Connecting people across distances',
      'Reduced face-to-face interaction',
      'Increased misinformation'
    ]),
    correctAnswer: 'Connecting people across distances',
    difficulty: 2,
    answerTime: 90,
  },
  
  // Reading - MCQ Multiple Answers
  {
    title: 'MCQ Multiple Answers Sample 1',
    section: 'Reading',
    questionType: 'r_mcq_multiple',
    question: 'Which of the following are mentioned as challenges of digital technologies?',
    choices: JSON.stringify([
      'Privacy concerns',
      'Connecting people across distances',
      'Misinformation',
      'Reduced face-to-face interaction'
    ]),
    correctAnswer: JSON.stringify(['Privacy concerns', 'Misinformation', 'Reduced face-to-face interaction']),
    difficulty: 3,
    answerTime: 90,
  },
  
  // Reading - Fill in the Blanks (Dropdown)
  {
    title: 'Fill in the Blanks (Dropdown) Sample 1',
    section: 'Reading',
    questionType: 'r_fib_dropdown',
    question: 'The [blank] of renewable energy has [blank] significantly in recent years.',
    choices: JSON.stringify(['development', 'implementation', 'adoption', 'decreased', 'increased']),
    correctAnswer: JSON.stringify(['development', 'increased']),
    difficulty: 3,
    answerTime: 120,
  },
  
  // Reading - Re-order Paragraphs
  {
    title: 'Re-order Paragraphs Sample 1',
    section: 'Reading',
    questionType: 'r_reorder',
    question: 'Re-order the following paragraphs to form a coherent text.',
    questionData: JSON.stringify({
      paragraphs: [
        'Finally, the report suggests several recommendations for improvement.',
        'The second section discusses the current situation in detail.',
        'First, the report provides an overview of the problem.',
        'The third section analyzes the impact of the situation.'
      ],
      correctOrder: [0, 2, 3, 1] // 'First', 'The second section', 'The third section', 'Finally'
    }),
    difficulty: 4,
    answerTime: 180,
  },
  
  // Reading - Fill in the Blanks (Drag & Drop)
  {
    title: 'Fill in the Blanks (Drag & Drop) Sample 1',
    section: 'Reading',
    questionType: 'r_fib_drag_drop',
    question: 'The process of [blank] involves converting sunlight into [blank] energy.',
    choices: JSON.stringify(['photovoltaic', 'solar', 'electrical', 'thermal']),
    correctAnswer: JSON.stringify(['photovoltaic', 'electrical']),
    difficulty: 3,
    answerTime: 120,
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
  
  // Listening - MCQ Multiple Answers
  {
    title: 'MCQ Multiple Answers (Listening) Sample 1',
    section: 'Listening',
    questionType: 'l_mcq_multiple',
    question: 'Based on the audio, what are the key benefits of renewable energy mentioned?',
    choices: JSON.stringify([
      'Reduced greenhouse gas emissions',
      'Lower initial cost compared to fossil fuels',
      'Sustainability for future generations',
      'Consistent energy production regardless of weather'
    ]),
    correctAnswer: JSON.stringify(['Reduced greenhouse gas emissions', 'Sustainability for future generations']),
    difficulty: 3,
    answerTime: 90,
  },
  
  // Listening - Fill in the Blanks
  {
    title: 'Fill in the Blanks (Listening) Sample 1',
    section: 'Listening',
    questionType: 'l_fib',
    question: 'The speaker discusses how [blank] energy can [blank] our dependence on fossil fuels.',
    difficulty: 3,
    answerTime: 60,
  },
  
  // Listening - Highlight Correct Summary
  {
    title: 'Highlight Correct Summary Sample 1',
    section: 'Listening',
    questionType: 'l_highlight_correct_summary',
    question: 'After listening to the audio, select the summary that best captures the main ideas.',
    choices: JSON.stringify([
      'The presentation focused on the economic aspects of renewable energy.',
      'The speaker outlined the environmental benefits and challenges of renewable energy.',
      'The lecture discussed the technical specifications of wind turbines.',
      'The talk was about the history of energy production.'
    ]),
    correctAnswer: 'The speaker outlined the environmental benefits and challenges of renewable energy.',
    difficulty: 3,
    answerTime: 90,
  },
  
  // Listening - MC Single Answer Listening
  {
    title: 'MC Single Answer Listening Sample 1',
    section: 'Listening',
    questionType: 'l_mcq_single',
    question: 'What is the speaker\'s main concern about current energy policies?',
    choices: JSON.stringify([
      'The lack of technological advancement',
      'The insufficient long-term planning',
      'The high costs of implementation',
      'The limited public awareness'
    ]),
    correctAnswer: 'The insufficient long-term planning',
    difficulty: 3,
    answerTime: 90,
  },
  
  // Listening - Select Missing Word
  {
    title: 'Select Missing Word Sample 1',
    section: 'Listening',
    questionType: 'l_select_missing_word',
    question: 'Listen to the audio and select the missing word in the sentence.',
    difficulty: 3,
    answerTime: 60,
  },
  
  // Listening - Highlight Incorrect Words
  {
    title: 'Highlight Incorrect Words Sample 1',
    section: 'Listening',
    questionType: 'l_highlight_incorrect_words',
    question: 'Listen to the audio and identify the words in the transcript that are incorrect.',
    difficulty: 4,
    answerTime: 120,
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

async function seedPteQuestions() {
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
        questionData: q.questionData ? JSON.parse(q.questionData) : null,
        correctAnswer: q.correctAnswer ? q.correctAnswer : null,
        choices: q.choices ? JSON.parse(q.choices) : null,
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
        await db.insert(practiceSessions).values({
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

// Run the seeding function
(async () => {
  try {
    await seedPteQuestions();
    console.log('PTE questions seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
})();
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './drizzle';
import { users, teams, teamMembers, pteTests, pteQuestions } from './schema';

async function seed() {
  // Seed sample PTE tests and questions
  const [sampleTest] = await db
    .insert(pteTests)
    .values({
      title: 'PTE Academic Sample Test 1',
      description: 'Sample practice set',
      testType: 'ACADEMIC',
      duration: '2 hours',
      isPremium: 'false',
    })
    .onConflictDoNothing()
    .returning();

  const testId = sampleTest?.id;

  if (testId) {
    const questions = [
      // Reading
      { section: 'READING', questionType: 'Re-order Paragraphs', question: 'Reorder the paragraphs to form a coherent text.', orderIndex: '1' },
      { section: 'READING', questionType: 'Reading: Fill in the Blanks', question: 'Drag words to fill in the blanks.', orderIndex: '2' },
      { section: 'READING', questionType: 'Multiple Choice, Choose Single Answer', question: 'Choose the correct option.', orderIndex: '3' },
      // Writing
      { section: 'WRITING', questionType: 'Summarize Written Text', question: 'Summarize the given passage.', orderIndex: '4' },
      { section: 'WRITING', questionType: 'Write Essay', question: 'Write an essay about technology.', orderIndex: '5' },
      // Listening
      { section: 'LISTENING', questionType: 'Summarize Spoken Text', question: 'Summarize the lecture you hear.', orderIndex: '6' },
      { section: 'LISTENING', questionType: 'Select Missing Word', question: 'Select the missing word from the audio.', orderIndex: '7' },
      { section: 'LISTENING', questionType: 'Highlight Correct Summary', question: 'Pick the correct summary.', orderIndex: '8' },
      { section: 'LISTENING', questionType: 'Write from Dictation', question: 'Type the sentence you hear.', orderIndex: '9' },
      // Speaking
      { section: 'SPEAKING', questionType: 'Read Aloud', question: 'Read the text aloud.', orderIndex: '10' },
      { section: 'SPEAKING', questionType: 'Repeat Sentence', question: 'Repeat the sentence.', orderIndex: '11' },
    ].map((q, idx) => ({
      testId,
      section: q.section,
      questionType: q.questionType,
      question: q.question,
      questionData: JSON.stringify({ timeLimit: 60 }),
      correctAnswer: JSON.stringify({}),
      points: '1',
      orderIndex: q.orderIndex || String(idx + 1),
    }));

    await db.insert(pteQuestions).values(questions).onConflictDoNothing();
  }
  const email = 'test@test.com';

  // Find or create user
  const existingUsers = await db.select().from(users).where(sql`email = ${email}`).limit(1);
  let user = existingUsers[0];
  if (!user) {
    const [created] = await db
      .insert(users)
      .values({
        email,
        name: 'Test User',
      })
      .returning();
    user = created;
    console.log('Initial user created.');
  } else {
    console.log('User already exists, skipping user creation.');
  }

  // Find or create team
  const existingTeams = await db.select().from(teams).where(sql`name = 'Test Team'`).limit(1);
  let team = existingTeams[0];
  if (!team) {
    const [createdTeam] = await db
      .insert(teams)
      .values({
        name: 'Test Team',
      })
      .returning();
    team = createdTeam;
  }

  // Add team member if not already
  const existingMember = await db
    .select()
    .from(teamMembers)
    .where(sql`user_id = ${user.id} AND team_id = ${team.id}`)
    .limit(1);
  if (existingMember.length === 0) {
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    });
  }

}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
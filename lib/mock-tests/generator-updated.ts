/**
 * Mock Test Generator - Updated for November 2025
 * Generates 200 PTE Academic mock tests with proper question distribution
 * Updated to match November 2025 PTE standards and new database schema
 */

import { db } from '@/lib/db/drizzle'
import {
  mockTests,
  mockTestQuestions,
  type NewMockTest,
  type NewMockTestQuestion,
} from '@/lib/db/schema-mock-tests'
import {
  speakingQuestions,
  writingQuestions,
  readingQuestions,
  listeningQuestions,
} from '@/lib/db/schema'
import { eq, and, sql, inArray, notInArray } from 'drizzle-orm'

// November 2025 Updated Question Distribution
// Total: 52-64 questions (reduced from 70-82)
// New speaking tasks: respond_to_a_situation, summarize_group_discussion
export const MOCK_TEST_TEMPLATE_2025 = {
  speaking: {
    read_aloud: { min: 5, max: 6 },
    repeat_sentence: { min: 9, max: 11 },
    describe_image: { min: 3, max: 4 },
    retell_lecture: { min: 2, max: 3 },
    answer_short_question: { min: 4, max: 5 },
    respond_to_a_situation: { min: 1, max: 2 }, // NEW August 2025
    summarize_group_discussion: { min: 1, max: 1 }, // NEW August 2025
  },
  writing: {
    summarize_written_text: { min: 1, max: 2 },
    write_essay: { min: 1, max: 2 },
  },
  reading: {
    reading_writing_fill_blanks: { min: 4, max: 5 },
    multiple_choice_multiple: { min: 2, max: 3 },
    reorder_paragraphs: { min: 2, max: 3 },
    fill_in_blanks: { min: 3, max: 4 },
    multiple_choice_single: { min: 2, max: 3 },
  },
  listening: {
    summarize_spoken_text: { min: 2, max: 3 },
    multiple_choice_multiple: { min: 1, max: 2 },
    fill_in_blanks: { min: 2, max: 3 },
    highlight_correct_summary: { min: 1, max: 2 },
    multiple_choice_single: { min: 2, max: 3 },
    select_missing_word: { min: 1, max: 2 },
    highlight_incorrect_words: { min: 2, max: 3 },
    write_from_dictation: { min: 3, max: 4 },
  },
}

// November 2025 Section time limits (in minutes)
// Total test: 2 hours (120 minutes)
export const SECTION_TIME_LIMITS_2025 = {
  speaking_writing: { min: 54, max: 67 }, // Combined section
  reading: { min: 29, max: 30 },
  listening: { min: 30, max: 43 },
}

/**
 * Generate random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Get random questions of a specific type from the appropriate table
 */
async function getRandomQuestions(
  section: 'speaking' | 'writing' | 'reading' | 'listening',
  questionType: string,
  count: number,
  excludeIds: string[] = []
): Promise<Array<{ id: string; type: string; title: string; difficulty: string }>> {
  let table
  let typeColumn = 'type'

  switch (section) {
    case 'speaking':
      table = speakingQuestions
      break
    case 'writing':
      table = writingQuestions
      break
    case 'reading':
      table = readingQuestions
      break
    case 'listening':
      table = listeningQuestions
      break
  }

  const query = db
    .select({
      id: table.id,
      type: table.type,
      title: table.title,
      difficulty: table.difficulty,
    })
    .from(table)
    .where(
      and(
        eq(table.type, questionType),
        eq(table.isActive, true),
        excludeIds.length > 0 ? notInArray(table.id, excludeIds) : undefined
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(count)

  return await query
}

/**
 * Calculate difficulty distribution
 * Tests 1-50: Easy (25%)
 * Tests 51-150: Medium (50%)
 * Tests 151-200: Hard (25%)
 */
function getDifficultyForTestNumber(testNumber: number): 'easy' | 'medium' | 'hard' {
  if (testNumber <= 50) return 'easy'
  if (testNumber <= 150) return 'medium'
  return 'hard'
}

/**
 * Get question table name for a section
 */
function getQuestionTableName(
  section: 'speaking' | 'writing' | 'reading' | 'listening'
): 'speaking_questions' | 'writing_questions' | 'reading_questions' | 'listening_questions' {
  return `${section}_questions` as any
}

/**
 * Generate a single mock test
 */
export async function generateSingleMockTest(testNumber: number) {
  console.log(`Generating Mock Test #${testNumber}...`)

  const testTitle = `PTE Academic Practice Test ${testNumber}`
  const description = `Full-length PTE Academic practice test simulating real exam conditions (November 2025 format - 2 hours, 52-64 questions).`
  const difficulty = getDifficultyForTestNumber(testNumber)

  // Calculate total questions for this test
  let totalQuestions = 0
  const questionCounts: Record<string, Record<string, number>> = {
    speaking: {},
    writing: {},
    reading: {},
    listening: {},
  }

  for (const section of ['speaking', 'writing', 'reading', 'listening'] as const) {
    for (const [questionType, range] of Object.entries(
      MOCK_TEST_TEMPLATE_2025[section]
    )) {
      const count = randomBetween(range.min, range.max)
      questionCounts[section][questionType] = count
      totalQuestions += count
    }
  }

  // Create mock test entry
  const newMockTest: NewMockTest = {
    testNumber,
    title: testTitle,
    description,
    difficulty,
    totalQuestions,
    durationMinutes: 120, // November 2025: Fixed 2-hour duration
    isFree: testNumber === 1, // Only first test is free
    status: 'published',
    metadata: {
      speakingQuestions: Object.values(questionCounts.speaking).reduce((a, b) => a + b, 0),
      writingQuestions: Object.values(questionCounts.writing).reduce((a, b) => a + b, 0),
      readingQuestions: Object.values(questionCounts.reading).reduce((a, b) => a + b, 0),
      listeningQuestions: Object.values(questionCounts.listening).reduce((a, b) => a + b, 0),
      generatedAt: new Date().toISOString(),
      pteVersion: 'November 2025',
    },
  }

  const [mockTest] = await db.insert(mockTests).values(newMockTest).returning()
  console.log(`  Created mock test: ${mockTest.id}`)

  // Generate questions for each section
  let orderIndex = 0
  const usedQuestionIds: string[] = []

  // Speaking questions
  for (const [questionType, count] of Object.entries(questionCounts.speaking)) {
    const questions = await getRandomQuestions(
      'speaking',
      questionType,
      count,
      usedQuestionIds
    )

    const mockTestQuestionInserts: NewMockTestQuestion[] = questions.map((q) => ({
      mockTestId: mockTest.id,
      questionId: q.id,
      questionTable: 'speaking_questions',
      section: 'speaking',
      orderIndex: orderIndex++,
      timeLimitSeconds: null, // Speaking questions have individual prep/answer times
      metadata: {
        questionType,
        difficulty: q.difficulty,
      },
    }))

    await db.insert(mockTestQuestions).values(mockTestQuestionInserts)
    usedQuestionIds.push(...questions.map((q) => q.id))
  }

  // Writing questions
  for (const [questionType, count] of Object.entries(questionCounts.writing)) {
    const questions = await getRandomQuestions(
      'writing',
      questionType,
      count,
      usedQuestionIds
    )

    const mockTestQuestionInserts: NewMockTestQuestion[] = questions.map((q) => ({
      mockTestId: mockTest.id,
      questionId: q.id,
      questionTable: 'writing_questions',
      section: 'writing',
      orderIndex: orderIndex++,
      timeLimitSeconds: questionType === 'summarize_written_text' ? 600 : 1200, // 10 or 20 mins
      metadata: {
        questionType,
        difficulty: q.difficulty,
      },
    }))

    await db.insert(mockTestQuestions).values(mockTestQuestionInserts)
    usedQuestionIds.push(...questions.map((q) => q.id))
  }

  // Reading questions (section-timed, not individual)
  for (const [questionType, count] of Object.entries(questionCounts.reading)) {
    const questions = await getRandomQuestions(
      'reading',
      questionType,
      count,
      usedQuestionIds
    )

    const mockTestQuestionInserts: NewMockTestQuestion[] = questions.map((q) => ({
      mockTestId: mockTest.id,
      questionId: q.id,
      questionTable: 'reading_questions',
      section: 'reading',
      orderIndex: orderIndex++,
      timeLimitSeconds: null, // Section-timed (29-30 minutes total)
      metadata: {
        questionType,
        difficulty: q.difficulty,
      },
    }))

    await db.insert(mockTestQuestions).values(mockTestQuestionInserts)
    usedQuestionIds.push(...questions.map((q) => q.id))
  }

  // Listening questions
  for (const [questionType, count] of Object.entries(questionCounts.listening)) {
    const questions = await getRandomQuestions(
      'listening',
      questionType,
      count,
      usedQuestionIds
    )

    const mockTestQuestionInserts: NewMockTestQuestion[] = questions.map((q) => ({
      mockTestId: mockTest.id,
      questionId: q.id,
      questionTable: 'listening_questions',
      section: 'listening',
      orderIndex: orderIndex++,
      timeLimitSeconds:
        questionType === 'summarize_spoken_text' ? 600 : null, // SST: 10 mins, others section-timed
      metadata: {
        questionType,
        difficulty: q.difficulty,
      },
    }))

    await db.insert(mockTestQuestions).values(mockTestQuestionInserts)
    usedQuestionIds.push(...questions.map((q) => q.id))
  }

  console.log(`  ✓ Mock Test #${testNumber} generated with ${totalQuestions} questions`)
  return mockTest
}

/**
 * Generate all 200 mock tests
 */
export async function generateAllMockTests() {
  console.log('Starting generation of 200 PTE Academic Mock Tests (November 2025 format)...\n')

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ testNumber: number; error: string }>,
  }

  for (let testNumber = 1; testNumber <= 200; testNumber++) {
    try {
      await generateSingleMockTest(testNumber)
      results.successful++
    } catch (error) {
      console.error(`  ✗ Failed to generate Test #${testNumber}:`, error)
      results.failed++
      results.errors.push({
        testNumber,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Progress indicator every 10 tests
    if (testNumber % 10 === 0) {
      console.log(`\n--- Progress: ${testNumber}/200 tests generated ---\n`)
    }
  }

  console.log('\n=== Generation Complete ===')
  console.log(`Successful: ${results.successful}`)
  console.log(`Failed: ${results.failed}`)

  if (results.errors.length > 0) {
    console.log('\nErrors:')
    results.errors.forEach(({ testNumber, error }) => {
      console.log(`  Test #${testNumber}: ${error}`)
    })
  }

  return results
}

/**
 * Clear all existing mock tests (use with caution!)
 */
export async function clearAllMockTests() {
  console.log('Clearing all existing mock tests...')
  await db.delete(mockTests)
  console.log('✓ All mock tests cleared')
}

/**
 * CLI command to run generation
 */
if (require.main === module) {
  const command = process.argv[2]

  ;(async () => {
    try {
      if (command === 'clear') {
        await clearAllMockTests()
      } else if (command === 'generate') {
        const testNumber = parseInt(process.argv[3] || '0')
        if (testNumber > 0 && testNumber <= 200) {
          await generateSingleMockTest(testNumber)
        } else {
          await generateAllMockTests()
        }
      } else {
        console.log('Usage:')
        console.log('  tsx lib/mock-tests/generator-updated.ts generate        # Generate all 200 tests')
        console.log('  tsx lib/mock-tests/generator-updated.ts generate 1      # Generate specific test')
        console.log('  tsx lib/mock-tests/generator-updated.ts clear           # Clear all tests')
      }
      process.exit(0)
    } catch (error) {
      console.error('Fatal error:', error)
      process.exit(1)
    }
  })()
}

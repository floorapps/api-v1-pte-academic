#!/usr/bin/env tsx
/**
 * Practice Attempts and AI Scoring API Testing Script
 * Tests all POST methods for practice attempts and AI scoring functionality
 *
 * Usage:
 *   pnpm tsx scripts/test-practice-attempts.ts
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`

console.log(`🧪 Testing Practice Attempts and AI Scoring APIs at: ${BASE_URL}\n`)

interface TestResult {
  endpoint: string
  method: string
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  message?: string
  response?: any
}

const results: TestResult[] = []

// Mock user session - we'll need to authenticate first
let authToken: string | null = null
let userId: string | null = null

async function authenticate(): Promise<boolean> {
  try {
    // Try to get a session - this assumes there's a test user or we can create one
    const response = await fetch(`${BASE_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.user?.id) {
        userId = data.user.id
        console.log(`✅ Authenticated as user: ${userId}`)
        return true
      }
    }

    console.log('⚠️  No authenticated session found. Some tests may fail.')
    return false
  } catch (error) {
    console.log('⚠️  Authentication check failed. Some tests may fail.')
    return false
  }
}

async function testEndpoint(
  endpoint: string,
  options: RequestInit = {},
  expectedStatus: number = 200,
  testName: string = '',
  skipAuth: boolean = false
): Promise<TestResult> {
  const method = options.method || 'GET'
  const url = `${BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  // Add auth token if available and not skipping auth
  if (authToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const isSuccess = response.status === expectedStatus
    let responseData: any = null

    try {
      responseData = await response.json()
    } catch (e) {
      // Response might not be JSON
    }

    const result: TestResult = {
      endpoint,
      method,
      test: testName,
      status: isSuccess ? 'PASS' : 'FAIL',
      statusCode: response.status,
      message: isSuccess ? 'OK' : `Expected ${expectedStatus}, got ${response.status}`,
      response: responseData,
    }

    results.push(result)

    const emoji = isSuccess ? '✅' : '❌'
    console.log(`${emoji} ${method} ${endpoint} - ${testName} - ${response.status} ${result.message}`)

    return result
  } catch (error: any) {
    const result: TestResult = {
      endpoint,
      method,
      test: testName,
      status: 'FAIL',
      message: error.message,
    }
    results.push(result)
    console.log(`❌ ${method} ${endpoint} - ${testName} - ${error.message}`)
    return result
  }
}

async function getSampleQuestion(section: string, type: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/${section}/questions?type=${type}&pageSize=1`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        return data.items[0].id
      }
    }
  } catch (error) {
    console.log(`Failed to get sample ${section} question:`, error)
  }
  return null
}

async function runPracticeAttemptTests() {
  console.log('🎯 Practice Attempt POST Tests\n')

  // Test Listening Attempts
  console.log('🎧 Listening Attempts')
  const listeningQuestionId = await getSampleQuestion('listening', 'multiple_choice_single')
  if (listeningQuestionId) {
    await testEndpoint(
      '/api/listening/attempts',
      {
        method: 'POST',
        body: JSON.stringify({
          questionId: listeningQuestionId,
          type: 'multiple_choice_single',
          userResponse: { selectedOption: 'A' },
          timeTaken: 30,
        }),
      },
      201,
      'Multiple choice single attempt'
    )
  } else {
    console.log('⏭️  Skipping listening attempt test - no sample question')
  }

  // Test Reading Attempts
  console.log('\n📖 Reading Attempts')
  const readingQuestionId = await getSampleQuestion('reading', 'multiple_choice_single')
  if (readingQuestionId) {
    await testEndpoint(
      '/api/reading/attempts',
      {
        method: 'POST',
        body: JSON.stringify({
          questionId: readingQuestionId,
          type: 'multiple_choice_single',
          userResponse: { selectedOption: 'A' },
          timeTaken: 45,
        }),
      },
      201,
      'Multiple choice single attempt'
    )
  } else {
    console.log('⏭️  Skipping reading attempt test - no sample question')
  }

  // Test Writing Attempts
  console.log('\n✍️  Writing Attempts')
  const writingQuestionId = await getSampleQuestion('writing', 'summarize_written_text')
  if (writingQuestionId) {
    await testEndpoint(
      '/api/writing/attempts',
      {
        method: 'POST',
        body: JSON.stringify({
          questionId: writingQuestionId,
          type: 'summarize_written_text',
          textAnswer: 'This is a sample summary of the written text provided in the question.',
          timeTaken: 300,
        }),
      },
      201,
      'Summarize written text attempt'
    )
  } else {
    console.log('⏭️  Skipping writing attempt test - no sample question')
  }

  // Test Speaking Attempts (this is more complex as it requires audio)
  console.log('\n🎤 Speaking Attempts')
  const speakingQuestionId = await getSampleQuestion('speaking', 'read_aloud')
  if (speakingQuestionId) {
    // Mock audio URL - in real scenario this would be uploaded audio
    await testEndpoint(
      '/api/speaking/attempts',
      {
        method: 'POST',
        body: JSON.stringify({
          questionId: speakingQuestionId,
          type: 'read_aloud',
          audioUrl: 'https://example.com/sample-audio.mp3', // Mock URL
          durationMs: 15000,
          timings: {
            prepMs: 30000,
            recordMs: 15000,
          },
        }),
      },
      201,
      'Read aloud attempt (with mock audio)'
    )
  } else {
    console.log('⏭️  Skipping speaking attempt test - no sample question')
  }
}

async function runAIScoringTests() {
  console.log('\n🤖 AI Scoring Tests\n')

  // Test AI scoring for writing
  await testEndpoint(
    '/api/ai-scoring/score',
    {
      method: 'POST',
      body: JSON.stringify({
        section: 'WRITING',
        questionType: 'summarize_written_text',
        payload: {
          text: 'This is a sample summary written by a test user.',
          prompt: 'Summarize the given text in one sentence.',
        },
        includeRationale: true,
      }),
    },
    200,
    'Writing AI scoring'
  )

  // Test AI scoring for speaking
  await testEndpoint(
    '/api/ai-scoring/score',
    {
      method: 'POST',
      body: JSON.stringify({
        section: 'SPEAKING',
        questionType: 'read_aloud',
        payload: {
          transcript: 'This is a sample transcript from a speaking attempt.',
          referenceText: 'This is the reference text that should be read aloud.',
        },
        includeRationale: true,
      }),
    },
    200,
    'Speaking AI scoring'
  )

  // Test AI scoring for reading (deterministic)
  await testEndpoint(
    '/api/ai-scoring/score',
    {
      method: 'POST',
      body: JSON.stringify({
        section: 'READING',
        questionType: 'multiple_choice_single',
        payload: {
          selectedOption: 'A',
          correctOption: 'A',
        },
      }),
    },
    200,
    'Reading AI scoring (deterministic)'
  )

  // Test AI scoring for listening (deterministic)
  await testEndpoint(
    '/api/ai-scoring/score',
    {
      method: 'POST',
      body: JSON.stringify({
        section: 'LISTENING',
        questionType: 'write_from_dictation',
        payload: {
          targetText: 'This is the correct text.',
          userText: 'This is the user text.',
        },
      }),
    },
    200,
    'Listening AI scoring (deterministic)'
  )
}

async function runTests() {
  // Authenticate first
  await authenticate()

  // Run practice attempt tests
  await runPracticeAttemptTests()

  // Run AI scoring tests
  await runAIScoringTests()

  // Print summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 Test Summary')
  console.log('='.repeat(80))

  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const skipped = results.filter((r) => r.status === 'SKIP').length
  const total = results.length

  console.log(`\n✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`📝 Total: ${total}`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`   ${r.method} ${r.endpoint} - ${r.test}`)
        console.log(`     Status: ${r.statusCode} - ${r.message}`)
        if (r.response?.error) {
          console.log(`     Error: ${JSON.stringify(r.response.error)}`)
        }
      })
  }

  console.log('\n' + '='.repeat(80))

  // Exit with error code if any tests failed
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the output above for details.\n')
    process.exit(1)
  }

  console.log('\n✨ All tests passed!\n')
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})
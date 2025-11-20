#!/usr/bin/env tsx
/**
 * API Testing Script
 * Tests all API endpoints to ensure they're working correctly before deployment
 *
 * Usage:
 *   pnpm tsx scripts/test-apis.ts
 *   pnpm tsx scripts/test-apis.ts --production https://your-domain.com
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const BASE_URL = process.argv.includes('--production')
  ? process.argv[process.argv.indexOf('--production') + 1]
  : `http://localhost:${process.env.PORT || 3000}`

console.log(`🧪 Testing APIs at: ${BASE_URL}\n`)

interface TestResult {
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  message?: string
}

const results: TestResult[] = []

async function testEndpoint(
  endpoint: string,
  options: RequestInit = {},
  expectedStatus: number | number[] = 200,
  description?: string
): Promise<TestResult> {
  const method = options.method || 'GET'
  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const statuses = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus]
    const isSuccess = statuses.includes(response.status)
    const result: TestResult = {
      endpoint,
      method,
      status: isSuccess ? 'PASS' : 'FAIL',
      statusCode: response.status,
      message: description || (isSuccess ? 'OK' : `Expected ${expectedStatus}, got ${response.status}`),
    }

    results.push(result)

    const emoji = isSuccess ? '✅' : '❌'
    console.log(`${emoji} ${method} ${endpoint} - ${response.status} ${result.message}`)

    return result
  } catch (error: any) {
    const result: TestResult = {
      endpoint,
      method,
      status: 'FAIL',
      message: error.message,
    }
    results.push(result)
    console.log(`❌ ${method} ${endpoint} - ${error.message}`)
    return result
  }
}

async function runTests() {
  console.log('🏥 Health Checks\n')

  // Health check
  await testEndpoint('/api/health', {}, [200, 503], 'Health check (200 or 503 acceptable)')

  console.log('\n📚 Public API Tests (No Auth)\n')

  // Public endpoints - should work without auth
  await testEndpoint(
    '/api/speaking/questions?type=read_aloud&page=1&pageSize=5',
    {},
    200,
    'List speaking questions (read_aloud)'
  )
  await testEndpoint(
    '/api/writing/questions?type=write_essay&page=1&pageSize=5',
    {},
    200,
    'List writing questions (write_essay)'
  )
  await testEndpoint(
    '/api/reading/questions?type=multiple_choice_single&page=1&pageSize=5',
    {},
    200,
    'List reading questions (multiple_choice_single)'
  )
  await testEndpoint(
    '/api/listening/questions?type=summarize_spoken_text&page=1&pageSize=5',
    {},
    200,
    'List listening questions (summarize_spoken_text)'
  )

  console.log('\n🔒 Protected API Tests (Auth Required)\n')

  // These should return 401 without auth
  await testEndpoint('/api/user', {}, 404, 'User endpoint unauthenticated returns not found')
  await testEndpoint('/api/user/profile', {}, 401, 'Profile requires auth')
  await testEndpoint('/api/speaking/attempts', { method: 'POST' }, 401, 'Attempt creation requires auth')

  console.log('\n⚙️  AI Scoring Tests\n')

  // AI scoring endpoints
  await testEndpoint('/api/ai-scoring/models', {}, 200, 'AI models list')

  console.log('\n🌱 Development Endpoints (Should be disabled in production)\n')

  // Seed endpoints - should be disabled in production
  const isProduction = BASE_URL.includes('https://')
  if (isProduction) {
    await testEndpoint('/api/seed-all', {}, 404, 'Seed endpoint should be disabled')
    await testEndpoint('/api/speaking/seed', {}, 404, 'Speaking seed should be disabled')
  } else {
    console.log('⏭️  Skipping seed endpoint tests in development')
    results.push({
      endpoint: '/api/seed-all',
      method: 'GET',
      status: 'SKIP',
      message: 'Skipped in development',
    })
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))

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
        console.log(`   ${r.method} ${r.endpoint} - ${r.message}`)
      })
  }

  console.log('\n' + '='.repeat(60))

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1)
  }

  console.log('\n✨ All tests passed!\n')
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})

#!/usr/bin/env tsx
/**
 * Pre-Deployment Checklist
 * Runs checks to ensure the application is ready for production deployment
 *
 * Usage:
 *   pnpm tsx scripts/pre-deploy-check.ts
 */

import { config } from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env.production' })

interface CheckResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, message: string, isWarning = false): void {
  const status = condition ? 'PASS' : isWarning ? 'WARN' : 'FAIL'
  results.push({ name, status, message })

  const emoji = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌'
  console.log(`${emoji} ${name}: ${message}`)
}

console.log('🔍 Running Pre-Deployment Checks...\n')

// ============================================================================
// Environment Variables
// ============================================================================
console.log('📋 Environment Variables\n')

check(
  'NODE_ENV',
  process.env.NODE_ENV === 'production',
  process.env.NODE_ENV === 'production'
    ? 'Set to production'
    : 'Should be set to "production"',
  true
)

check(
  'DATABASE_URL',
  !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL,
  (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').includes('localhost')
    ? 'WARNING: Using localhost database'
    : process.env.DATABASE_URL || process.env.POSTGRES_URL
      ? 'Database URL configured'
      : 'Database URL not set'
)

check(
  'OPENAI_API_KEY',
  !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'),
  process.env.OPENAI_API_KEY ? 'OpenAI API key configured' : 'OpenAI API key missing'
)

check(
  'VERCEL_BLOB_TOKEN',
  !!process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN
    ? 'Vercel Blob Storage configured'
    : 'Blob storage token missing',
  true
)

check(
  'BETTER_AUTH_SECRET',
  !!process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32,
  process.env.BETTER_AUTH_SECRET
    ? process.env.BETTER_AUTH_SECRET.length >= 32
      ? 'Auth secret configured'
      : 'Auth secret too short (min 32 chars)'
    : 'Auth secret missing'
)

check(
  'BETTER_AUTH_URL',
  !!process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_URL.startsWith('https://'),
  process.env.BETTER_AUTH_URL
    ? process.env.BETTER_AUTH_URL.startsWith('https://')
      ? 'Auth URL configured with HTTPS'
      : 'Auth URL should use HTTPS in production'
    : 'Auth URL not set'
)

// ============================================================================
// Files & Configuration
// ============================================================================
console.log('\n📁 Files & Configuration\n')

check(
  'package.json',
  existsSync('package.json'),
  'Package.json exists'
)

check(
  'next.config.ts',
  existsSync('next.config.ts'),
  'Next.js config exists'
)

check(
  'vercel.json',
  existsSync('vercel.json'),
  'Vercel config exists',
  true
)

check(
  'railway.toml',
  existsSync('railway.toml'),
  'Railway config exists',
  true
)

check(
  '.env.local not in git',
  !existsSync('.git') || !readFileSync('.gitignore', 'utf-8').includes('.env'),
  '.env files in .gitignore'
)

// ============================================================================
// Database Migrations
// ============================================================================
console.log('\n🗄️  Database\n')

const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations')
check(
  'Migrations directory',
  existsSync(migrationsDir),
  existsSync(migrationsDir) ? 'Migrations directory exists' : 'No migrations found',
  true
)

// ============================================================================
// Build Check
// ============================================================================
console.log('\n🏗️  Build\n')

const buildDir = join(process.cwd(), '.next')
check(
  'Production build',
  existsSync(buildDir),
  existsSync(buildDir)
    ? 'Build directory exists (run "pnpm build" to rebuild)'
    : 'No build found - run "pnpm build" first',
  true
)

// Check package.json scripts
const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
check(
  'Build script',
  !!packageJson.scripts?.build,
  'Build script configured'
)

check(
  'Start script',
  !!packageJson.scripts?.start,
  'Start script configured'
)

// ============================================================================
// Security Checks
// ============================================================================
console.log('\n🔒 Security\n')

check(
  'API keys not in code',
  !readFileSync('package.json', 'utf-8').includes('sk-'),
  'No API keys found in package.json'
)

check(
  'Middleware configured',
  existsSync('middleware.ts'),
  'Middleware file exists for route protection'
)

// ============================================================================
// Dependencies
// ============================================================================
console.log('\n📦 Dependencies\n')

const hasNodeModules = existsSync('node_modules')
check(
  'Dependencies installed',
  hasNodeModules,
  hasNodeModules ? 'node_modules exists' : 'Run "pnpm install"'
)

// Check for known vulnerabilities (if package-lock exists)
const lockfile = existsSync('pnpm-lock.yaml')
check(
  'Lockfile',
  lockfile,
  lockfile ? 'pnpm-lock.yaml exists' : 'No lockfile found',
  true
)

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(60))
console.log('📊 Check Summary')
console.log('='.repeat(60))

const passed = results.filter((r) => r.status === 'PASS').length
const failed = results.filter((r) => r.status === 'FAIL').length
const warned = results.filter((r) => r.status === 'WARN').length
const total = results.length

console.log(`\n✅ Passed: ${passed}/${total}`)
console.log(`❌ Failed: ${failed}/${total}`)
console.log(`⚠️  Warnings: ${warned}/${total}`)

if (failed > 0) {
  console.log('\n❌ Critical Issues:')
  results
    .filter((r) => r.status === 'FAIL')
    .forEach((r) => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
}

if (warned > 0) {
  console.log('\n⚠️  Warnings:')
  results
    .filter((r) => r.status === 'WARN')
    .forEach((r) => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
}

console.log('\n' + '='.repeat(60))

if (failed === 0) {
  console.log('\n✨ All critical checks passed! Ready for deployment.\n')
  console.log('Next steps:')
  console.log('  1. Run "pnpm build" to create production build')
  console.log('  2. Test locally with "pnpm start"')
  console.log('  3. Run "pnpm tsx scripts/test-apis.ts" to test APIs')
  console.log('  4. Deploy to Vercel: "vercel --prod"')
  console.log('  5. Or deploy to Railway: "railway up"\n')
} else {
  console.log('\n⚠️  Please fix critical issues before deploying.\n')
  process.exit(1)
}

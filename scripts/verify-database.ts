/**
 * PTE Academic Practice System - Database Verification Script
 *
 * This script verifies the database schema and data integrity.
 *
 * Usage: npx tsx scripts/verify-database.ts [--verbose]
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../lib/db/schema'

const DATABASE_URL = process.env.DATABASE_URL
const VERBOSE = process.argv.includes('--verbose')

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

interface VerificationResult {
  category: string
  name: string
  passed: boolean
  message: string
  details?: any
}

const results: VerificationResult[] = []
let checkCount = 0
let passCount = 0
let failCount = 0

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logVerbose(message: string) {
  if (VERBOSE) {
    log(message, colors.gray)
  }
}

function logCheck(name: string) {
  checkCount++
  log(`\n[${checkCount}] Checking: ${name}`, colors.cyan)
}

function logPass(message: string) {
  passCount++
  log(`✓ ${message}`, colors.green)
}

function logFail(message: string) {
  failCount++
  log(`✗ ${message}`, colors.red)
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow)
}

function addResult(
  category: string,
  name: string,
  passed: boolean,
  message: string,
  details?: any
) {
  results.push({ category, name, passed, message, details })

  if (passed) {
    logPass(message)
  } else {
    logFail(message)
  }
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

async function getDatabaseConnection() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  logVerbose(`Connecting to database...`)

  const client = postgres(DATABASE_URL, {
    ssl: DATABASE_URL.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
    max: 1,
    prepare: false,
  })
  const db = drizzle(client)

  return { client, db }
}

// ============================================================================
// TABLE EXISTENCE CHECKS
// ============================================================================

async function verifyTablesExist(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('TABLE EXISTENCE VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const expectedTables = [
    // Core authentication tables
    'users',
    'sessions',
    'accounts',
    'verifications',

    // Practice section tables
    'speaking_questions',
    'speaking_attempts',
    'reading_questions',
    'reading_attempts',
    'writing_questions',
    'writing_attempts',
    'listening_questions',
    'listening_attempts',
  ]

  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `

  const result = await client.unsafe(query)
  const actualTables = result.map((row: any) => row.table_name)

  logVerbose(`Found ${actualTables.length} tables in database`)

  for (const tableName of expectedTables) {
    logCheck(`Table: ${tableName}`)

    const exists = actualTables.includes(tableName)
    addResult(
      'tables',
      tableName,
      exists,
      exists ? `Table '${tableName}' exists` : `Table '${tableName}' is missing`
    )
  }

  // Check for unexpected tables
  const unexpectedTables = actualTables.filter(
    (table: string) => !expectedTables.includes(table)
  )

  if (unexpectedTables.length > 0) {
    logWarning(`Found ${unexpectedTables.length} unexpected tables:`)
    unexpectedTables.forEach((table: string) => {
      logWarning(`  - ${table}`)
    })
  }
}

// ============================================================================
// RECORD COUNT CHECKS
// ============================================================================

async function verifyRecordCounts(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('RECORD COUNT VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const tables = [
    { name: 'speaking_questions', type: 'Speaking Questions', questionTypeColumn: 'type' },
    { name: 'speaking_attempts', type: 'Speaking Attempts' },
    { name: 'reading_questions', type: 'Reading Questions', questionTypeColumn: 'type' },
    { name: 'reading_attempts', type: 'Reading Attempts' },
    { name: 'writing_questions', type: 'Writing Questions', questionTypeColumn: 'type' },
    { name: 'writing_attempts', type: 'Writing Attempts' },
    { name: 'listening_questions', type: 'Listening Questions', questionTypeColumn: 'type' },
    { name: 'listening_attempts', type: 'Listening Attempts' },
  ]

  for (const table of tables) {
    logCheck(table.type)

    try {
      const result = await client.unsafe(
        `SELECT COUNT(*) as count FROM ${table.name}`
      )
      const count = parseInt(result[0].count)

      addResult('counts', table.name, true, `${table.type}: ${count} records`, {
        count,
      })

      // Detail breakdown by question type if applicable
      if (table.questionTypeColumn) {
        const typeResult = await client.unsafe(`
          SELECT ${table.questionTypeColumn}, COUNT(*) as count 
          FROM ${table.name} 
          GROUP BY ${table.questionTypeColumn} 
          ORDER BY ${table.questionTypeColumn}
        `)

        if (typeResult.length > 0) {
          logVerbose(`  Breakdown by type:`)
          typeResult.forEach((row: any) => {
            logVerbose(`    - ${row[table.questionTypeColumn]}: ${row.count}`)
          })
        }
      }
    } catch (error) {
      addResult(
        'counts',
        table.name,
        false,
        `Failed to count ${table.type}: ${error}`,
        { error: String(error) }
      )
    }
  }
}

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

async function verifySchemaStructure(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('SCHEMA STRUCTURE VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const tables = [
    {
      name: 'speaking_questions',
      requiredColumns: [
        'id',
        'type',
        'title',
        'prompt_text',
        'prompt_media_url',
        'difficulty',
        'tags',
        'is_active',
        'created_at',
      ],
    },
    {
      name: 'speaking_attempts',
      requiredColumns: [
        'id',
        'user_id',
        'question_id',
        'type',
        'audio_url',
        'transcript',
        'scores',
        'duration_ms',
        'words_per_minute',
        'filler_rate',
        'timings',
        'is_public',
        'created_at',
      ],
    },
    {
      name: 'reading_questions',
      requiredColumns: [
        'id',
        'type',
        'title',
        'prompt_text',
        'options',
        'answer_key',
        'difficulty',
        'tags',
        'is_active',
        'created_at',
      ],
    },
    {
      name: 'reading_attempts',
      requiredColumns: [
        'id',
        'user_id',
        'question_id',
        'user_response',
        'scores',
        'time_taken',
        'created_at',
        'updated_at',
      ],
    },
    {
      name: 'writing_questions',
      requiredColumns: [
        'id',
        'type',
        'title',
        'prompt_text',
        'options',
        'answer_key',
        'difficulty',
        'tags',
        'is_active',
        'created_at',
      ],
    },
    {
      name: 'writing_attempts',
      requiredColumns: [
        'id',
        'user_id',
        'question_id',
        'user_response',
        'scores',
        'time_taken',
        'created_at',
        'updated_at',
      ],
    },
    {
      name: 'listening_questions',
      requiredColumns: [
        'id',
        'type',
        'title',
        'prompt_text',
        'prompt_media_url',
        'correct_answers',
        'options',
        'transcript',
        'difficulty',
        'tags',
        'is_active',
        'created_at',
        'updated_at',
      ],
    },
    {
      name: 'listening_attempts',
      requiredColumns: [
        'id',
        'user_id',
        'question_id',
        'user_response',
        'scores',
        'time_taken',
        'created_at',
        'updated_at',
      ],
    },
  ]

  for (const table of tables) {
    logCheck(`Schema: ${table.name}`)

    try {
      const query = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${table.name}'
        ORDER BY ordinal_position
      `

      const result = await client.unsafe(query)
      const actualColumns = result.map((row: any) => row.column_name)

      const missingColumns = table.requiredColumns.filter(
        (col) => !actualColumns.includes(col)
      )

      if (missingColumns.length === 0) {
        addResult(
          'schema',
          table.name,
          true,
          `Schema for '${table.name}' has all required columns`,
          { columns: actualColumns.length }
        )

        if (VERBOSE) {
          logVerbose(`  Columns found: ${actualColumns.join(', ')}`)
        }
      } else {
        addResult(
          'schema',
          table.name,
          false,
          `Schema for '${table.name}' is missing columns: ${missingColumns.join(', ')}`,
          { missingColumns }
        )
      }
    } catch (error) {
      addResult(
        'schema',
        table.name,
        false,
        `Failed to verify schema for '${table.name}': ${error}`,
        { error: String(error) }
      )
    }
  }
}

// ============================================================================
// FOREIGN KEY VERIFICATION
// ============================================================================

async function verifyForeignKeys(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('FOREIGN KEY VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const expectedForeignKeys = [
    // Speaking attempts
    {
      table: 'speaking_attempts',
      column: 'question_id',
      referenced_table: 'speaking_questions',
    },
    { table: 'speaking_attempts', column: 'user_id', referenced_table: 'users' },

    // Reading attempts
    {
      table: 'reading_attempts',
      column: 'question_id',
      referenced_table: 'reading_questions',
    },
    { table: 'reading_attempts', column: 'user_id', referenced_table: 'users' },

    // Writing attempts
    {
      table: 'writing_attempts',
      column: 'question_id',
      referenced_table: 'writing_questions',
    },
    { table: 'writing_attempts', column: 'user_id', referenced_table: 'users' },

    // Listening attempts
    {
      table: 'listening_attempts',
      column: 'question_id',
      referenced_table: 'listening_questions',
    },
    {
      table: 'listening_attempts',
      column: 'user_id',
      referenced_table: 'users',
    },
  ]

  const query = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `

  try {
    const result = await client.unsafe(query)
    const actualForeignKeys = result.map((row: any) => ({
      table: row.table_name,
      column: row.column_name,
      referenced_table: row.foreign_table_name,
    }))

    for (const expectedFK of expectedForeignKeys) {
      logCheck(
        `FK: ${expectedFK.table}.${expectedFK.column} -> ${expectedFK.referenced_table}`
      )

      const exists = actualForeignKeys.some(
        (fk) =>
          fk.table === expectedFK.table &&
          fk.column === expectedFK.column &&
          fk.referenced_table === expectedFK.referenced_table
      )

      addResult(
        'foreign_keys',
        `${expectedFK.table}.${expectedFK.column}`,
        exists,
        exists
          ? `FK ${expectedFK.table}.${expectedFK.column} -> ${expectedFK.referenced_table} exists`
          : `FK ${expectedFK.table}.${expectedFK.column} -> ${expectedFK.referenced_table} is missing`
      )
    }

    logVerbose(`\nTotal foreign keys found: ${actualForeignKeys.length}`)
  } catch (error) {
    logFail(`Failed to verify foreign keys: ${error}`)
  }
}

// ============================================================================
// INDEX VERIFICATION
// ============================================================================

async function verifyIndexes(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('INDEX VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const query = `
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `

  try {
    const result = await client.unsafe(query)

    logCheck('Database Indexes')

    addResult(
      'indexes',
      'total',
      true,
      `Found ${result.length} indexes in the database`,
      { count: result.length }
    )

    if (VERBOSE) {
      log('\n  Indexes by table:', colors.gray)
      const indexesByTable = result.reduce((acc: any, row: any) => {
        if (!acc[row.tablename]) {
          acc[row.tablename] = []
        }
        acc[row.tablename].push(row.indexname)
        return acc
      }, {})

      Object.entries(indexesByTable).forEach(
        ([table, indexes]: [string, any]) => {
          logVerbose(`    ${table}: ${indexes.length} indexes`)
          indexes.forEach((index: string) => {
            logVerbose(`      - ${index}`)
          })
        }
      )
    }

    // Verify critical indexes exist
    const criticalIndexes = [
      'speaking_questions_pkey',
      'speaking_attempts_pkey',
      'reading_questions_pkey',
      'reading_attempts_pkey',
      'writing_questions_pkey',
      'writing_attempts_pkey',
      'listening_questions_pkey',
      'listening_attempts_pkey',
    ]

    const actualIndexNames = result.map((row: any) => row.indexname)

    for (const indexName of criticalIndexes) {
      const exists = actualIndexNames.includes(indexName)
      if (!exists) {
        logWarning(`Critical index missing: ${indexName}`)
      }
    }
  } catch (error) {
    addResult(
      'indexes',
      'verification',
      false,
      `Failed to verify indexes: ${error}`,
      { error: String(error) }
    )
  }
}

// ============================================================================
// DATA INTEGRITY CHECKS
// ============================================================================

async function verifyDataIntegrity(client: postgres.Sql) {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('DATA INTEGRITY VERIFICATION', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  // Check for orphaned attempts (attempts without corresponding questions)
  const attemptTables = [
    { name: 'speaking_attempts', questionTable: 'speaking_questions' },
    { name: 'reading_attempts', questionTable: 'reading_questions' },
    { name: 'writing_attempts', questionTable: 'writing_questions' },
    { name: 'listening_attempts', questionTable: 'listening_questions' },
  ]

  for (const table of attemptTables) {
    logCheck(`Orphaned records: ${table.name}`)

    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ${table.name} a
        WHERE NOT EXISTS (
          SELECT 1 FROM ${table.questionTable} q
          WHERE q.id = a.question_id
        )
      `

      const result = await client.unsafe(query)
      const orphanCount = parseInt(result[0].count)

      addResult(
        'integrity',
        table.name,
        orphanCount === 0,
        orphanCount === 0
          ? `No orphaned records in ${table.name}`
          : `Found ${orphanCount} orphaned records in ${table.name}`,
        { orphanCount }
      )
    } catch (error) {
      addResult(
        'integrity',
        table.name,
        false,
        `Failed to check orphaned records: ${error}`,
        { error: String(error) }
      )
    }
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport() {
  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('VERIFICATION SUMMARY', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  const categories = [
    'tables',
    'counts',
    'schema',
    'foreign_keys',
    'indexes',
    'integrity',
  ]

  categories.forEach((category) => {
    const categoryResults = results.filter((r) => r.category === category)
    if (categoryResults.length === 0) return

    const categoryPassed = categoryResults.filter((r) => r.passed).length
    const categoryFailed = categoryResults.filter((r) => !r.passed).length

    log(`\n${category.toUpperCase().replace('_', ' ')}:`, colors.cyan)
    log(`  Checks Run: ${categoryResults.length}`)
    logPass(`  Passed: ${categoryPassed}`)
    if (categoryFailed > 0) {
      logFail(`  Failed: ${categoryFailed}`)

      log('  Failed Checks:', colors.red)
      categoryResults
        .filter((r) => !r.passed)
        .forEach((r) => {
          log(`    - ${r.message}`, colors.red)
        })
    }
  })

  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )
  log('OVERALL RESULTS', colors.bright)
  log('═══════════════════════════════════════════════════════', colors.bright)

  log(`\nTotal Checks: ${checkCount}`)
  logPass(`Passed: ${passCount}`)
  if (failCount > 0) {
    logFail(`Failed: ${failCount}`)
  }

  const successRate = Math.round((passCount / checkCount) * 100)
  const successColor =
    successRate >= 90
      ? colors.green
      : successRate >= 70
        ? colors.yellow
        : colors.red
  log(`Success Rate: ${successRate}%`, successColor)

  log(
    '\n═══════════════════════════════════════════════════════',
    colors.bright
  )

  if (failCount > 0) {
    logWarning('\n⚠ Some checks failed. Please review the errors above.')
    return false
  } else {
    logPass('\n✓ All database checks passed!')
    return true
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log(
    '\n╔═══════════════════════════════════════════════════════╗',
    colors.bright
  )
  log('║   PTE ACADEMIC - DATABASE VERIFICATION              ║', colors.bright)
  log(
    '╚═══════════════════════════════════════════════════════╝',
    colors.bright
  )

  log(`\nVerbose Mode: ${VERBOSE ? 'ON' : 'OFF'}`, colors.blue)

  let client: postgres.Sql | null = null

  try {
    const connection = await getDatabaseConnection()
    client = connection.client

    logPass('Successfully connected to database')

    await verifyTablesExist(client)
    await verifyRecordCounts(client)
    await verifySchemaStructure(client)
    await verifyForeignKeys(client)
    await verifyIndexes(client)
    await verifyDataIntegrity(client)

    const success = generateReport()

    await client.end()

    process.exit(success ? 0 : 1)
  } catch (error) {
    log(
      '\n═══════════════════════════════════════════════════════',
      colors.bright
    )
    logFail(`FATAL ERROR: ${error}`)
    log(
      '═══════════════════════════════════════════════════════',
      colors.bright
    )

    if (client) {
      await client.end()
    }

    process.exit(1)
  }
}

// Run the verification
main()

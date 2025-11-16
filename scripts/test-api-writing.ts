import { db } from '../lib/db/drizzle.js'
import { writingQuestions } from '../lib/db/schema.js'
import { and, eq, ilike, sql } from 'drizzle-orm'

async function testWritingAPI() {
  console.log('Testing writing API query logic...\n')

  const questionType = 'summarize_written_text'
  const isActive = true
  const difficulty = undefined
  const search = ''

  // Build conditions array
  const conditions = [
    eq(writingQuestions.type, questionType),
    eq(writingQuestions.isActive, isActive),
  ]

  if (difficulty && difficulty !== 'All') {
    conditions.push(eq(writingQuestions.difficulty, difficulty as any))
  }

  if (search && search.length > 0) {
    const pattern = `%${search}%`
    conditions.push(
      sql`(
        ${writingQuestions.title} ILIKE ${pattern} OR
        ${writingQuestions.promptText} ILIKE ${pattern}
      )`
    )
  }

  console.log('Query conditions:')
  console.log('  type:', questionType)
  console.log('  isActive:', isActive)
  console.log('  difficulty:', difficulty || 'All')
  console.log('  search:', search || '(none)')

  // Execute query
  const results = await db
    .select({
      id: writingQuestions.id,
      type: writingQuestions.type,
      title: writingQuestions.title,
      difficulty: writingQuestions.difficulty,
      isActive: writingQuestions.isActive,
      tags: writingQuestions.tags,
      createdAt: writingQuestions.createdAt,
    })
    .from(writingQuestions)
    .where(and(...conditions))
    .orderBy(sql`${writingQuestions.createdAt} DESC, ${writingQuestions.id} DESC`)
    .limit(10)

  console.log(`\nFound ${results.length} questions:\n`)
  results.forEach((q, i) => {
    console.log(`${i + 1}. ${q.title}`)
    console.log(`   ID: ${q.id}`)
    console.log(`   Difficulty: ${q.difficulty}`)
    console.log(`   Tags: ${JSON.stringify(q.tags)}`)
    console.log(`   Created: ${q.createdAt}`)
    console.log('')
  })

  process.exit(0)
}

testWritingAPI().catch((error) => {
  console.error('Error testing API:', error)
  process.exit(1)
})

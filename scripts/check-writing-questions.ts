import { db } from '../lib/db/drizzle.js'
import { writingQuestions } from '../lib/db/schema.js'
import { eq, sql } from 'drizzle-orm'

async function checkWritingQuestions() {
  console.log('Checking writing questions in database...\n')

  // Count all writing questions
  const allCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(writingQuestions)

  console.log('Total writing questions:', allCount[0].count)

  // Count by type
  const byType = await db
    .select({
      type: writingQuestions.type,
      count: sql<number>`count(*)::int`,
    })
    .from(writingQuestions)
    .groupBy(writingQuestions.type)

  console.log('\nBy type:')
  byType.forEach((row) => {
    console.log(`  ${row.type}: ${row.count}`)
  })

  // Get nov2025 questions
  const nov2025Questions = await db
    .select({
      id: writingQuestions.id,
      type: writingQuestions.type,
      title: writingQuestions.title,
      isActive: writingQuestions.isActive,
      tags: writingQuestions.tags,
    })
    .from(writingQuestions)
    .where(sql`${writingQuestions.tags}::jsonb @> '["nov2025"]'::jsonb`)
    .limit(5)

  console.log('\nNov2025 questions (first 5):')
  nov2025Questions.forEach((q) => {
    console.log(`  ${q.id} - ${q.title}`)
    console.log(`    Type: ${q.type}`)
    console.log(`    Active: ${q.isActive}`)
    console.log(`    Tags: ${JSON.stringify(q.tags)}`)
  })

  // Check summarize_written_text specifically
  const swtCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(writingQuestions)
    .where(eq(writingQuestions.type, 'summarize_written_text'))

  console.log('\nSummarize Written Text questions:', swtCount[0].count)

  // Check active summarize_written_text
  const activeSwtCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(writingQuestions)
    .where(
      sql`${writingQuestions.type} = 'summarize_written_text' AND ${writingQuestions.isActive} = true`
    )

  console.log('Active Summarize Written Text questions:', activeSwtCount[0].count)

  process.exit(0)
}

checkWritingQuestions().catch((error) => {
  console.error('Error checking questions:', error)
  process.exit(1)
})

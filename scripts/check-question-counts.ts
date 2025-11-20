import { db } from '../lib/db/drizzle'
import { speakingQuestions, pteQuestions, pteSyncJobs } from '../lib/db/schema'
import { eq, sql } from 'drizzle-orm'

async function checkQuestionCounts() {
  console.log('=== CHECKING QUESTION COUNTS ===\n')

  // Check speakingQuestions table (local seed data)
  console.log('1. speakingQuestions table (local seed data):')
  const speakingTypes = [
    'read_aloud',
    'repeat_sentence',
    'describe_image',
    'retell_lecture',
    'answer_short_question',
    'summarize_group_discussion',
    'respond_to_a_situation'
  ]

  for (const type of speakingTypes) {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, type as any))

    console.log(`  ${type}: ${count[0].count}`)
  }

  // Check pteQuestions table (external sync data)
  console.log('\n2. pteQuestions table (external sync data):')
  const pteSpeakingTypes = [
    's_read_aloud',
    's_repeat_sentence',
    's_describe_image',
    's_retell_lecture',
    's_short_question',
    's_respond_situation_academic',
    's_summarize_group_discussion'
  ]

  for (const type of pteSpeakingTypes) {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(pteQuestions)
      .where(eq(pteQuestions.questionType, type))

    console.log(`  ${type}: ${count[0].count}`)
  }

  // Check total counts
  const totalSpeaking = await db
    .select({ count: sql<number>`count(*)` })
    .from(speakingQuestions)

  const totalPte = await db
    .select({ count: sql<number>`count(*)` })
    .from(pteQuestions)

  console.log(`\n3. Total counts:`)
  console.log(`  speakingQuestions: ${totalSpeaking[0].count}`)
  console.log(`  pteQuestions: ${totalPte[0].count}`)

  // Check sync jobs
  console.log('\n4. Recent sync jobs:')
  const recentJobs = await db
    .select()
    .from(pteSyncJobs)
    .orderBy(sql`created_at DESC`)
    .limit(5)

  if (recentJobs.length === 0) {
    console.log('  No sync jobs found')
  } else {
    recentJobs.forEach(job => {
             console.log(`  ${job.jobType} ${job.questionType}: ${job.status} (${(job as any).createdAt})`);
      if (job.stats) {
        console.log(`    Stats: ${JSON.stringify(job.stats)}`)
      }
    })
  }

  process.exit(0)
}

checkQuestionCounts().catch(console.error)
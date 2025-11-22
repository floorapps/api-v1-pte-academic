// server-only sync utilities to mirror external OnePTE-like API data into Drizzle
import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import {
  pteQuestionMedia,
  pteQuestions,
  pteSyncJobs,
  type PteQuestion,
} from '@/lib/db/schema'
import {
  fetchSpeakingAll,
  type ExternalSpeakingItem,
  type SpeakingTypeCode,
} from '@/lib/pte/onepte-client'

// Canonical section for these types
const SPEAKING_SECTION = 'speaking'

// All seven speaking types to support from day one
export const ALL_SPEAKING_TYPES: SpeakingTypeCode[] = [
  's_read_aloud',
  's_repeat_sentence',
  's_describe_image',
  's_retell_lecture',
  's_short_question',
  's_respond_situation_academic',
  's_summarize_group_discussion',
]

type UpsertStats = {
  inserted: number
  updated: number
  mediaInserted: number
  errors: number
}

/**
 * Map external item -> question row payload
 */
function toQuestionRow(
  item: ExternalSpeakingItem,
  type: SpeakingTypeCode
): Omit<typeof pteQuestions.$inferInsert, 'id'> {
  const duration =
    typeof item.durationSec === 'number' && !Number.isNaN(item.durationSec)
      ? item.durationSec
      : undefined

  return {
    testId: null, // not tied to a specific test for practice bank
    externalId: String(item.id),
    source: 'onepte',
    question: item.title || item.text || `External ${type} #${item.id}`,
    questionType: type,
    section: SPEAKING_SECTION,
    questionData: {
      text: item.text ?? null,
      audioUrl: item.audioUrl ?? null,
      imageUrl: item.imageUrl ?? null,
      durationSec: duration ?? null,
      raw: item.raw ?? null,
    },
    tags: item.tags ?? null,
    correctAnswer: null,
    points: 1,
    orderIndex: 0,
    difficulty: (item.difficulty || 'medium').toString().toLowerCase(),
  }
}

/**
 * Upsert a single speaking item and any associated media.
 * Idempotent by (externalId, questionType).
 */
async function upsertSpeakingItem(
  item: ExternalSpeakingItem,
  type: SpeakingTypeCode
): Promise<{
  op: 'insert' | 'update'
  mediaInserted: number
  question: PteQuestion
}> {
  // Find existing by externalId+questionType
  const existing = await db
    .select()
    .from(pteQuestions)
    .where(
      and(
        eq(pteQuestions.externalId, String(item.id)),
        eq(pteQuestions.questionType, type)
      )
    )
    .limit(1)

  const rowPayload = toQuestionRow(item, type)

  let op: 'insert' | 'update' = 'insert'
  let question: PteQuestion

  if (existing.length > 0) {
    const [updated] = await db
      .update(pteQuestions)
      .set({
        // Keep stable columns updated
        question: rowPayload.question,
        section: rowPayload.section,
        questionData: rowPayload.questionData,
        tags: rowPayload.tags,
        difficulty: rowPayload.difficulty,
        updatedAt: new Date(),
      })
      .where(eq(pteQuestions.id, existing[0].id))
      .returning()
    question = updated as unknown as PteQuestion
    op = 'update'
  } else {
    const [inserted] = await db
      .insert(pteQuestions)
      .values(rowPayload)
      .returning()
    question = inserted as unknown as PteQuestion
    op = 'insert'
  }

  // Link media rows when present (audio/image)
  let mediaInserted = 0
  const mediaCandidates: Array<{
    kind: 'audio' | 'image'
    url: string
    metadata?: unknown
  }> = []

  if (item.audioUrl) {
    mediaCandidates.push({
      kind: 'audio',
      url: item.audioUrl,
      metadata: { externalId: item.id },
    })
  }
  if (item.imageUrl) {
    mediaCandidates.push({
      kind: 'image',
      url: item.imageUrl,
      metadata: { externalId: item.id },
    })
  }

  for (const m of mediaCandidates) {
    // Check if same media already exists for the question to avoid duplication
    const exists = await db
      .select({ id: pteQuestionMedia.id })
      .from(pteQuestionMedia)
      .where(
        and(
          eq(pteQuestionMedia.questionId, question.id),
          eq(pteQuestionMedia.kind, m.kind),
          eq(pteQuestionMedia.url, m.url)
        )
      )
      .limit(1)

    if (exists.length === 0) {
      await db
        .insert(pteQuestionMedia)
        .values({
          questionId: question.id,
          kind: m.kind,
          url: m.url,
          metadata: m.metadata || null,
        })
        .returning()
      mediaInserted++
    }
  }

  return { op, mediaInserted, question }
}

/**
 * Sync one speaking type
 */
export async function syncSpeakingType(type: SpeakingTypeCode): Promise<{
  type: SpeakingTypeCode
  stats: UpsertStats
}> {
  // Track a sync job row for analytics/debugging
  const [job] = await db
    .insert(pteSyncJobs)
    .values({
      jobType: 'speaking',
      questionType: type,
      status: 'running',
      startedAt: new Date(),
      stats: null,
    })
    .returning()

  const stats: UpsertStats = {
    inserted: 0,
    updated: 0,
    mediaInserted: 0,
    errors: 0,
  }

  try {
    const items = await fetchSpeakingAll(type, 200)

    for (const it of items) {
      try {
        const res = await upsertSpeakingItem(it, type)
        if (res.op === 'insert') stats.inserted++
        else stats.updated++
        stats.mediaInserted += res.mediaInserted
      } catch (e) {
        // Keep syncing other items
        stats.errors++
         
        console.error(
          `[syncSpeakingType] Failed upsert for ${type} externalId=${it.id}`,
          e
        )
      }
    }

    await db
      .update(pteSyncJobs)
      .set({
        status: 'success',
        finishedAt: new Date(),
        stats,
      })
      .where(eq(pteSyncJobs.id, job.id))
  } catch (e) {
    await db
      .update(pteSyncJobs)
      .set({
        status: 'error',
        finishedAt: new Date(),
        error: String((e as { message?: unknown })?.message ?? e),
        stats,
      })
      .where(eq(pteSyncJobs.id, job.id))
    throw e
  }

  return { type, stats }
}

/**
 * Sync all seven speaking types and return a consolidated report.
 */
export async function syncAllSpeaking(): Promise<{
  summary: Record<SpeakingTypeCode, UpsertStats>
  totalInserted: number
  totalUpdated: number
  totalMediaInserted: number
  totalErrors: number
}> {
  const summary = {} as Record<SpeakingTypeCode, UpsertStats>

  let totalInserted = 0
  let totalUpdated = 0
  let totalMediaInserted = 0
  let totalErrors = 0

  for (const t of ALL_SPEAKING_TYPES) {
    const { stats } = await syncSpeakingType(t)
    summary[t] = stats
    totalInserted += stats.inserted
    totalUpdated += stats.updated
    totalMediaInserted += stats.mediaInserted
    totalErrors += stats.errors
  }

  return {
    summary,
    totalInserted,
    totalUpdated,
    totalMediaInserted,
    totalErrors,
  }
}

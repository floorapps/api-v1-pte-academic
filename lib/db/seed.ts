import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { and, eq, sql } from 'drizzle-orm'
import { db } from './drizzle'
import {
  accounts,
  listeningQuestions,
  pteQuestions,
  pteTests,
  readingQuestions,
  speakingAttempts,
  speakingQuestions,
  userProfiles,
  users,
  writingAttempts,
  writingQuestions,
} from './schema'

dotenv.config({ path: '.env.local' })

// ------------------------------
// Types and helpers
// ------------------------------

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type SpeakingType =
  | 'read_aloud'
  | 'repeat_sentence'
  | 'describe_image'
  | 'retell_lecture'
  | 'answer_short_question'
  | 'summarize_group_discussion'
  | 'respond_to_a_situation'

type SpeakingSeedRecord = {
  title: string
  type: SpeakingType
  promptText?: string | null
  promptMediaUrl?: string | null // audio or image URL
  difficulty?: string | Difficulty
  tags?: string[]
}

type ReadingSeedRecord = {
  title: string
  type: string
  promptText: string
  options?: any
  answerKey?: any
  difficulty?: string | Difficulty
  tags?: string[]
}

type WritingSeedRecord = {
  title: string
  type: string
  promptText: string
  options?: any
  answerKey?: any
  difficulty?: string | Difficulty
  tags?: string[]
}

type ListeningSeedRecord = {
  title: string
  type: string
  promptText?: string | null
  promptMediaUrl?: string | null
  transcript?: string | null
  options?: any
  correctAnswers: any
  difficulty?: string | Difficulty
  tags?: string[]
}

type BaseSeedOptions = {
  limitPerType?: number
}

type ResetFlags = {
  speaking?: boolean
  reading?: boolean
  writing?: boolean
  listening?: boolean
}

// Normalize difficulty to DB enum values (schema uses capitalized strings)
function normalizeDifficulty(input?: string | Difficulty): Difficulty {
  if (!input) return 'Medium'
  const s = String(input).toLowerCase()
  if (s === 'easy') return 'Easy'
  if (s === 'hard') return 'Hard'
  return 'Medium'
}

// Ensure URL uses forward slashes; for local assets ensure it starts with /asset/
function normalizeMediaUrl(input?: string | null): string | null {
  if (!input) return null
  let url = input.replace(/\\/g, '/')
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/')) {
    // treat as repo-relative asset path
    if (url.startsWith('asset/')) url = `/${url}`
    else url = `/asset/${url}`
  }
  return url
}

async function readJsonFile<T = any>(relativePath: string): Promise<T | null> {
  try {
    const abs = path.resolve(process.cwd(), relativePath)
    const raw = await fs.readFile(abs, 'utf8')
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(
      `[seed] Missing or invalid JSON at ${relativePath}; skipping.`,
      e instanceof Error ? e.message : e
    )
    return null
  }
}

function groupByType<T extends { type: string }>(
  items: T[],
  limitPerType?: number
): T[] {
  if (!limitPerType || limitPerType <= 0) return items
  const counts = new Map<string, number>()
  const out: T[] = []
  for (const it of items) {
    const t = it.type
    const c = counts.get(t) ?? 0
    if (c < limitPerType) {
      out.push(it)
      counts.set(t, c + 1)
    }
  }
  return out
}

// ------------------------------
// Public: Reset helpers
// ------------------------------

export async function resetTables(flags: ResetFlags) {
  console.log('[seed] resetTables', flags)

  if (flags.speaking) {
    // Delete children first
    await db.delete(speakingAttempts)
    await db.delete(speakingQuestions)
  }

  if (flags.reading) {
    await db.delete(readingQuestions)
  }

  if (flags.writing) {
    await db.delete(writingAttempts)
    await db.delete(writingQuestions)
  }

  if (flags.listening) {
    await db.delete(listeningQuestions)
  }
}

// ------------------------------
// Public: Speaking seeding
// ------------------------------

export async function seedSpeakingQuestions(
  _db = db,
  opts: BaseSeedOptions = {}
) {
  const { limitPerType } = opts

  // Load seed files (co-located under lib/db/seeds/)
  const seeds: Array<SpeakingSeedRecord> = []

  const speakingSeedFiles = [
    'lib/db/seeds/speaking.read_aloud.json',
    'lib/db/seeds/speaking.repeat_sentence.json',
    'lib/db/seeds/speaking.describe_image.json',
    'lib/db/seeds/speaking.retell_lecture.json',
    'lib/db/seeds/speaking.answer_short_question.json',
    'lib/db/seeds/speaking.summarize_group_discussion.json',
    'lib/db/seeds/speaking.respond_to_a_situation.json',
    'lib/db/seeds/speaking.read_aloud.nov2025.json',
  ]

  for (const file of speakingSeedFiles) {
    const arr = (await readJsonFile<SpeakingSeedRecord[]>(file)) ?? []
    seeds.push(...arr)
  }

  const items = groupByType(seeds, limitPerType)

  let inserted = 0
  const insertedByType: Record<string, number> = {}

  // OPTIMIZED: Batch check for existing questions first
  const existingQuestions = await _db
    .select({ type: speakingQuestions.type, title: speakingQuestions.title })
    .from(speakingQuestions)

  const existingKeys = new Set(
    existingQuestions.map((q) => `${q.type}:${q.title}`)
  )

  // Filter out existing questions
  const newQuestions = items
    .filter((rec) => !existingKeys.has(`${rec.type}:${rec.title.trim()}`))
    .map((rec) => ({
      type: rec.type,
      title: rec.title.trim(),
      promptText: rec.promptText ?? null,
      promptMediaUrl: normalizeMediaUrl(rec.promptMediaUrl ?? null),
      difficulty: normalizeDifficulty(rec.difficulty),
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      isActive: true,
    }))

  // OPTIMIZED: Batch insert all new questions at once
  if (newQuestions.length > 0) {
    // PostgreSQL can handle large batches, but we'll chunk for safety
    const BATCH_SIZE = 100
    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
      const batch = newQuestions.slice(i, i + BATCH_SIZE)
      await _db.insert(speakingQuestions).values(batch)

      // Track insertions by type
      batch.forEach((q) => {
        insertedByType[q.type] = (insertedByType[q.type] ?? 0) + 1
      })
    }
    inserted = newQuestions.length
  }

  return {
    inserted,
    insertedByType,
  }
}

// ------------------------------
// Public: Reading seeding
// ------------------------------

export async function seedReadingQuestions(
  _db = db,
  opts: BaseSeedOptions = {}
) {
  const { limitPerType } = opts

  // Load multiple reading seed files
  const seeds: Array<ReadingSeedRecord> = []
  const readingSeedFiles = [
    'lib/db/seeds/reading.minimal.json',
    'lib/db/seeds/reading.multiple_choice.nov2025.json',
  ]

  for (const file of readingSeedFiles) {
    const arr = (await readJsonFile<ReadingSeedRecord[]>(file)) ?? []
    seeds.push(...arr)
  }

  const items = groupByType(seeds, limitPerType)

  let inserted = 0
  const insertedByType: Record<string, number> = {}

  // OPTIMIZED: Batch check existing
  const existingQuestions = await _db
    .select({ type: readingQuestions.type, title: readingQuestions.title })
    .from(readingQuestions)

  const existingKeys = new Set(
    existingQuestions.map((q) => `${q.type}:${q.title}`)
  )

  const newQuestions = items
    .filter((rec) => !existingKeys.has(`${rec.type}:${rec.title.trim()}`))
    .map((rec) => ({
      type: rec.type,
      title: rec.title.trim(),
      promptText: rec.promptText,
      options: rec.options ?? null,
      answerKey: rec.answerKey ?? null,
      difficulty: normalizeDifficulty(rec.difficulty),
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      isActive: true,
    }))

  // OPTIMIZED: Batch insert
  if (newQuestions.length > 0) {
    const BATCH_SIZE = 100
    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
      const batch = newQuestions.slice(i, i + BATCH_SIZE)
      await _db.insert(readingQuestions).values(batch)
      batch.forEach((q) => {
        insertedByType[q.type] = (insertedByType[q.type] ?? 0) + 1
      })
    }
    inserted = newQuestions.length
  }

  return {
    inserted,
    insertedByType,
  }
}

// ------------------------------
// Public: Writing seeding
// ------------------------------

export async function seedWritingQuestions(
  _db = db,
  opts: BaseSeedOptions = {}
) {
  const { limitPerType } = opts

  // Load seed files
  const seeds: Array<WritingSeedRecord> = []

  const writingSeedFiles = [
    'lib/db/seeds/writing.summarize_written_text.json',
    'lib/db/seeds/writing.write_essay.json',
    'lib/db/seeds/writing.write_essay.nov2025.json',
    'lib/db/seeds/writing.summarize_written_text.nov2025.json',
  ]

  for (const file of writingSeedFiles) {
    const arr = (await readJsonFile<WritingSeedRecord[]>(file)) ?? []
    seeds.push(...arr)
  }

  const items = groupByType(seeds, limitPerType)

  let inserted = 0
  const insertedByType: Record<string, number> = {}

  // OPTIMIZED: Batch check existing
  const existingQuestions = await _db
    .select({ type: writingQuestions.type, title: writingQuestions.title })
    .from(writingQuestions)

  const existingKeys = new Set(
    existingQuestions.map((q) => `${q.type}:${q.title}`)
  )

  const newQuestions = items
    .filter((rec) => !existingKeys.has(`${rec.type}:${rec.title.trim()}`))
    .map((rec) => ({
      type: rec.type,
      title: rec.title.trim(),
      promptText: rec.promptText,
      options: rec.options ?? null,
      answerKey: rec.answerKey ?? null,
      difficulty: normalizeDifficulty(rec.difficulty),
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      isActive: true,
    }))

  // OPTIMIZED: Batch insert
  if (newQuestions.length > 0) {
    const BATCH_SIZE = 100
    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
      const batch = newQuestions.slice(i, i + BATCH_SIZE)
      await _db.insert(writingQuestions).values(batch)
      batch.forEach((q) => {
        insertedByType[q.type] = (insertedByType[q.type] ?? 0) + 1
      })
    }
    inserted = newQuestions.length
  }

  return {
    inserted,
    insertedByType,
  }
}

// ------------------------------
// Public: Listening seeding
// ------------------------------

export async function seedListeningQuestions(
  _db = db,
  opts: BaseSeedOptions = {}
) {
  const { limitPerType } = opts

  // Load multiple listening seed files
  const seeds: Array<ListeningSeedRecord> = []
  const listeningSeedFiles = [
    'lib/db/seeds/listening.minimal.json',
    'lib/db/seeds/listening.nov2025.json',
  ]

  for (const file of listeningSeedFiles) {
    const arr = (await readJsonFile<ListeningSeedRecord[]>(file)) ?? []
    seeds.push(...arr)
  }

  const items = groupByType(seeds, limitPerType)

  let inserted = 0
  const insertedByType: Record<string, number> = {}

  // OPTIMIZED: Batch check existing
  const existingQuestions = await _db
    .select({ type: listeningQuestions.type, title: listeningQuestions.title })
    .from(listeningQuestions)

  const existingKeys = new Set(
    existingQuestions.map((q) => `${q.type}:${q.title}`)
  )

  const newQuestions = items
    .filter((rec) => !existingKeys.has(`${rec.type}:${rec.title.trim()}`))
    .map((rec) => ({
      type: rec.type as any,
      title: rec.title.trim(),
      promptText: rec.promptText ?? null,
      promptMediaUrl: normalizeMediaUrl(rec.promptMediaUrl ?? null),
      transcript: rec.transcript ?? null,
      options: rec.options ?? null,
      correctAnswers: rec.correctAnswers,
      difficulty: normalizeDifficulty(rec.difficulty),
      tags: Array.isArray(rec.tags) ? rec.tags : [],
      isActive: true,
    }))

  // OPTIMIZED: Batch insert
  if (newQuestions.length > 0) {
    const BATCH_SIZE = 100
    for (let i = 0; i < newQuestions.length; i += BATCH_SIZE) {
      const batch = newQuestions.slice(i, i + BATCH_SIZE)
      await _db.insert(listeningQuestions).values(batch)
      batch.forEach((q) => {
        insertedByType[q.type] = (insertedByType[q.type] ?? 0) + 1
      })
    }
    inserted = newQuestions.length
  }

  return {
    inserted,
    insertedByType,
  }
}

// ------------------------------
// Legacy Sample Test + User seeding
// (retained for backward-compat when no CLI flags passed)
// ------------------------------

async function runLegacySeed() {
  console.log('Seeding database (legacy sample)...')

  // Seed sample PTE tests and questions
  const [sampleTest] = await db
    .insert(pteTests)
    .values({
      title: 'PTE Academic Sample Test 1',
      description: 'Sample practice set',
      testType: 'ACADEMIC',
      duration: 120,
      isPremium: 'false',
    })
    .onConflictDoNothing()
    .returning()

  if (sampleTest) {
    console.log('Sample test created.')
    const testId = sampleTest.id

    // Keep legacy mockQuestions-based flow if available
    // Attempt to import lazily to avoid circular imports if removed
    let mockQuestions: any = null
    try {
      const mod = await import('./mock-data')
      mockQuestions = (mod as any).mockQuestions
    } catch {
      // no-op
    }

    if (mockQuestions) {
      const questions = Object.entries(mockQuestions).flatMap(
        ([section, questionTypes]: any) =>
          Object.entries(questionTypes).flatMap(
            ([questionType, questionList]: any) =>
              (questionList as Array<any>).map((q: any, idx: number) => ({
                testId,
                section: String(section).toUpperCase(),
                questionType,
                question: q.title,
                questionData: { duration: q.duration },
                correctAnswer: null,
                points: 1,
                orderIndex: idx + 1,
              }))
          )
      )

      if (questions.length) {
        await db.insert(pteQuestions).values(questions).onConflictDoNothing()
        console.log('PTE questions seeded.')
      }
    } else {
      console.log(
        'mockQuestions not found; skipping legacy pteQuestions seeding.'
      )
    }
  } else {
    console.log('Sample test already exists.')
  }

  const email = 'test@test.com'
  const password = 'password123'

  // Find or create user
  let user = (
    await db
      .select()
      .from(users)
      .where(sql`email = ${email}`)
      .limit(1)
  )[0]
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email,
        name: 'Test User',
        emailVerified: true,
      })
      .returning()
    console.log('Initial user created.')

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: user.id,
      providerId: 'email',
      accountId: email,
      password: hashedPassword,
    })
    console.log('User account with password created.')

    // Create user profile with target score
    await db.insert(userProfiles).values({
      userId: user.id,
      targetScore: 79,
      examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      studyGoal: 'Achieve PTE Academic score of 79+ for immigration purposes',
    })
    console.log('User profile with target score created.')
  } else {
    console.log('User already exists, checking for account.')
    const userAccount = (
      await db
        .select()
        .from(accounts)
        .where(sql`user_id = ${user.id} AND provider_id = 'email'`)
        .limit(1)
    )[0]
    if (!userAccount) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        providerId: 'email',
        accountId: email,
        password: hashedPassword,
      })
      console.log('User account with password created for existing user.')
    } else {
      console.log('User account already exists.')
    }

    // Check and create user profile if needed
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (existingProfile.length === 0) {
      await db.insert(userProfiles).values({
        userId: user.id,
        targetScore: 79,
        examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        studyGoal: 'Achieve PTE Academic score of 79+ for immigration purposes',
      })
      console.log('User profile with target score created for existing user.')
    } else {
      console.log('User profile already exists.')
    }
  }
}

// ------------------------------
// CLI parsing and runner
// ------------------------------

function parseArgv(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')))
  const getNum = (key: string): number | undefined => {
    const match = argv.find((a) => a.startsWith(`${key}=`))
    if (!match) return undefined
    const [, v] = match.split('=')
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const limit = getNum('--limit')

  return {
    speaking: flags.has('--speaking'),
    reading: flags.has('--reading'),
    writing: flags.has('--writing'),
    listening: flags.has('--listening'),
    all: flags.has('--all'),
    reset: flags.has('--reset'),
    limitPerType: limit,
  }
}

async function runCLI() {
  const argv = process.argv.slice(2)
  const { speaking, reading, writing, listening, all, reset, limitPerType } =
    parseArgv(argv)

  const anyNewFlags =
    speaking ||
    reading ||
    writing ||
    listening ||
    all ||
    reset ||
    typeof limitPerType !== 'undefined'

  if (!anyNewFlags) {
    // Backward compatible behavior: run legacy seed
    await runLegacySeed()
    return
  }

  const flags: ResetFlags = {
    speaking: all || speaking ? true : false,
    reading: all || reading ? true : false,
    writing: all || writing ? true : false,
    listening: all || listening ? true : false,
  }

  if (reset) {
    await resetTables(flags)
    console.log('[seed] Reset completed.')
  }

  const summaries: any = {}

  if (flags.speaking) {
    const res = await seedSpeakingQuestions(db, { limitPerType })
    summaries.speaking = res
  }
  if (flags.reading) {
    const res = await seedReadingQuestions(db, { limitPerType })
    summaries.reading = res
  }
  if (flags.writing) {
    const res = await seedWritingQuestions(db, { limitPerType })
    summaries.writing = res
  }
  if (flags.listening) {
    const res = await seedListeningQuestions(db, { limitPerType })
    summaries.listening = res
  }

  console.log(
    '[seed] Completed with summaries:',
    JSON.stringify(summaries, null, 2)
  )
}

// Only execute when run directly (not when imported)
const invokedDirectly =
  !!process.argv[1] &&
  (process.argv[1].endsWith(`${path.sep}lib${path.sep}db${path.sep}seed.ts`) ||
    process.argv[1].endsWith(`${path.sep}lib${path.sep}db${path.sep}seed.js`) ||
    process.argv[1].includes(`lib${path.sep}db${path.sep}seed.`))

if (invokedDirectly) {
  runCLI()
    .catch((error) => {
      console.error('Seed process failed:', error)
      process.exit(1)
    })
    .finally(() => {
      console.log('Seed process finished. Exiting...')
      process.exit(0)
    })
}

// Named exports are available for API route usage:
// - seedSpeakingQuestions()
// - seedReadingQuestions()
// - seedWritingQuestions()
// - seedListeningQuestions()
// - resetTables()

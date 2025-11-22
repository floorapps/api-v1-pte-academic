// Single source of truth for PTE timing across sections
// Defaults can be overridden via env JSON: NEXT_PUBLIC_PTE_TIMING_OVERRIDES or PTE_TIMING_OVERRIDES
// Example JSON:
// {
//   "speaking": { "read_aloud": { "prepMs": 34000, "answerMs": 42000 } },
//   "writing": { "summarize_written_text": { "answerMs": 540000 } },
//   "reading": { "sectionMs": 1740000 },
//   "listening": { "sectionMs": 2400000, "summarize_spoken_text": { "answerMs": 540000 } }
// }

export type PteSection = 'speaking' | 'writing' | 'reading' | 'listening'

export type SpeakingType =
  | 'read_aloud'
  | 'repeat_sentence'
  | 'describe_image'
  | 'retell_lecture'
  | 'answer_short_question'
  | 'respond_to_a_situation'
  | 'summarize_group_discussion'

export type WritingType = 'summarize_written_text' | 'write_essay'

export type ReadingType =
  | 'reading_writing_fill_blanks'
  | 'multiple_choice_single'
  | 'multiple_choice_multiple'
  | 'reorder_paragraphs'
  | 'fill_in_blanks'

export type ListeningType =
  | 'summarize_spoken_text'
  | 'multiple_choice_single'
  | 'multiple_choice_multiple'
  | 'fill_in_blanks'
  | 'highlight_correct_summary'
  | 'select_missing_word'
  | 'highlight_incorrect_words'
  | 'write_from_dictation'

export type AnyQuestionType =
  | SpeakingType
  | WritingType
  | ReadingType
  | ListeningType
  | string

export type SpeakingTiming = { prepMs?: number; answerMs: number }
export type WritingTiming = { answerMs: number }
export type ItemTiming = { answerMs: number }
export type SectionTiming = { sectionMs: number }

export type TimingResult =
  | ({ section: 'speaking'; type: SpeakingType } & SpeakingTiming)
  | ({ section: 'writing'; type: WritingType } & WritingTiming)
  | ({ section: 'listening'; type?: ListeningType } & (
      | ItemTiming
      | SectionTiming
    ))
  | ({ section: 'reading'; type?: ReadingType } & SectionTiming)

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// Helpers to compute milliseconds
export const ms = Object.freeze({
  s: (n: number) => n * 1000,
  m: (n: number) => n * 60 * 1000,
})

// Format a ms duration as mm:ss (or hh:mm:ss if >= 1 hour)
export function format(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

// Defaults (Authentic PTE Baseline - Updated November 2025)
// November 2025 Update: Test duration reduced to 2 hours (120 minutes)
// Section timings: Speaking & Writing: 54-67 mins, Reading: 29-30 mins, Listening: 30-43 mins
const SPEAKING_DEFAULTS: Record<SpeakingType, SpeakingTiming> = {
  read_aloud: { prepMs: ms.s(35), answerMs: ms.s(40) },
  repeat_sentence: { prepMs: ms.s(1), answerMs: ms.s(15) }, // post-audio prep=1s, NOW includes beep sound (June 2025 update)
  describe_image: { prepMs: ms.s(25), answerMs: ms.s(40) },
  retell_lecture: { prepMs: ms.s(10), answerMs: ms.s(40) },
  answer_short_question: { prepMs: ms.s(3), answerMs: ms.s(10) },
  respond_to_a_situation: { prepMs: ms.s(10), answerMs: ms.s(40) }, // NEW August 2025: Real-world scenario response
  summarize_group_discussion: { prepMs: ms.s(10), answerMs: ms.s(120) }, // NEW August 2025: 2-4 speaker discussion summary
}

const WRITING_DEFAULTS: Record<WritingType, WritingTiming> = {
  summarize_written_text: { answerMs: ms.m(10) },
  write_essay: { answerMs: ms.m(20) },
}

// Section defaults (November 2025 Update)
// Reading: 29-30 minutes (reduced from previous format)
const READING_SECTION_DEFAULT: SectionTiming = { sectionMs: ms.m(30) }

// Listening: item + section defaults
// Listening: 30-43 minutes (November 2025 Update)
const LISTENING_ITEM_DEFAULTS: Partial<Record<ListeningType, ItemTiming>> = {
  summarize_spoken_text: { answerMs: ms.m(10) },
}

const LISTENING_SECTION_DEFAULT: SectionTiming = { sectionMs: ms.m(43) }

// Top-level config object enabling overrides by env JSON
const DEFAULT_CONFIG = {
  speaking: SPEAKING_DEFAULTS,
  writing: WRITING_DEFAULTS,
  reading: READING_SECTION_DEFAULT,
  listening: {
    ...LISTENING_SECTION_DEFAULT,
    items: LISTENING_ITEM_DEFAULTS,
  },
}

type TimingConfig = typeof DEFAULT_CONFIG

// Deep merge for overrides
function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const out: any = Array.isArray(base)
    ? [...(base as any)]
    : { ...(base as any) }
  for (const k of Object.keys(override || {})) {
    const bv = (base as any)[k]
    const ov = (override as any)[k]
    if (
      ov &&
      typeof ov === 'object' &&
      !Array.isArray(ov) &&
      bv &&
      typeof bv === 'object' &&
      !Array.isArray(bv)
    ) {
      out[k] = deepMerge(bv, ov as any)
    } else {
      out[k] = ov
    }
  }
  return out
}

function loadOverrides(): DeepPartial<TimingConfig> | null {
  try {
    const fromPublic = process.env.NEXT_PUBLIC_PTE_TIMING_OVERRIDES
    const fromServer = process.env.PTE_TIMING_OVERRIDES
    const raw = fromPublic || fromServer
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed as DeepPartial<TimingConfig>
  } catch (e) {
     
    console.warn(
      '[timing] Failed to parse timing overrides JSON. Using defaults.',
      e
    )
    return null
  }
}

const OVERRIDES = loadOverrides()
export const TIMING: TimingConfig = OVERRIDES
  ? deepMerge(DEFAULT_CONFIG, OVERRIDES)
  : DEFAULT_CONFIG

// Main resolver
// Returns a normalized timing object for the requested section & type.
// - Speaking: { prepMs?, answerMs }
// - Writing:  { answerMs }
// - Reading:  { sectionMs }
// - Listening:
//    * summarize_spoken_text -> { answerMs }
//    * others -> { sectionMs }
export function timingFor(
  section: PteSection,
  type?: AnyQuestionType
): TimingResult {
  switch (section) {
    case 'speaking': {
      const key = String(type || '').toLowerCase() as SpeakingType
      const t = (TIMING.speaking as Record<string, SpeakingTiming>)[key]
      if (!t) {
         
        console.warn(
          '[timing] Unknown speaking type; falling back to read_aloud defaults.',
          { type }
        )
      }
      const f = t || TIMING.speaking.read_aloud
      return {
        section: 'speaking',
        type: (key || 'read_aloud') as SpeakingType,
        prepMs: f.prepMs,
        answerMs: f.answerMs,
      }
    }

    case 'writing': {
      const key = String(type || '').toLowerCase() as WritingType
      const t =
        (TIMING.writing as Record<string, WritingTiming>)[key] ||
        TIMING.writing.write_essay
      return {
        section: 'writing',
        type: (key || 'write_essay') as WritingType,
        answerMs: t.answerMs,
      }
    }

    case 'reading': {
      const sectionMs = TIMING.reading.sectionMs
      return {
        section: 'reading',
        type: type as ReadingType | undefined,
        sectionMs,
      }
    }

    case 'listening': {
      const listen = TIMING.listening
      const key = String(type || '').toLowerCase() as ListeningType
      const item = (listen.items as Record<string, ItemTiming | undefined>)[key]
      if (item?.answerMs != null) {
        return { section: 'listening', type: key, answerMs: item.answerMs }
      }
      return { section: 'listening', type: key, sectionMs: listen.sectionMs }
    }

    default: {
      // Fallback to a safe short timer
      return { section: 'reading', type: undefined, sectionMs: ms.m(29) }
    }
  }
}

// Utility: compute total time window given server-provided startAt
export function endAtFrom(startAt: number, durationMs: number): number {
  return startAt + Math.max(0, durationMs)
}

// Soft drift detection helper: returns positive ms if clientNow is ahead of serverNow beyond threshold
export function driftMs(serverNow: number, clientNow: number): number {
  return clientNow - serverNow
}

// Format helpers for labels
export function formatLabel(
  section: PteSection,
  type?: AnyQuestionType
): string {
  if (section === 'speaking') {
    return `Speaking · ${String(type || '').replaceAll('_', ' ') || 'item'}`
  }
  if (section === 'writing') {
    return `Writing · ${String(type || '').replaceAll('_', ' ') || 'item'}`
  }
  if (section === 'reading') {
    return 'Reading Section'
  }
  if (section === 'listening') {
    if (String(type || '') === 'summarize_spoken_text')
      return 'Listening · Summarize Spoken Text'
    return 'Listening Section'
  }
  return 'PTE'
}

import 'server-only'
import { TestSection } from '@/lib/pte/types'

export type ScoringResult = {
  overall: number // 0–90
  subscores: Record<string, number> // 0–90 per rubric dimension
  rationale?: string
  metadata?: Record<string, any>
}

export type ProviderMetadata = {
  provider:
  | 'openai'
  | 'gemini'
  | 'vercel'
  | 'google-genai'
  | 'groq'
  | 'deterministic'
  | 'heuristic'
  | 'unknown'
  model?: string
  latencyMs?: number
  requestId?: string
  finishReason?: string
  timestamp?: string // ISO
  [k: string]: any
}

export type ProviderRawScore = {
  overall?: number // may be 0–100 or already normalized
  subscores?: Record<string, number> // provider raw scores (varied ranges)
  rationale?: string
  meta?: ProviderMetadata
}

export const RUBRIC_KEYS = {
  speaking: [
    'content',
    'pronunciation',
    'fluency',
    'grammar',
    'vocabulary',
  ] as const,
  writing: [
    'content',
    'structure',
    'coherence',
    'grammar',
    'vocabulary',
    'spelling',
  ] as const,
  reading: ['correctness'] as const,
  listening: ['correctness', 'wer'] as const,
}

export type RubricKey =
  | (typeof RUBRIC_KEYS.speaking)[number]
  | (typeof RUBRIC_KEYS.writing)[number]
  | (typeof RUBRIC_KEYS.reading)[number]
  | (typeof RUBRIC_KEYS.listening)[number]

/**
 * Clamp number to 0..90
 */
export function clampTo90(n: number): number {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 90) return 90
  return Math.round(n)
}

/**
 * Linear scale from an arbitrary range into 0..90
 */
export function scaleTo90(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  if (max <= min) return clampTo90(value)
  const ratio = (value - min) / (max - min)
  return clampTo90(ratio * 90)
}

/**
 * Convert accuracy 0..1 (or 0..100) into 0..90
 */
export function accuracyTo90(accuracy: number, isPercentage = false): number {
  const v = isPercentage ? accuracy / 100 : accuracy
  return clampTo90(v * 90)
}

/**
 * Convert WER (0.0 best .. 1.0 worst, can exceed 1.0) to 0..90 score
 * We map:
 *  - WER 0.0 => 90
 *  - WER 1.0 => ~30
 *  - WER 0.5 => ~60
 *  - Cap at lower bound 0 for extreme WER
 */
export function werTo90(wer: number): number {
  if (!Number.isFinite(wer)) return 0
  const w = Math.max(0, wer)
  const score = 90 - Math.min(1, w) * 60 - Math.max(0, w - 1) * 30 // degrade after 1.0 more
  return clampTo90(score)
}

/**
 * Weighted overall from subscores (already normalized to 0..90).
 * If weights not provided, equal weights are used.
 */
export function weightedOverall(
  subscores: Record<string, number>,
  weights?: Record<string, number>
): number {
  const keys = Object.keys(subscores)
  if (keys.length === 0) return 0
  if (!weights) {
    const avg =
      keys.reduce((acc, k) => acc + (subscores[k] ?? 0), 0) / keys.length
    return clampTo90(avg)
  }
  let sumW = 0
  let sum = 0
  for (const k of keys) {
    const w = Math.max(0, weights[k] ?? 0)
    sumW += w
    sum += (subscores[k] ?? 0) * w
  }
  if (sumW === 0) {
    const avg =
      keys.reduce((acc, k) => acc + (subscores[k] ?? 0), 0) / keys.length
    return clampTo90(avg)
  }
  return clampTo90(sum / sumW)
}

/**
 * Normalize raw provider subscores to 0..90 using a per-dimension scaling map.
 * If a dimension isn't present, it's ignored.
 */
export function normalizeSubscores(
  raw: Record<string, number | undefined>,
  scalers?: Partial<Record<string, { min: number; max: number }>>
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v !== 'number') continue
    const s = scalers?.[k]
    if (s) {
      out[k] = scaleTo90(v, s.min, s.max)
    } else {
      // Assume already in 0..90 or 0..100; detect and normalize if > 90
      out[k] = v > 90 ? scaleTo90(v, 0, 100) : clampTo90(v)
    }
  }
  return out
}

/**
 * Merge multiple provider outputs into a single ScoringResult.
 * Strategy: prefer first non-empty subscores by order, then average overlapping.
 */
export function mergeProviderScores(
  inputs: ProviderRawScore[],
  section: TestSection,
  weightsBySection?: Partial<Record<TestSection, Record<string, number>>>
): ScoringResult {
  const subs: Record<string, number[]> = {}
  let rationaleParts: string[] = []
  let metaList: ProviderMetadata[] = []

  for (const inp of inputs) {
    if (inp.subscores) {
      for (const [k, v] of Object.entries(inp.subscores)) {
        if (typeof v !== 'number') continue
        if (!subs[k]) subs[k] = []
        subs[k].push(clampTo90(v > 90 ? scaleTo90(v, 0, 100) : v))
      }
    }
    if (inp.rationale) rationaleParts.push(inp.rationale)
    if (inp.meta) metaList.push(inp.meta)
  }

  const mergedSubscores: Record<string, number> = {}
  for (const [k, arr] of Object.entries(subs)) {
    if (arr.length === 0) continue
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length
    mergedSubscores[k] = clampTo90(avg)
  }

  // If no subscores provided, fall back to overall from providers
  if (Object.keys(mergedSubscores).length === 0) {
    const overallCandidates = inputs
      .map((i) => i.overall)
      .filter((n): n is number => typeof n === 'number')
    const overall =
      overallCandidates.length > 0
        ? clampTo90(
          overallCandidates.reduce(
            (a, b) => a + (b > 90 ? scaleTo90(b, 0, 100) : b),
            0
          ) / overallCandidates.length
        )
        : 0
    return {
      overall,
      subscores: {},
      rationale: rationaleParts.filter(Boolean).join('\n').slice(0, 2000),
      metadata: {
        providers: metaList,
      },
    }
  }

  const overall = weightedOverall(mergedSubscores, weightsBySection?.[section])
  return {
    overall,
    subscores: mergedSubscores,
    rationale: rationaleParts.filter(Boolean).join('\n').slice(0, 2000),
    metadata: { providers: metaList },
  }
}

/**
 * Build a ScoringResult from deterministic accuracy / WER metrics.
 */
export function buildDeterministicResult(params: {
  section: TestSection
  accuracyPct?: number // 0..100
  accuracy?: number // 0..1
  wer?: number // 0..inf, lower is better
  rationale?: string
  meta?: ProviderMetadata
}): ScoringResult {
  const { section, accuracyPct, accuracy, wer, rationale, meta } = params
  const subs: Record<string, number> = {}
  if (section === TestSection.READING) {
    const acc =
      typeof accuracy === 'number' ? accuracy : (accuracyPct ?? 0) / 100
    subs.correctness = accuracyTo90(acc)
  } else if (section === TestSection.LISTENING) {
    if (typeof wer === 'number') {
      subs.wer = werTo90(wer)
      // If both accuracy and wer are provided, average them for correctness
      if (typeof accuracy === 'number' || typeof accuracyPct === 'number') {
        const acc =
          typeof accuracy === 'number' ? accuracy : (accuracyPct ?? 0) / 100
        subs.correctness = accuracyTo90(acc)
      }
    } else {
      const acc =
        typeof accuracy === 'number' ? accuracy : (accuracyPct ?? 0) / 100
      subs.correctness = accuracyTo90(acc)
    }
  } else {
    // Not typical for deterministic, but allow it
    const acc =
      typeof accuracy === 'number' ? accuracy : (accuracyPct ?? 0) / 100
    subs.correctness = accuracyTo90(acc)
  }

  const overall = weightedOverall(subs)
  return {
    overall,
    subscores: subs,
    rationale,
    metadata: {
      provider: 'deterministic',
      ...(meta ?? {}),
    },
  }
}

/**
 * Combine deterministic (objective) and LLM (subjective feedback) into one unified result.
 * Strategy: take deterministic subscores where present, and fill remaining from LLM.
 * Overall is re-computed with equal weights unless weights provided.
 */
export function combineDeterministicAndLLM(
  deterministic: ScoringResult | null,
  llm: ScoringResult | null,
  weights?: Record<string, number>
): ScoringResult {
  const subs: Record<string, number> = {}
  const parts: string[] = []
  const meta: Record<string, any> = {}

  if (deterministic) {
    Object.assign(subs, deterministic.subscores)
    if (deterministic.rationale)
      parts.push(`Deterministic: ${deterministic.rationale}`)
    meta.deterministic = deterministic.metadata
  }
  if (llm) {
    for (const [k, v] of Object.entries(llm.subscores)) {
      if (typeof subs[k] !== 'number') subs[k] = v
    }
    if (llm.rationale) parts.push(`LLM: ${llm.rationale}`)
    meta.llm = llm.metadata
  }

  const overall = weightedOverall(subs, weights)
  return {
    overall,
    subscores: subs,
    rationale: parts.filter(Boolean).join('\n').slice(0, 2000),
    metadata: meta,
  }
}

/**
 * Map section name strings to TestSection, forgiving input.
 */
export function toTestSection(section: string): TestSection {
  const s = section.toUpperCase()
  if (s.includes('SPEAK')) return TestSection.SPEAKING
  if (s.includes('WRIT')) return TestSection.WRITING
  if (s.includes('READ')) return TestSection.READING
  if (s.includes('LISTEN')) return TestSection.LISTENING
  return TestSection.READING
}

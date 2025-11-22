import 'server-only'
import { GeminiProvider } from '@/lib/ai/providers/gemini'
import { OpenAIProvider } from '@/lib/ai/providers/openai'
import { GroqProvider } from '@/lib/ai/providers/groq'
import { GoogleGenAIProvider } from '@/lib/ai/providers/google-genai'
import type { AIProvider, ProviderRawScore } from '@/lib/ai/providers/types'
import { VercelAIProvider } from '@/lib/ai/providers/vercel'
import {
  scoreListeningWriteFromDictation,
  scoreReadingFillInBlanks,
  scoreReadingMCQMultiple,
  scoreReadingMCQSingle,
  scoreReadingReorderParagraphs,
} from '@/lib/pte/scoring-deterministic'
import {
  buildDeterministicResult,
  clampTo90,
  mergeProviderScores,
  ScoringResult,
  weightedOverall,
} from '@/lib/pte/scoring-normalize'
import { getDefaultWeights } from '@/lib/pte/scoring-rubrics'
import { getTranscriber } from '@/lib/pte/transcribe'
import { TestSection } from '@/lib/pte/types'

/**
 * Unified scoring orchestrator input
 */
export type OrchestratorInput = {
  section: TestSection
  questionType: string // snake_case client types supported: speaking/*, writing/*, reading/*, listening/*
  payload: any // task specific payload (see docs)
  includeRationale?: boolean
  providerPriority?: string[] // override global priority
  timeoutMs?: number // override default timeout
}

/**
 * Main entry point
 */
export async function scoreWithOrchestrator(
  input: OrchestratorInput
): Promise<ScoringResult> {
  const start = Date.now()
  const timeoutMs = getDefaultTimeout(input.timeoutMs)
  const priority = getProviderPriority(input.section, input.providerPriority)

  // 1) Deterministic-first for objective types
  const maybeDeterministic = await tryDeterministic(input)
  if (maybeDeterministic) {
    // Optionally enrich with LLM rationale for explanations
    if (input.includeRationale) {
      const llmExplain = await tryLLMExplanation(input, timeoutMs, priority)
      if (llmExplain) {
        return mergeProviderScores(
          [
            {
              overall: maybeDeterministic.overall,
              subscores: maybeDeterministic.subscores,
              rationale: maybeDeterministic.rationale,
              meta: {
                provider: 'deterministic',
                latencyMs: Date.now() - start,
              },
            },
            {
              overall: llmExplain.overall,
              subscores: llmExplain.subscores,
              rationale: llmExplain.rationale,
              meta: (llmExplain.metadata?.providers?.[0] ?? {
                provider: 'unknown',
              }) as any,
            },
          ],
          input.section,
          { [input.section]: getDefaultWeights(input.section) }
        )
      }
    }
    return maybeDeterministic
  }

  // 2) Subjective or non-deterministic task: pick providers by priority and fallback
  const providers = initProviders(priority)
  const results: ProviderRawScore[] = []

  for (const p of providers) {
    try {
      const r = await callProvider(p, input, timeoutMs)
      results.push(r)
      // Early return if primary succeeded with reasonable content
      if (hasSubscores(r) || typeof r.overall === 'number') {
        const sr = providerRawToScoringResult(r, input.section)
        sr.metadata = {
          ...(sr.metadata || {}),
          providers: [r.meta ?? { provider: p.name }],
        }
        return sr
      }
    } catch (e: any) {
      // Continue to next provider
      results.push({
        meta: {
          provider: p.name,
          error: e?.message ?? 'provider_error',
        } as any,
      })
      continue
    }
  }

  // 3) If we reach here, either all providers failed or only provided rationale text.
  // Merge whatever we have into a minimal ScoringResult.
  const merged = mergeProviderScores(results, input.section, {
    [input.section]: getDefaultWeights(input.section),
  })
  if (!merged.rationale) {
    merged.rationale = 'All providers failed or returned insufficient data.'
  }
  merged.metadata = {
    ...(merged.metadata || {}),
    orchestratorLatencyMs: Date.now() - start,
  }
  return merged
}

/**
 * Provider selection policy
 */
function getProviderPriority(
  section: TestSection,
  override?: string[]
): ('openai' | 'gemini' | 'groq' | 'google-genai' | 'vercel' | 'heuristic')[] {
  // From env: e.g. "openai,gemini,groq,google-genai,vercel,heuristic"
  const envRaw = (process.env.PTE_SCORING_PROVIDER_PRIORITY || '').trim()
  const envList = envRaw
    ? envRaw.split(',').map((s) => s.trim().toLowerCase())
    : null

  const base: ('openai' | 'gemini' | 'groq' | 'google-genai' | 'vercel' | 'heuristic')[] =
    section === TestSection.SPEAKING || section === TestSection.WRITING
      ? ['google-genai', 'openai', 'gemini', 'groq', 'vercel', 'heuristic']
      : // Reading/Listening non-deterministic: prefer Google GenAI for advanced analysis
      ['google-genai', 'gemini', 'groq', 'openai', 'vercel', 'heuristic']

  const apply = (arr?: string[] | null) => {
    if (!arr || !arr.length) return base
    const filtered = arr.filter(
      (p): p is 'openai' | 'gemini' | 'groq' | 'google-genai' | 'vercel' | 'heuristic' =>
        p === 'openai' || p === 'gemini' || p === 'groq' || p === 'google-genai' || p === 'vercel' || p === 'heuristic'
    )
    return filtered.length ? filtered : base
  }

  return apply(override ?? envList)
}

function initProviders(
  order: ('openai' | 'gemini' | 'groq' | 'google-genai' | 'vercel' | 'heuristic')[]
): AIProvider[] {
  const out: AIProvider[] = []
  for (const p of order) {
    if (p === 'openai') out.push(OpenAIProvider)
    if (p === 'gemini') out.push(GeminiProvider)
    if (p === 'groq') out.push(GroqProvider)
    if (p === 'google-genai') out.push(GoogleGenAIProvider)
    if (p === 'vercel') out.push(VercelAIProvider)
    // 'heuristic' is not a real provider; its role is handled by deterministic/heuristic paths
  }
  return out
}

async function callProvider(
  provider: AIProvider,
  input: OrchestratorInput,
  timeoutMs: number
): Promise<ProviderRawScore> {
  const common = {
    questionType: input.questionType,
    timeoutMs,
    includeRationale: input.includeRationale,
  } as any

  if (input.section === TestSection.SPEAKING) {
    // Enrich with transcript if audio provided
    const payload = { ...input.payload }
    if (!payload.transcript && payload.audioUrl) {
      try {
        const t = await (
          await getTranscriber()
        ).transcribe({ audioUrl: payload.audioUrl })
        payload.transcript = t.transcript || ''
      } catch {
        // ignore transcription failure; provider prompt can still run with no transcript
      }
    }

    if (input.questionType === 'respond_to_a_situation' && provider.scoreDialog) {
      return await provider.scoreDialog({
        section: TestSection.SPEAKING,
        questionType: 'respond_to_a_situation',
        transcript: String(payload.transcript || ''),
        situation: payload.referenceText ? String(payload.referenceText) : '',
        ...common,
      })
    }

    return await provider.scoreSpeaking({
      section: TestSection.SPEAKING,
      ...common,
      transcript: String(payload.transcript || ''),
      referenceText: payload.referenceText
        ? String(payload.referenceText)
        : undefined,
    })
  }

  if (input.section === TestSection.WRITING) {
    const payload = { ...input.payload }
    return await provider.scoreWriting({
      section: TestSection.WRITING,
      ...common,
      text: String(payload.text || payload.answer || ''),
      prompt: payload.prompt ? String(payload.prompt) : undefined,
    })
  }

  if (input.section === TestSection.READING) {
    const p = input.payload || {}
    return await provider.scoreReading({
      section: TestSection.READING,
      ...common,
      question: p.question,
      options: p.options,
      correct: p.correct,
      userSelected:
        p.userSelected ||
        p.selectedOptions ||
        (p.selectedOption ? [p.selectedOption] : []),
    })
  }

  // Listening
  const p = input.payload || {}
  return await provider.scoreListening({
    section: TestSection.LISTENING,
    ...common,
    transcript: p.transcript,
    targetText: p.targetText,
    userText: p.userText,
  })
}

/**
 * Deterministic handlers for objective tasks
 */
async function tryDeterministic(
  input: OrchestratorInput
): Promise<ScoringResult | null> {
  const qt = (input.questionType || '').toLowerCase()

  // Reading objective
  if (input.section === TestSection.READING) {
    if (qt.includes('multiple_choice_single')) {
      const { selectedOption, correctOption } = input.payload || {}
      if (selectedOption && correctOption) {
        return scoreReadingMCQSingle({ selectedOption, correctOption })
      }
    }
    if (qt.includes('multiple_choice_multiple')) {
      const { selectedOptions, correctOptions } = input.payload || {}
      if (Array.isArray(selectedOptions) && Array.isArray(correctOptions)) {
        return scoreReadingMCQMultiple({ selectedOptions, correctOptions })
      }
    }
    if (qt.includes('fill_in_blanks')) {
      // covers both reading and reading_writing variants
      const { answers, correct } = input.payload || {}
      if (answers && correct) {
        return scoreReadingFillInBlanks({ answers, correct })
      }
    }
    if (qt.includes('reorder_paragraphs')) {
      const { order, correctOrder, userOrder } = input.payload || {}
      const u = Array.isArray(userOrder) ? userOrder : order
      if (Array.isArray(u) && Array.isArray(correctOrder)) {
        return scoreReadingReorderParagraphs({ userOrder: u, correctOrder })
      }
    }
    return null
  }

  // Listening objective: WFD
  if (input.section === TestSection.LISTENING) {
    if (qt.includes('write_from_dictation') || qt.includes('wfd')) {
      const { targetText, userText } = input.payload || {}
      if (typeof targetText === 'string' && typeof userText === 'string') {
        return scoreListeningWriteFromDictation({ targetText, userText })
      }
    }
    return null
  }

  // Speaking/Writing - not deterministic
  return null
}

/**
 * LLM explanation helper for objective tasks (Reading/Listening).
 * Uses provider priority suited for the section.
 */
async function tryLLMExplanation(
  input: OrchestratorInput,
  timeoutMs: number,
  priority: ReturnType<typeof getProviderPriority>
): Promise<ScoringResult | null> {
  const providers = initProviders(priority)
  for (const p of providers) {
    try {
      const raw = await callProvider(p, input, timeoutMs)
      if (raw.rationale) {
        const sr = providerRawToScoringResult(raw, input.section)
        sr.metadata = { providers: [raw.meta ?? { provider: p.name }] }
        return sr
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * Convert ProviderRawScore -> ScoringResult, computing overall if missing.
 */
function providerRawToScoringResult(
  raw: ProviderRawScore,
  section: TestSection
): ScoringResult {
  const subs = raw.subscores || {}
  const overall = clampTo90(
    typeof raw.overall === 'number'
      ? raw.overall
      : weightedOverall(subs, getDefaultWeights(section))
  )
  return {
    overall,
    subscores: subs,
    rationale: raw.rationale,
    metadata: raw.meta ? { providers: [raw.meta] } : undefined,
  }
}

function hasSubscores(r: ProviderRawScore): boolean {
  return !!(r.subscores && Object.keys(r.subscores).length)
}

function getDefaultTimeout(override?: number): number {
  const raw = Number(override ?? process.env.PTE_SCORING_TIMEOUT_MS)
  if (Number.isFinite(raw) && raw > 0) return raw
  return 8000
}

/**
 * Simple heuristics for speaking could be added here and merged with LLM scores if needed.
 * For now, we rely on provider subscores and weights to compute overall.
 */

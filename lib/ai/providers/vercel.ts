import 'server-only'
import {
  extractJSON,
  withTimeout,
  type AIProvider,
  type HealthStatus,
  type ListeningInput,
  type ProviderRawScore,
  type ReadingInput,
  type SpeakingInput,
  type WritingInput,
} from '@/lib/ai/providers/types'
import {
  clampTo90,
  normalizeSubscores,
  weightedOverall,
} from '@/lib/pte/scoring-normalize'
import {
  buildListeningExplanationPrompt,
  buildReadingExplanationPrompt,
  buildSpeakingPrompt,
  buildWritingPrompt,
  getDefaultWeights,
} from '@/lib/pte/scoring-rubrics'
import { TestSection } from '@/lib/pte/types'

/**
 * Vercel AI SDK wrapper.
 * This provider is tertiary. It mirrors OpenAI/Gemini prompts through the ai SDK if available.
 * We dynamically import to keep it optional.
 */

type AICore = any
type Provider = any

async function getVercelAI(): Promise<{
  core: AICore
  provider: Provider
} | null> {
  try {
    const apiKey =
      process.env.VERCEL_AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) return null

    // ai SDK is optional; avoid bundler hard deps
    const coreMod = await (Function(
      'specifier',
      'return import(specifier)'
    )('ai') as Promise<{ generateText: any }>)
    // When using "ai", model selection is string-based; no further provider module needed at runtime here
    return { core: coreMod, provider: null }
  } catch {
    return null
  }
}

const MODEL_OAI_MINI =
  process.env.VERCEL_AI_OPENAI_MODEL || 'openai:gpt-4o-mini'
const MODEL_GEMINI_FAST =
  process.env.VERCEL_AI_GEMINI_MODEL || 'google:gemini-1.5-flash'

function pickVercelModel(kind: 'speaking' | 'writing' | 'explain'): string {
  if (kind === 'explain') return MODEL_OAI_MINI
  if (kind === 'writing') return MODEL_OAI_MINI
  return MODEL_OAI_MINI
}

export class VercelAIProvider implements AIProvider {
  name: 'vercel' = 'vercel'

  async health(): Promise<HealthStatus> {
    const start = Date.now()
    const ai = await getVercelAI()
    if (!ai)
      return { provider: 'vercel', ok: false, error: 'sdk_or_api_key_missing' }
    try {
      // Light ping via small generateText call
      const model = pickVercelModel('explain')
      const { generateText } = ai.core
      await withTimeout(
        generateText({
          model,
          system: 'pong',
          prompt: 'ping',
          temperature: 0,
          maxOutputTokens: 1,
        }),
        2000
      )
      return {
        provider: 'vercel',
        ok: true,
        model,
        latencyMs: Date.now() - start,
      }
    } catch (e: any) {
      return {
        provider: 'vercel',
        ok: false,
        model: pickVercelModel('explain'),
        latencyMs: Date.now() - start,
        error: e?.message ?? 'unknown_error',
      }
    }
  }

  async scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore> {
    const ai = await getVercelAI()
    if (!ai) throw new Error('vercel_ai_unavailable')
    const t0 = Date.now()

    const { system, user } = buildSpeakingPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      includeRationale: input.includeRationale,
    })

    const { generateText } = ai.core
    const model = pickVercelModel('speaking')

    const res = await withTimeout(
      generateText({
        model,
        system,
        prompt: user,
        temperature: 0.2,
        maxOutputTokens: 500,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    ) as { text: string }

    const content = res?.text ?? ''
    const parsed = safeParseSpeakingJSON(content)

    const subs = normalizeSubscores({
      content: parsed.content,
      pronunciation: parsed.pronunciation,
      fluency: parsed.fluency,
      grammar: parsed.grammar,
      vocabulary: parsed.vocabulary,
    })

    const overall = clampTo90(
      parsed.overall ??
        weightedOverall(subs, getDefaultWeights(TestSection.SPEAKING))
    )

    return {
      overall,
      subscores: subs,
      rationale: parsed.rationale,
      meta: {
        provider: 'vercel',
        model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreWriting(input: WritingInput): Promise<ProviderRawScore> {
    const ai = await getVercelAI()
    if (!ai) throw new Error('vercel_ai_unavailable')
    const t0 = Date.now()

    const { system, user } = buildWritingPrompt({
      questionType: input.questionType,
      text: input.text,
      prompt: input.prompt,
      includeRationale: input.includeRationale,
    })

    const { generateText } = ai.core
    const model = pickVercelModel('writing')

    const res = await withTimeout(
      generateText({
        model,
        system,
        prompt: user,
        temperature: 0.2,
        maxOutputTokens: 600,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    ) as { text: string }

    const content = res?.text ?? ''
    const parsed = safeParseWritingJSON(content)

    const subs = normalizeSubscores({
      content: parsed.content,
      structure: parsed.structure,
      coherence: parsed.coherence,
      grammar: parsed.grammar,
      vocabulary: parsed.vocabulary,
      spelling: parsed.spelling,
    })

    const overall = clampTo90(
      parsed.overall ??
        weightedOverall(subs, getDefaultWeights(TestSection.WRITING))
    )

    return {
      overall,
      subscores: subs,
      rationale: parsed.rationale,
      meta: {
        provider: 'vercel',
        model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreReading(input: ReadingInput): Promise<ProviderRawScore> {
    const ai = await getVercelAI()
    if (!ai) throw new Error('vercel_ai_unavailable')
    const t0 = Date.now()

    const { system, user } = buildReadingExplanationPrompt({
      questionType: input.questionType,
      question: input.question ?? '',
      options: input.options ?? [],
      correct: input.correct ?? [],
      userSelected: input.userSelected ?? [],
    })

    const { generateText } = ai.core
    const model = pickVercelModel('explain')

    const res = await withTimeout(
      generateText({
        model,
        system,
        prompt: user,
        temperature: 0.2,
        maxOutputTokens: 320,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    ) as { text: string }

    const content = res?.text ?? ''
    let rationale = ''
    try {
      const obj = extractJSON<{ rationale?: string }>(content)
      rationale = obj?.rationale ?? ''
    } catch {
      rationale = trimTo(content, 1000)
    }

    return {
      overall: undefined,
      subscores: {},
      rationale,
      meta: {
        provider: 'vercel',
        model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreListening(input: ListeningInput): Promise<ProviderRawScore> {
    const ai = await getVercelAI()
    if (!ai) throw new Error('vercel_ai_unavailable')
    const t0 = Date.now()

    const { system, user } = buildListeningExplanationPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      targetText: input.targetText,
      userText: input.userText,
    })

    const { generateText } = ai.core
    const model = pickVercelModel('explain')

    const res = await withTimeout(
      generateText({
        model,
        system,
        prompt: user,
        temperature: 0.2,
        maxOutputTokens: 320,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    ) as { text: string }

    const content = res?.text ?? ''
    let rationale = ''
    try {
      const obj = extractJSON<{ rationale?: string }>(content)
      rationale = obj?.rationale ?? ''
    } catch {
      rationale = trimTo(content, 1000)
    }

    return {
      overall: undefined,
      subscores: {},
      rationale,
      meta: {
        provider: 'vercel',
        model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

/** Parsers **/

function safeParseSpeakingJSON(text: string): {
  overall?: number
  content?: number
  pronunciation?: number
  fluency?: number
  grammar?: number
  vocabulary?: number
  rationale?: string
} {
  try {
    const obj = extractJSON(text) as any
    return {
      overall: asNum(obj.overall),
      content: asNum(obj.content),
      pronunciation: asNum(obj.pronunciation),
      fluency: asNum(obj.fluency),
      grammar: asNum(obj.grammar),
      vocabulary: asNum(obj.vocabulary),
      rationale: asStr(obj.rationale),
    }
  } catch {
    return {}
  }
}

function safeParseWritingJSON(text: string): {
  overall?: number
  content?: number
  structure?: number
  coherence?: number
  grammar?: number
  vocabulary?: number
  spelling?: number
  rationale?: string
} {
  try {
    const obj = extractJSON(text) as any
    return {
      overall: asNum(obj.overall),
      content: asNum(obj.content),
      structure: asNum(obj.structure),
      coherence: asNum(obj.coherence),
      grammar: asNum(obj.grammar),
      vocabulary: asNum(obj.vocabulary),
      spelling: asNum(obj.spelling),
      rationale: asStr(obj.rationale),
    }
  } catch {
    return {}
  }
}

/** Utils **/

function asNum(v: any): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
function asStr(v: any): string | undefined {
  return typeof v === 'string' ? v : undefined
}
function trimTo(s: string, n: number): string {
  s = s || ''
  return s.length > n ? s.slice(0, n) : s
}

function getDefaultTimeout(): number {
  const raw = process.env.PTE_SCORING_TIMEOUT_MS
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0) return n
  return 8000
}

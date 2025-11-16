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

type OpenAIClient = any

async function getOpenAI(): Promise<OpenAIClient | null> {
  try {
    // Dynamic import to keep SDK optional
    const mod = await (Function(
      'specifier',
      'return import(specifier)'
    )('openai') as Promise<{ default: any }>)
    const OpenAI = mod.default
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return null
    return new OpenAI({ apiKey })
  } catch {
    return null
  }
}

const DEFAULT_MODEL_SPEAKING = 'gpt-4o-mini'
const DEFAULT_MODEL_WRITING = 'gpt-4o-mini'
const DEFAULT_MODEL_EXPLANATION = 'gpt-4o-mini'

export class OpenAIProvider implements AIProvider {
  name: 'openai' = 'openai'

  async health(): Promise<HealthStatus> {
    const start = Date.now()
    const client = await getOpenAI()
    if (!client) {
      return { provider: 'openai', ok: false, error: 'sdk_or_api_key_missing' }
    }
    try {
      // Minimal no-op request
      await withTimeout(
        client.chat.completions.create({
          model: DEFAULT_MODEL_EXPLANATION,
          messages: [
            { role: 'system', content: 'pong' },
            { role: 'user', content: 'ping' },
          ],
          max_tokens: 1,
          temperature: 0,
        }),
        2000
      )
      return {
        provider: 'openai',
        ok: true,
        model: DEFAULT_MODEL_EXPLANATION,
        latencyMs: Date.now() - start,
      }
    } catch (e: any) {
      return {
        provider: 'openai',
        ok: false,
        model: DEFAULT_MODEL_EXPLANATION,
        latencyMs: Date.now() - start,
        error: e?.message ?? 'unknown_error',
      }
    }
  }

  async scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getOpenAI()
    if (!client) throw new Error('openai_unavailable')
    const { system, user } = buildSpeakingPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      includeRationale: input.includeRationale,
    })

    const resp = (await withTimeout(
      client.chat.completions.create({
        model: DEFAULT_MODEL_SPEAKING,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    )) as any

    const content = resp?.choices?.[0]?.message?.content ?? '{}'
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
        provider: 'openai',
        model: DEFAULT_MODEL_SPEAKING,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
        finishReason: resp?.choices?.[0]?.finish_reason,
        requestId: resp?.id,
      },
    }
  }

  async scoreWriting(input: WritingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getOpenAI()
    if (!client) throw new Error('openai_unavailable')

    const { system, user } = buildWritingPrompt({
      questionType: input.questionType,
      text: input.text,
      prompt: input.prompt,
      includeRationale: input.includeRationale,
    })

    const resp = (await withTimeout(
      client.chat.completions.create({
        model: DEFAULT_MODEL_WRITING,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    )) as any

    const content = resp?.choices?.[0]?.message?.content ?? '{}'
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
        provider: 'openai',
        model: DEFAULT_MODEL_WRITING,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
        finishReason: resp?.choices?.[0]?.finish_reason,
        requestId: resp?.id,
      },
    }
  }

  // For Reading/Listening we mostly provide rationale/explanations on demand.
  async scoreReading(input: ReadingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getOpenAI()
    if (!client) throw new Error('openai_unavailable')

    const { system, user } = buildReadingExplanationPrompt({
      questionType: input.questionType,
      question: input.question ?? '',
      options: input.options ?? [],
      correct: input.correct ?? [],
      userSelected: input.userSelected ?? [],
    })

    const resp = (await withTimeout(
      client.chat.completions.create({
        model: DEFAULT_MODEL_EXPLANATION,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 250,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    )) as any

    const content = resp?.choices?.[0]?.message?.content ?? '{}'
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
        provider: 'openai',
        model: DEFAULT_MODEL_EXPLANATION,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
        finishReason: resp?.choices?.[0]?.finish_reason,
        requestId: resp?.id,
      },
    }
  }

  async scoreListening(input: ListeningInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getOpenAI()
    if (!client) throw new Error('openai_unavailable')

    const { system, user } = buildListeningExplanationPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      targetText: input.targetText,
      userText: input.userText,
    })

    const resp = (await withTimeout(
      client.chat.completions.create({
        model: DEFAULT_MODEL_EXPLANATION,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 250,
      }),
      input.timeoutMs ?? getDefaultTimeout()
    )) as any

    const content = resp?.choices?.[0]?.message?.content ?? '{}'
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
        provider: 'openai',
        model: DEFAULT_MODEL_EXPLANATION,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
        finishReason: resp?.choices?.[0]?.finish_reason,
        requestId: resp?.id,
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

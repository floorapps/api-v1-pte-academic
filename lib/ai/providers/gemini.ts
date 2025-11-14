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

type GeminiClient = any

async function getGemini(): Promise<GeminiClient | null> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) return null
    const mod = await (Function(
      'specifier',
      'return import(specifier)'
    )('@google/generative-ai') as Promise<{
      GoogleGenerativeAI: any
    }>)
    const { GoogleGenerativeAI } = mod
    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI
  } catch {
    return null
  }
}

const MODEL_FAST = 'gemini-1.5-flash'
const MODEL_QUALITY = 'gemini-1.5-pro'

async function callGeminiJSON({
  client,
  model,
  system,
  user,
  maxOutputTokens = 600,
  timeoutMs = 8000,
}: {
  client: GeminiClient
  model: string
  system: string
  user: string
  maxOutputTokens?: number
  timeoutMs?: number
}): Promise<{ text: string; model: string }> {
  const m = client.getGenerativeModel({ model, systemInstruction: system })
  const result = await withTimeout(
    m.generateContent({
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
    }),
    timeoutMs
  )
  const resp = await (result as any).response
  const text =
    resp?.text?.() ?? resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return { text: text || '', model }
}

async function callGeminiText({
  client,
  model,
  system,
  user,
  maxOutputTokens = 300,
  timeoutMs = 8000,
}: {
  client: GeminiClient
  model: string
  system: string
  user: string
  maxOutputTokens?: number
  timeoutMs?: number
}): Promise<{ text: string; model: string }> {
  const m = client.getGenerativeModel({ model, systemInstruction: system })
  const result = await withTimeout(
    m.generateContent({
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens,
      },
    }),
    timeoutMs
  )
  const resp = await (result as any).response
  const text =
    resp?.text?.() ?? resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return { text: text || '', model }
}

export class GeminiProvider implements AIProvider {
  name: 'gemini' = 'gemini'

  async health(): Promise<HealthStatus> {
    const start = Date.now()
    const client = await getGemini()
    if (!client) {
      return { provider: 'gemini', ok: false, error: 'sdk_or_api_key_missing' }
    }
    try {
      const m = client.getGenerativeModel({
        model: MODEL_FAST,
        systemInstruction: 'pong',
      })
      await withTimeout(
        m.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        }),
        2000
      )
      return {
        provider: 'gemini',
        ok: true,
        model: MODEL_FAST,
        latencyMs: Date.now() - start,
      }
    } catch (e: any) {
      return {
        provider: 'gemini',
        ok: false,
        model: MODEL_FAST,
        latencyMs: Date.now() - start,
        error: e?.message ?? 'unknown_error',
      }
    }
  }

  async scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getGemini()
    if (!client) throw new Error('gemini_unavailable')

    const { system, user } = buildSpeakingPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      includeRationale: input.includeRationale,
    })

    let out
    try {
      out = await callGeminiJSON({
        client,
        model: MODEL_FAST,
        system,
        user,
        maxOutputTokens: 500,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    } catch {
      out = await callGeminiJSON({
        client,
        model: MODEL_QUALITY,
        system,
        user,
        maxOutputTokens: 500,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    }

    const parsed = safeParseSpeakingJSON(out.text)
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
        provider: 'gemini',
        model: out.model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreWriting(input: WritingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getGemini()
    if (!client) throw new Error('gemini_unavailable')

    const { system, user } = buildWritingPrompt({
      questionType: input.questionType,
      text: input.text,
      prompt: input.prompt,
      includeRationale: input.includeRationale,
    })

    let out
    try {
      out = await callGeminiJSON({
        client,
        model: MODEL_FAST,
        system,
        user,
        maxOutputTokens: 600,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    } catch {
      out = await callGeminiJSON({
        client,
        model: MODEL_QUALITY,
        system,
        user,
        maxOutputTokens: 600,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    }

    const parsed = safeParseWritingJSON(out.text)
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
        provider: 'gemini',
        model: out.model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreReading(input: ReadingInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getGemini()
    if (!client) throw new Error('gemini_unavailable')

    const { system, user } = buildReadingExplanationPrompt({
      questionType: input.questionType,
      question: input.question ?? '',
      options: input.options ?? [],
      correct: input.correct ?? [],
      userSelected: input.userSelected ?? [],
    })

    let out
    try {
      out = await callGeminiText({
        client,
        model: MODEL_FAST,
        system,
        user,
        maxOutputTokens: 250,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    } catch {
      out = await callGeminiText({
        client,
        model: MODEL_QUALITY,
        system,
        user,
        maxOutputTokens: 250,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    }

    let rationale = ''
    try {
      const obj = extractJSON<{ rationale?: string }>(out.text)
      rationale = obj?.rationale ?? ''
    } catch {
      rationale = trimTo(out.text, 1000)
    }

    return {
      overall: undefined,
      subscores: {},
      rationale,
      meta: {
        provider: 'gemini',
        model: out.model,
        latencyMs: Date.now() - t0,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async scoreListening(input: ListeningInput): Promise<ProviderRawScore> {
    const t0 = Date.now()
    const client = await getGemini()
    if (!client) throw new Error('gemini_unavailable')

    const { system, user } = buildListeningExplanationPrompt({
      questionType: input.questionType,
      transcript: input.transcript,
      targetText: input.targetText,
      userText: input.userText,
    })

    let out
    try {
      out = await callGeminiText({
        client,
        model: MODEL_FAST,
        system,
        user,
        maxOutputTokens: 250,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    } catch {
      out = await callGeminiText({
        client,
        model: MODEL_QUALITY,
        system,
        user,
        maxOutputTokens: 250,
        timeoutMs: input.timeoutMs ?? getDefaultTimeout(),
      })
    }

    let rationale = ''
    try {
      const obj = extractJSON<{ rationale?: string }>(out.text)
      rationale = obj?.rationale ?? ''
    } catch {
      rationale = trimTo(out.text, 1000)
    }

    return {
      overall: undefined,
      subscores: {},
      rationale,
      meta: {
        provider: 'gemini',
        model: out.model,
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

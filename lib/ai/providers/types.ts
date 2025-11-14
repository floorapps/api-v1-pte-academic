import 'server-only'
import type { ProviderRawScore } from '@/lib/pte/scoring-normalize'
import { TestSection } from '@/lib/pte/types'

export type { ProviderRawScore }

export type HealthStatus = {
  provider: 'openai' | 'gemini' | 'vercel'
  ok: boolean
  model?: string
  error?: string
  latencyMs?: number
}

export type SpeakingInput = {
  section: TestSection.SPEAKING
  questionType: string
  transcript: string
  referenceText?: string
  includeRationale?: boolean
  timeoutMs?: number
}

export type WritingInput = {
  section: TestSection.WRITING
  questionType: string
  text: string
  prompt?: string
  includeRationale?: boolean
  timeoutMs?: number
}

export type ReadingInput = {
  section: TestSection.READING
  questionType: string
  question?: string
  options?: string[]
  correct?: string[] // for explanation context
  userSelected?: string[] // for explanation context
  includeRationale?: boolean
  timeoutMs?: number
}

export type ListeningInput = {
  section: TestSection.LISTENING
  questionType: string
  transcript?: string // optional reference transcript
  targetText?: string // for WFD explanation
  userText?: string // for WFD explanation
  includeRationale?: boolean
  timeoutMs?: number
}

export type AnyProviderInput =
  | SpeakingInput
  | WritingInput
  | ReadingInput
  | ListeningInput

export interface AIProvider {
  name: 'openai' | 'gemini' | 'vercel'
  scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore>
  scoreWriting(input: WritingInput): Promise<ProviderRawScore>
  scoreReading(input: ReadingInput): Promise<ProviderRawScore>
  scoreListening(input: ListeningInput): Promise<ProviderRawScore>
  health(): Promise<HealthStatus>
}

/**
 * Utility: enforce timeout on a promise-returning function.
 * The wrapped function receives no AbortSignal to keep provider implementations simple.
 */
export async function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  onTimeout?: () => void
): Promise<T> {
  if (!ms || ms <= 0 || !Number.isFinite(ms)) return p
  let timeoutHandle: any
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      try {
        onTimeout?.()
      } catch {}
      reject(new Error(`timeout_after_${ms}ms`))
    }, ms)
  })
  try {
    const res = await Promise.race([p, timeoutPromise])
    // @ts-ignore
    return res
  } finally {
    clearTimeout(timeoutHandle)
  }
}

/**
 * Utility: extract JSON object from raw LLM text, tolerant to code fences.
 */
export function extractJSON<T = any>(text: string): T {
  const trimmed = (text || '').trim()
  // If message contains codefence, try to extract inside the first json block
  const fence = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(trimmed)
  const candidate = fence ? fence[1] : trimmed
  // Attempt to find first { ... } object
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  const body =
    firstBrace !== -1 && lastBrace !== -1
      ? candidate.slice(firstBrace, lastBrace + 1)
      : candidate
  return JSON.parse(body) as T
}

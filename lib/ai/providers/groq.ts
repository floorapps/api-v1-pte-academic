import 'server-only'
import {
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
} from '@/lib/pte/scoring-normalize'
import {
  buildListeningExplanationPrompt,
  buildReadingExplanationPrompt,
  buildSpeakingPrompt,
  buildWritingPrompt,
  getDefaultWeights,
} from '@/lib/pte/scoring-rubrics'
import { TestSection } from '@/lib/pte/types'
import { generateObject, generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'

type GroqClient = ReturnType<typeof groq>

function getGroqClient(): GroqClient | null {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  return groq(apiKey)
}

const MODEL_FAST = 'llama-3.1-8b-instant'
const MODEL_QUALITY = 'llama-3.1-70b-versatile'

/**
 * Groq AI Provider Implementation
 * Uses Llama models for fast, efficient scoring
 */
export class GroqProvider implements AIProvider {
  name: 'groq' = 'groq'

  async health(): Promise<HealthStatus> {
    if (!process.env.GROQ_API_KEY) {
      return { status: 'unavailable', reason: 'GROQ_API_KEY not set' }
    }
    // Lightweight health check - just verify API key is configured
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10) {
        return { status: 'available' }
      }
      return { status: 'unavailable', reason: 'GROQ_API_KEY appears invalid' }
    } catch (e: any) {
      return { status: 'error', reason: e.message }
    }
  }

  async scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore> {
    const client = getGroqClient()
    if (!client) throw new Error('Groq client not available')

    const prompt = buildSpeakingPrompt(input)
    const schema = z.object({
      content: z.number().min(0).max(90),
      pronunciation: z.number().min(0).max(90),
      fluency: z.number().min(0).max(90),
      overall: z.number().min(0).max(90),
      rationale: z.string(),
      suggestions: z.array(z.string()),
      transcript_accuracy: z.number().min(0).max(100).optional(),
    })

    const result = await generateObject({
      model: client(MODEL_QUALITY),
      prompt,
      schema,
      temperature: 0.1,
      maxTokens: 1000,
    })

    const { content, pronunciation, fluency, overall, rationale, suggestions, transcript_accuracy } = result.object

    return {
      overall: clampTo90(overall),
      subscores: {
        content: clampTo90(content),
        pronunciation: clampTo90(pronunciation),
        fluency: clampTo90(fluency),
        ...(transcript_accuracy && { transcript_accuracy }),
      },
      rationale,
      suggestions,
      meta: {
        provider: 'groq',
        model: MODEL_QUALITY,
        latencyMs: result.response?.headers?.get('x-response-time') 
          ? parseInt(result.response.headers.get('x-response-time')!) 
          : undefined,
      },
    }
  }

  async scoreWriting(input: WritingInput): Promise<ProviderRawScore> {
    const client = getGroqClient()
    if (!client) throw new Error('Groq client not available')

    const prompt = buildWritingPrompt(input)
    const schema = z.object({
      content: z.number().min(0).max(90),
      form: z.number().min(0).max(90),
      grammar: z.number().min(0).max(90),
      vocabulary: z.number().min(0).max(90),
      overall: z.number().min(0).max(90),
      rationale: z.string(),
      suggestions: z.array(z.string()),
      word_count: z.number().optional(),
    })

    const result = await generateObject({
      model: client(MODEL_QUALITY),
      prompt,
      schema,
      temperature: 0.1,
      maxTokens: 1000,
    })

    const { content, form, grammar, vocabulary, overall, rationale, suggestions, word_count } = result.object

    return {
      overall: clampTo90(overall),
      subscores: {
        content: clampTo90(content),
        form: clampTo90(form),
        grammar: clampTo90(grammar),
        vocabulary: clampTo90(vocabulary),
        ...(word_count && { word_count }),
      },
      rationale,
      suggestions,
      meta: {
        provider: 'groq',
        model: MODEL_QUALITY,
      },
    }
  }

  async scoreReading(input: ReadingInput): Promise<ProviderRawScore> {
    const client = getGroqClient()
    if (!client) throw new Error('Groq client not available')

    const prompt = buildReadingExplanationPrompt(input)
    const schema = z.object({
      explanation: z.string(),
      confidence: z.number().min(0).max(100),
      key_points: z.array(z.string()),
    })

    const result = await generateObject({
      model: client(MODEL_FAST),
      prompt,
      schema,
      temperature: 0.2,
      maxTokens: 500,
    })

    const { explanation, confidence, key_points } = result.object

    return {
      rationale: explanation,
      meta: {
        provider: 'groq',
        model: MODEL_FAST,
        confidence,
        key_points,
      },
    }
  }

  async scoreListening(input: ListeningInput): Promise<ProviderRawScore> {
    const client = getGroqClient()
    if (!client) throw new Error('Groq client not available')

    const prompt = buildListeningExplanationPrompt(input)
    const schema = z.object({
      explanation: z.string(),
      confidence: z.number().min(0).max(100),
      key_points: z.array(z.string()),
    })

    const result = await generateObject({
      model: client(MODEL_FAST),
      prompt,
      schema,
      temperature: 0.2,
      maxTokens: 500,
    })

    const { explanation, confidence, key_points } = result.object

    return {
      rationale: explanation,
      meta: {
        provider: 'groq',
        model: MODEL_FAST,
        confidence,
        key_points,
      },
    }
  }
}
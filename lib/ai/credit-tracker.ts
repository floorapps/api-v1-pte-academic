import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { aiCreditUsage, type NewAICreditUsage } from '@/lib/db/schema'

/**
 * AI Provider pricing (per 1M tokens or per minute for audio)
 * Updated as of January 2025
 */
const PRICING = {
  openai: {
    'gpt-4o': { input: 2.5, output: 10.0 }, // per 1M tokens
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4o-realtime-preview': { audio: 0.06, input: 5.0, output: 20.0 }, // per minute audio, per 1M tokens text
    'whisper-1': { audio: 0.006 }, // per minute
  },
  gemini: {
    'gemini-1.5-pro': { input: 1.25, output: 5.0 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  },
  vercel: {
    default: { input: 0.0, output: 0.0 }, // Vercel AI SDK is a wrapper
  },
}

interface TrackUsageParams {
  userId: string
  usageType:
    | 'transcription'
    | 'scoring'
    | 'feedback'
    | 'realtime_voice'
    | 'text_generation'
    | 'other'
  provider: 'openai' | 'gemini' | 'vercel' | string
  model?: string
  inputTokens?: number
  outputTokens?: number
  audioSeconds?: number
  sessionId?: string
  attemptId?: string
  attemptType?: 'speaking' | 'writing' | 'reading' | 'listening'
  metadata?: Record<string, any>
}

/**
 * Track AI credit usage and calculate cost
 */
export async function trackAIUsage(params: TrackUsageParams) {
  const {
    userId,
    usageType,
    provider,
    model,
    inputTokens = 0,
    outputTokens = 0,
    audioSeconds = 0,
    sessionId,
    attemptId,
    attemptType,
    metadata,
  } = params

  const totalTokens = inputTokens + outputTokens

  // Calculate cost
  let cost = 0
  if (provider in PRICING) {
    const providerPricing = PRICING[provider as keyof typeof PRICING]
    const modelPricing = model
      ? (providerPricing as any)[model]
      : (providerPricing as any).default

    if (modelPricing) {
      // Calculate token cost
      if (inputTokens > 0 && modelPricing.input) {
        cost += (inputTokens / 1_000_000) * modelPricing.input
      }
      if (outputTokens > 0 && modelPricing.output) {
        cost += (outputTokens / 1_000_000) * modelPricing.output
      }
      // Calculate audio cost (per minute)
      if (audioSeconds > 0 && modelPricing.audio) {
        cost += (audioSeconds / 60) * modelPricing.audio
      }
    }
  }

  try {
    await db.insert(aiCreditUsage).values({
      userId,
      usageType,
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      audioSeconds: audioSeconds.toString(),
      cost: cost.toFixed(6),
      sessionId,
      attemptId,
      attemptType,
      metadata: metadata as any,
    })

    return { cost, totalTokens }
  } catch (error) {
    console.error('Failed to track AI usage:', error)
    return { cost: 0, totalTokens: 0 }
  }
}

/**
 * Get total AI usage for a user
 */
export async function getUserAIUsage(
  userId: string,
  options?: {
    startDate?: Date
    endDate?: Date
    usageType?: string
  }
) {
  const { startDate, endDate, usageType } = options || {}

  // This would need SQL aggregation - simplified version:
  const usage = await db
    .select()
    .from(aiCreditUsage)
    .where(eq(aiCreditUsage.userId, userId))
    .execute()

  const totalCost = usage.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  )
  const totalTokens = usage.reduce(
    (sum, record) => sum + Number(record.totalTokens || 0),
    0
  )

  return {
    totalCost,
    totalTokens,
    totalRecords: usage.length,
    usage,
  }
}

/**
 * Track OpenAI Realtime API usage
 */
export async function trackRealtimeUsage(params: {
  userId: string
  sessionId: string
  audioSeconds: number
  inputTokens?: number
  outputTokens?: number
  metadata?: Record<string, any>
}) {
  return trackAIUsage({
    ...params,
    usageType: 'realtime_voice',
    provider: 'openai',
    model: 'gpt-4o-realtime-preview',
  })
}

/**
 * Track transcription usage (Whisper)
 */
export async function trackTranscriptionUsage(params: {
  userId: string
  audioSeconds: number
  attemptId?: string
  attemptType?: 'speaking' | 'writing' | 'reading' | 'listening'
  metadata?: Record<string, any>
}) {
  return trackAIUsage({
    ...params,
    usageType: 'transcription',
    provider: 'openai',
    model: 'whisper-1',
  })
}

/**
 * Track scoring usage
 */
export async function trackScoringUsage(params: {
  userId: string
  provider: string
  model?: string
  inputTokens: number
  outputTokens: number
  attemptId?: string
  attemptType?: 'speaking' | 'writing' | 'reading' | 'listening'
  metadata?: Record<string, any>
}) {
  return trackAIUsage({
    ...params,
    usageType: 'scoring',
  })
}

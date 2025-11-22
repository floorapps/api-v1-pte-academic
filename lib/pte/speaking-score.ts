import 'server-only'
import { scoreSpeakingAction } from '@/lib/actions/score'
import {
  QuestionType,
  TestSection,
  type SpeakingScore,
  type SpeakingType,
} from '@/lib/pte/types'

/**
 * Score a speaking attempt using the production-grade AI orchestrator.
 * Uses official PTE Academic 0-5 scoring scale for Content, Pronunciation, and Fluency.
 * Falls back to heuristics if AI scoring fails.
 */
export async function scoreAttempt(params: {
  type: SpeakingType
  question: any
  transcript: string
  audioUrl: string
  durationMs: number
}): Promise<
  SpeakingScore & { feedback?: any; meta?: Record<string, unknown> }
> {
  const { type, transcript = '', durationMs, question } = params

  const words = tokenizeWords(transcript)
  const wordCount = words.length
  const minutes = Math.max(durationMs / 60000, 0.001)
  const wordsPerMinute = Number((wordCount / minutes).toFixed(2))
  const fillerRate = Number(computeFillerRate(words).toFixed(3))

  const meta: Record<string, unknown> = {
    words: wordCount,
    wordsPerMinute,
    fillerRate,
  }

  // Try AI scoring via server action
  try {
    const aiResult = await scoreSpeakingAction({
      type,
      transcript,
      promptText: question?.promptText || undefined,
      situation: type === 'respond_to_a_situation' ? question?.promptText : undefined,
    })

    meta.ai = {
      provider: 'google-genai', // Hardcoded as we're using Google directly now
      model: 'gemini-1.5-pro-latest',
    }

    // Convert subscores (0-90) to PTE 0-5 scale
    const pronunciation = clamp0to5(
      convertTo5Scale(aiResult.subscores.pronunciation ?? roughPronunciation(wordsPerMinute, fillerRate))
    )
    const fluency = clamp0to5(
      convertTo5Scale(aiResult.subscores.fluency ?? roughFluency(wordsPerMinute, fillerRate))
    )
    const content = clamp0to5(
      convertTo5Scale(aiResult.subscores.content ?? roughContent(wordCount, durationMs, type))
    )

    // Use overall score or calculate from subscores
    const total = aiResult.overall || calculateTotalScore(content, pronunciation, fluency)

    const rubric = {
      contentNotes: aiResult.rationale || 'AI scoring completed',
      fluencyNotes: `Fluency score: ${fluency}/5`,
      pronunciationNotes: `Pronunciation score: ${pronunciation}/5`,
      details: {
        provider: 'google-genai',
        rationale: aiResult.rationale,
      },
    }

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric,
      feedback: {
        rationale: aiResult.rationale,
        subscores: aiResult.subscores,
        suggestions: aiResult.suggestions,
      },
      meta,
    }
  } catch (err) {
    // Fall back to heuristics
    meta.aiError = err instanceof Error ? err.message : 'ai_scoring_failed'

    const pronunciation = clamp0to5(
      convertTo5Scale(roughPronunciation(wordsPerMinute, fillerRate))
    )
    const fluency = clamp0to5(
      convertTo5Scale(roughFluency(wordsPerMinute, fillerRate))
    )
    const content = clamp0to5(
      convertTo5Scale(roughContent(wordCount, durationMs, type))
    )
    const total = calculateTotalScore(content, pronunciation, fluency)

    return {
      content,
      pronunciation,
      fluency,
      total,
      rubric: {
        details: { note: 'Heuristic scoring (AI unavailable).' },
      },
      meta,
    }
  }
}

/** Helpers **/

function tokenizeWords(text: string): string[] {
  if (!text) return []
  // Normalize and split on non-letter sequences
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\u00C0-\u024F']+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const FILLERS = new Set([
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you',
  'know',
  'sort',
  'of',
  'kind',
  'kinda',
  'sorta',
  'hmm',
  'mmm',
  'uhh',
  'umm',
])

function computeFillerRate(words: string[]): number {
  const wc = words.length || 1
  let fillerCount = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (FILLERS.has(w)) fillerCount++
    // treat "you know" as a filler phrase
    if (w === 'you' && words[i + 1] === 'know') fillerCount++
    if (w === 'sort' && words[i + 1] === 'of') fillerCount++
    if (w === 'kind' && words[i + 1] === 'of') fillerCount++
  }
  return fillerCount / wc
}

function roughPronunciation(wpm: number, fillerRate: number): number {
  // Favor moderate WPM and low fillers
  let score = 70
  if (wpm < 70) score -= 10
  if (wpm > 170) score -= 10
  score -= Math.min(20, Math.round(fillerRate * 100))
  return score
}

function roughFluency(wpm: number, fillerRate: number): number {
  let score = 72
  if (wpm < 80) score -= 12
  if (wpm > 180) score -= 8
  score -= Math.min(25, Math.round(fillerRate * 120))
  return score
}

function roughContent(wordCount: number, durationMs: number, type: SpeakingType): number {
  const minutes = Math.max(durationMs / 60000, 0.001)
  const density = wordCount / minutes

  // For describe_image, content is based on elements described
  // Heuristic: more words generally means more elements described
  if (type === 'describe_image') {
    // Target: 12+ key items described for full score
    // Rough estimate: ~3-5 words per item = 36-60 words minimum
    if (wordCount === 0 || durationMs < 500) return 20
    if (wordCount >= 60 && density >= 90 && density <= 160) return 85 // Likely 12+ items
    if (wordCount >= 45 && density >= 80) return 75 // Likely 9-11 items
    if (wordCount >= 30) return 65 // Likely 6-8 items
    if (wordCount >= 20) return 55 // Likely 4-5 items
    return 40
  }

  // General heuristic for other speaking types
  if (wordCount === 0 || durationMs < 500) return 20
  let score = 68
  if (density < 80) score -= 12
  if (density > 190) score -= 10
  return score
}

/**
 * Convert 0-90 scale to official PTE Academic 0-5 scale
 * 0-90 maps to 0-5 where:
 * 81-90 = 5 (native-like)
 * 61-80 = 4 (very good)
 * 41-60 = 3 (good)
 * 21-40 = 2 (limited)
 * 1-20 = 1 (very limited)
 * 0 = 0 (no attempt/unintelligible)
 */
function convertTo5Scale(score90: number): number {
  if (score90 >= 81) return 5
  if (score90 >= 61) return 4
  if (score90 >= 41) return 3
  if (score90 >= 21) return 2
  if (score90 >= 1) return 1
  return 0
}

/**
 * Calculate total score from 0-5 criteria scores
 * Converts back to 0-90 scale for overall enabling skills score
 * Uses PTE Academic weightings: Content 40%, Pronunciation 30%, Fluency 30%
 */
function calculateTotalScore(content: number, pronunciation: number, fluency: number): number {
  // Convert 0-5 scores to 0-90 equivalent for calculation
  const contentScore = (content / 5) * 90
  const pronunciationScore = (pronunciation / 5) * 90
  const fluencyScore = (fluency / 5) * 90

  // Apply PTE weightings
  const weighted = (contentScore * 0.4) + (pronunciationScore * 0.3) + (fluencyScore * 0.3)

  return Math.round(Math.max(0, Math.min(90, weighted)))
}

function clamp0to90(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(90, Math.round(n)))
}

function clamp0to5(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, Math.round(n)))
}

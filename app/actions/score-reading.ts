'use server'

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { clampTo90 } from '@/lib/pte/scoring-normalize'

export type ScoreReadingInput = {
  type: string
  userResponse: string
  promptText?: string
  options?: unknown
  answerKey?: unknown
}

export type ScoreReadingOutput = {
  overall: number
  subscores: {
    accuracy: number
    comprehension: number
    vocabulary: number
  }
  mistakes: string[]
  rationale: string
  suggestions: string[]
}

export async function scoreReading(input: ScoreReadingInput): Promise<ScoreReadingOutput> {
  const schema = z.object({
    accuracy: z.number().min(0).max(90),
    comprehension: z.number().min(0).max(90),
    vocabulary: z.number().min(0).max(90),
    overall: z.number().min(0).max(90),
    mistakes: z.array(z.string()),
    rationale: z.string(),
    suggestions: z.array(z.string()),
  })

  const prompt = `You are an expert PTE Academic examiner.
Task: ${input.type}
Prompt: ${input.promptText ?? ''}
Options: ${typeof input.options === 'string' ? input.options : JSON.stringify(input.options ?? {})}
AnswerKey: ${typeof input.answerKey === 'string' ? input.answerKey : JSON.stringify(input.answerKey ?? {})}
UserResponse: ${input.userResponse}
Score on 0-90: accuracy, comprehension, vocabulary. Provide overall, mistakes, rationale, suggestions.`

  const result = await generateObject({
    model: google('models/gemini-1.5-flash-latest'),
    prompt,
    schema,
    temperature: 0.1,
  })

  const o = result.object
  return {
    overall: clampTo90(o.overall),
    subscores: {
      accuracy: clampTo90(o.accuracy),
      comprehension: clampTo90(o.comprehension),
      vocabulary: clampTo90(o.vocabulary),
    },
    mistakes: Array.isArray(o.mistakes) ? o.mistakes : [],
    rationale: String(o.rationale || ''),
    suggestions: Array.isArray(o.suggestions) ? o.suggestions : [],
  }
}
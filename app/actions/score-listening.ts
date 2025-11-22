'use server'

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { clampTo90 } from '@/lib/pte/scoring-normalize'

export type ScoreListeningInput = {
  type: string
  transcript: string
  promptText?: string
}

export type ScoreListeningOutput = {
  overall: number
  subscores: {
    accuracy: number
    comprehension: number
  }
  rationale: string
  suggestions: string[]
}

export async function scoreListening(input: ScoreListeningInput): Promise<ScoreListeningOutput> {
  const schema = z.object({
    accuracy: z.number().min(0).max(90),
    comprehension: z.number().min(0).max(90),
    overall: z.number().min(0).max(90),
    rationale: z.string(),
    suggestions: z.array(z.string()),
  })

  const prompt = `You are an expert PTE Academic examiner.
Task: ${input.type}
Prompt: ${input.promptText ?? ''}
Transcript: ${input.transcript}
Score on 0-90: accuracy and comprehension. Provide overall, rationale, suggestions.`

  const result = await generateObject({
    model: google('models/gemini-1.5-pro-latest'),
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
    },
    rationale: String(o.rationale || ''),
    suggestions: Array.isArray(o.suggestions) ? o.suggestions : [],
  }
}
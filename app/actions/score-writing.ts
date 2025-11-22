'use server'

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const scoreSchema = z.object({
  scores: z.object({
    content: z.number(),
    grammar: z.number(),
    vocabulary: z.number(),
    spelling: z.number(),
    total: z.number(),
  }),
  feedback: z.string(),
  detected_errors: z.array(z.string()),
})

export async function scoreEssay(essay: string, promptTopic: string) {
  const result = await generateObject({
    model: google('models/gemini-1.5-flash-latest'),
    schema: scoreSchema,
    prompt: `
      Act as a strict PTE Academic exam scorer.
      Analyze the following essay based on the topic: "${promptTopic}".

      Essay: "${essay}"

      Scoring Criteria (PTE Style):
      1. Content: Does it address all parts of the topic? (Mimic LSA: check for semantic relevance).
      2. Formal Requirements: Word count between 200-300 words.
      3. Grammar: Correct sentence structure, tense usage.
      4. Vocabulary: Use of academic words, not basic conversational English.

      Be strict. A "90" is perfect native proficiency. A "10" is illiterate.
    `,
  })

  return result.object
}
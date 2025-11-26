/**
 * AI Orchestrator - Routes scoring requests to appropriate AI provider
 * This is a compatibility layer for existing API routes
 * New code should use Server Actions directly (app/actions/score-*.ts)
 */

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export interface ScoreInput {
  type: string
  userResponse?: string
  transcript?: string
  audioUrl?: string
  promptText?: string
  options?: unknown
  answerKey?: unknown
}

export interface ScoreOutput {
  overall: number
  subscores: Record<string, number>
  mistakes?: string[]
  rationale?: string
  suggestions?: string[]
}

/**
 * Score using the appropriate orchestration logic
 * For production, migrate to app/actions/score-*.ts
 * 
 * Supports both old API format (with section param) and new format
 */
export async function scoreWithOrchestrator(
  input: ScoreInput & {
    section?: 'speaking' | 'reading' | 'writing' | 'listening'
    questionType?: string
    payload?: Record<string, unknown>
    includeRationale?: boolean
    timeoutMs?: number
  },
  section?: 'speaking' | 'reading' | 'writing' | 'listening'
): Promise<ScoreOutput> {
  // Determine section (prefer param, fallback to input property)
  const resolvedSection = section || input.section || 'reading'

  // Handle old payload format
  if (input.payload) {
    const payload = input.payload as Record<string, unknown>
    input = {
      ...input,
      type: input.questionType || input.type || 'unknown',
      promptText: (payload.question as string) || input.promptText,
      options: payload.options || input.options,
      answerKey: payload.correct || input.answerKey,
    }
  }

  // Validate API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured')
  }

  // Route to appropriate schema based on section
  let model = 'models/gemini-1.5-flash-latest'
  let prompt = generatePrompt(resolvedSection, input)
  let schema = getScoreSchema(resolvedSection)

  // Use pro model for speaking/listening (audio tasks)
  if (resolvedSection === 'speaking' || resolvedSection === 'listening') {
    model = 'models/gemini-1.5-pro-latest'
  }

  try {
    const result = await generateObject({
      model: google(model),
      prompt,
      schema,
      temperature: 0.1,
    })

    return {
      overall: result.object.overall || 0,
      subscores: result.object.subscores || {},
      mistakes: result.object.mistakes,
      rationale: result.object.rationale,
      suggestions: result.object.suggestions,
    }
  } catch (error) {
    console.error('[scoreWithOrchestrator] Error:', { section: resolvedSection, error })
    throw new Error(`Failed to score ${resolvedSection} attempt: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

function generatePrompt(
  section: 'speaking' | 'reading' | 'writing' | 'listening',
  input: ScoreInput
): string {
  const base = `You are an expert PTE Academic examiner. Score the user's response.`

  switch (section) {
    case 'reading':
      return `${base}
Task Type: ${input.type}
Prompt: ${input.promptText || ''}
Options: ${JSON.stringify(input.options || {})}
Correct Answer(s): ${JSON.stringify(input.answerKey || {})}
User Response: ${input.userResponse || ''}

Score on 0-90 scale. Provide accuracy, comprehension, vocabulary, overall score, mistakes found, rationale, and suggestions.`

    case 'writing':
      return `${base}
Prompt: ${input.promptText || ''}
User Essay: ${input.userResponse || ''}

Score on 0-90 scale. Evaluate content, grammar, vocabulary, spelling. Provide overall score, subscores, mistakes, rationale, and suggestions.`

    case 'speaking':
      return `${base}
Transcript: ${input.transcript || ''}
Prompt: ${input.promptText || ''}

Score on 0-90 scale. Evaluate content, pronunciation, fluency. Provide overall score, subscores, mistakes, rationale, and suggestions.`

    case 'listening':
      return `${base}
Transcript: ${input.transcript || ''}
Question Type: ${input.type}
Options: ${JSON.stringify(input.options || {})}
Correct Answer(s): ${JSON.stringify(input.answerKey || {})}

Score on 0-90 scale. Provide accuracy, comprehension, overall, mistakes, rationale, and suggestions.`

    default:
      return `${base} User response: ${input.userResponse || ''}`
  }
}

function getScoreSchema(section: string) {
  const baseScore = {
    overall: z.number().min(0).max(90),
    mistakes: z.array(z.string()).optional(),
    rationale: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
  }

  switch (section) {
    case 'reading':
      return z.object({
        ...baseScore,
        subscores: z.object({
          accuracy: z.number().min(0).max(90),
          comprehension: z.number().min(0).max(90),
          vocabulary: z.number().min(0).max(90),
        }),
      })

    case 'writing':
      return z.object({
        ...baseScore,
        subscores: z.object({
          content: z.number().min(0).max(90),
          grammar: z.number().min(0).max(90),
          vocabulary: z.number().min(0).max(90),
          spelling: z.number().min(0).max(90),
        }),
      })

    case 'speaking':
      return z.object({
        ...baseScore,
        subscores: z.object({
          content: z.number().min(0).max(90),
          pronunciation: z.number().min(0).max(90),
          fluency: z.number().min(0).max(90),
        }),
      })

    case 'listening':
      return z.object({
        ...baseScore,
        subscores: z.object({
          accuracy: z.number().min(0).max(90),
          comprehension: z.number().min(0).max(90),
        }),
      })

    default:
      return z.object({ ...baseScore, subscores: z.object({}).optional() })
  }
}

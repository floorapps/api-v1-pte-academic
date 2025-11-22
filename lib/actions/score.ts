'use server'

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { clampTo90 } from '@/lib/pte/scoring-normalize'

const MODEL_QUALITY = 'gemini-1.5-pro-latest'

export type ScoringInput = {
    type: string
    transcript: string
    promptText?: string
    situation?: string
}

export type ScoringOutput = {
    overall: number
    subscores: {
        content: number
        pronunciation: number
        fluency: number
        appropriateness?: number
        politeness?: number
        relevance?: number
    }
    rationale: string
    suggestions: string[]
}

export async function scoreSpeakingAction(input: ScoringInput): Promise<ScoringOutput> {
    const { type, transcript, promptText, situation } = input

    if (type === 'respond_to_a_situation') {
        return scoreDialog({ transcript, situation: situation || promptText || '' })
    }

    return scoreStandardSpeaking({ type, transcript, promptText })
}

async function scoreDialog(input: { transcript: string; situation: string }): Promise<ScoringOutput> {
    const prompt = `
    You are an expert PTE Academic examiner. Evaluate the following response to a "Respond to a Situation" question.
    
    Situation: "${input.situation}"
    User Response: "${input.transcript}"
    
    Score the response on:
    1. Appropriateness (0-90): Is the tone and register appropriate for the situation?
    2. Politeness (0-90): Is the language polite and respectful?
    3. Relevance (0-90): Does the response directly address the situation and provide a solution/response?
    
    Provide an overall score (0-90) based on these factors.
    Also provide a rationale and suggestions for improvement.
  `

    const schema = z.object({
        appropriateness: z.number().min(0).max(90),
        politeness: z.number().min(0).max(90),
        relevance: z.number().min(0).max(90),
        overall: z.number().min(0).max(90),
        rationale: z.string(),
        suggestions: z.array(z.string()),
    })

    const result = await generateObject({
        model: google(MODEL_QUALITY),
        prompt,
        schema,
        temperature: 0.1,

    })

    const { appropriateness, politeness, relevance, overall, rationale, suggestions } = result.object

    return {
        overall: clampTo90(overall),
        subscores: {
            content: clampTo90(relevance),
            pronunciation: clampTo90(appropriateness),
            fluency: clampTo90(politeness),
            appropriateness: clampTo90(appropriateness),
            politeness: clampTo90(politeness),
            relevance: clampTo90(relevance),
        },
        rationale,
        suggestions,
    }
}

async function scoreStandardSpeaking(input: { type: string; transcript: string; promptText?: string }): Promise<ScoringOutput> {
    const prompt = `
    You are an expert PTE Academic examiner. Evaluate the following speaking attempt.
    
    Task Type: ${input.type}
    ${input.promptText ? `Prompt/Reference Text: "${input.promptText}"` : ''}
    User Transcript: "${input.transcript}"
    
    Score the response on PTE Academic criteria (0-90 scale):
    1. Content: Does it cover the key points?
    2. Pronunciation: Is it intelligible and native-like?
    3. Fluency: Is it smooth with natural pacing?
    
    Provide an overall score (0-90).
    Also provide a rationale and suggestions for improvement.
  `

    const schema = z.object({
        content: z.number().min(0).max(90),
        pronunciation: z.number().min(0).max(90),
        fluency: z.number().min(0).max(90),
        overall: z.number().min(0).max(90),
        rationale: z.string(),
        suggestions: z.array(z.string()),
    })

    const result = await generateObject({
        model: google(MODEL_QUALITY),
        prompt,
        schema,
        temperature: 0.1,

    })

    const { content, pronunciation, fluency, overall, rationale, suggestions } = result.object

    return {
        overall: clampTo90(overall),
        subscores: {
            content: clampTo90(content),
            pronunciation: clampTo90(pronunciation),
            fluency: clampTo90(fluency),
        },
        rationale,
        suggestions,
    }
}

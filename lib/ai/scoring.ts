import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// Schema for Read Aloud scoring
const ReadAloudScoreSchema = z.object({
    overall_score: z.number().describe('Overall score from 10-90'),
    breakdown: z.object({
        content: z.number().describe('Content score 10-90: How well the speech matches the text'),
        pronunciation: z.number().describe('Pronunciation score 10-90: Clarity and correctness'),
        fluency: z.number().describe('Fluency score 10-90: Smoothness, pace, and pausing'),
    }),
    feedback: z.string().describe('Concise feedback for the user'),
    suggestions: z.array(z.string()).describe('List of specific actionable improvements'),
    transcript_analysis: z.array(z.object({
        word: z.string(),
        status: z.enum(['correct', 'omitted', 'mispronounced', 'inserted']).describe('Status of the word'),
    })).describe('Word-by-word analysis of the prompt text'),
})

export async function scoreReadAloud(
    promptText: string,
    transcript: string,
    durationMs: number
) {
    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: ReadAloudScoreSchema,
            prompt: `
        You are an expert PTE Academic examiner. Score this "Read Aloud" attempt.
        
        **Task:** Read the text aloud as naturally and clearly as possible.
        
        **Prompt Text:** "${promptText}"
        
        **User Transcript:** "${transcript}"
        
        **Duration:** ${durationMs / 1000} seconds
        
        **Scoring Criteria:**
        1. **Content:** Does the transcript match the prompt? (Penalize omissions/insertions)
        2. **Pronunciation:** (Inferred from transcript accuracy and phonetic likelihood)
        3. **Fluency:** (Inferred from text length vs duration. Target ~120-150 wpm)
        
        Provide a strict score from 10 to 90 (PTE scale).
      `,
        })

        return object
    } catch (error) {
        console.error('Error in scoreReadAloud:', error)
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        // Fallback or rethrow
        throw error // Rethrow original error to see it in the script
    }
}

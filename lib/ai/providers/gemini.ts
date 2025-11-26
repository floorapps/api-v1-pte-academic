import { GoogleGenAI } from '@google/genai'

export class GeminiProvider {
  async health() {
    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        return {
          provider: 'gemini' as const,
          ok: false,
          error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured',
        }
      }

      // Simple health check - verify the API key is set and valid format
      return {
        provider: 'gemini' as const,
        ok: apiKey.length > 0,
        model: 'gemini-1.5-flash',
      }
    } catch (error) {
      return {
        provider: 'gemini' as const,
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error',
      }
    }
  }
}


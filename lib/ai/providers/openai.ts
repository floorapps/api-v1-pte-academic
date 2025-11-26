import OpenAI from 'openai'

export class OpenAIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async health() {
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return {
          provider: 'openai' as const,
          ok: false,
          error: 'OPENAI_API_KEY not configured',
        }
      }

      // Simple health check by verifying the API key works
      const models = await this.client.models.list()
      return {
        provider: 'openai' as const,
        ok: !!models.data.length,
        modelsCount: models.data.length,
      }
    } catch (error) {
      return {
        provider: 'openai' as const,
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error',
      }
    }
  }
}

export class VercelAIProvider {
  async health() {
    try {
      // Vercel AI SDK doesn't have a specific health check
      // Just verify the package is available
      const aiPackage = require('ai')
      return {
        provider: 'vercel' as const,
        ok: !!aiPackage,
        version: aiPackage?.version || 'unknown',
      }
    } catch (error) {
      return {
        provider: 'vercel' as const,
        ok: false,
        error: error instanceof Error ? error.message : 'ai package not available',
      }
    }
  }
}

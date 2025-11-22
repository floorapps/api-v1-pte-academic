import type { RouteEntry } from '@/lib/routes/types'

export const routes: RouteEntry[] = [
  { id: 'ai.speaking.score', path: '/api/ai-scoring/speaking', method: 'POST', builder: 'ai-scoring', handler: 'speaking' },
  { id: 'ai.writing.score', path: '/api/ai-scoring/writing', method: 'POST', builder: 'ai-scoring', handler: 'writing' },
]
import 'server-only'
import { unstable_cache } from 'next/cache'

/**
 * Cache wrapper with automatic tagging and revalidation
 * Usage: const cachedData = await cache(() => fetchData(), ['tag1', 'tag2'], 60);
 */
export function cache<T>(
  fn: () => Promise<T>,
  tags: string[],
  revalidate?: number
): Promise<T> {
  return unstable_cache(fn, tags, {
    revalidate: revalidate || 3600, // Default 1 hour
    tags,
  })()
}

/**
 * Short-term cache (5 minutes) - For frequently changing data
 */
export function cacheShort<T>(
  fn: () => Promise<T>,
  tags: string[]
): Promise<T> {
  return cache(fn, tags, 300)
}

/**
 * Medium-term cache (1 hour) - For moderately stable data
 */
export function cacheMedium<T>(
  fn: () => Promise<T>,
  tags: string[]
): Promise<T> {
  return cache(fn, tags, 3600)
}

/**
 * Long-term cache (24 hours) - For stable data
 */
export function cacheLong<T>(fn: () => Promise<T>, tags: string[]): Promise<T> {
  return cache(fn, tags, 86400)
}

/**
 * Cache tags for different data types
 */
export const CacheTags = {
  // User-related
  USER: 'user',
  USER_PROFILE: 'user-profile',
  USER_SUBSCRIPTION: 'user-subscription',

  // PTE-related
  PTE_TESTS: 'pte-tests',
  PTE_QUESTIONS: 'pte-questions',
  PTE_ATTEMPTS: 'pte-attempts',
  PTE_HISTORY: 'pte-history',

  // Writing questions
  WRITING_QUESTIONS: 'writing-questions',

  // Community-related
  COMMUNITY_POSTS: 'community-posts',
  COMMUNITY_TRENDING: 'community-trending',
  COMMUNITY_CONTRIBUTORS: 'community-contributors',

  // Static content
  TEMPLATES: 'templates',
  VOCAB: 'vocab',
  STUDY_MATERIALS: 'study-materials',
} as const

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, unknown>
): string {
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('_')
  return `${prefix}_${paramStr}`
}

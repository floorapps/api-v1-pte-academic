import { getQuestionsDirectly } from './direct-queries'
import { questionListingCache } from '@/lib/parsers'

type Section = 'speaking' | 'reading' | 'writing' | 'listening'

/**
 * Fetch questions for a listing page (server-side)
 * OPTIMIZED: Uses direct database queries instead of HTTP calls
 * Performance: ~50-100ms faster per request
 *
 * Now uses nuqs for type-safe URL param parsing
 */
export async function fetchListingQuestions(
  section: Section,
  questionType: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  // Parse search params with nuqs - type-safe with defaults
  const { page, pageSize, difficulty, search, isActive } =
    questionListingCache.parse(searchParams)

  // Direct database query - no HTTP overhead
  return await getQuestionsDirectly(section, questionType, {
    page,
    pageSize,
    difficulty,
    search,
    isActive,
  })
}

/**
 * Helper to get current month name
 */
export function getCurrentMonthName(): string {
  return new Date().toLocaleString('default', { month: 'long' })
}

/**
 * Helper to get current month key (lowercase)
 */
export function getCurrentMonthKey(): string {
  return getCurrentMonthName().toLowerCase()
}

/**
 * Filter questions by tag categories with fallback to all questions
 */
export function categorizeQuestions(questions: any[]) {
  const monthKey = getCurrentMonthKey()

  const weekly = questions.filter(
    (q: any) => Array.isArray(q.tags) && q.tags.includes('weekly_prediction')
  )

  const monthly = questions.filter(
    (q: any) =>
      Array.isArray(q.tags) &&
      (q.tags.includes(`prediction_${monthKey}`) ||
        q.tags.includes('monthly_prediction'))
  )

  return {
    all: questions,
    weekly: weekly.length > 0 ? weekly : questions,
    monthly: monthly.length > 0 ? monthly : questions,
  }
}

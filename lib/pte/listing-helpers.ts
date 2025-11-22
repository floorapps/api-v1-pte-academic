import { questionListingCache } from '@/lib/parsers'
import { headers } from 'next/headers'

type Section = 'speaking' | 'reading' | 'writing' | 'listening'

/**
 * Fetch questions for a listing page (server-side)
 * Now uses API calls instead of direct database queries
 */
export async function fetchListingQuestions(
  section: Section,
  questionType: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  const { page, pageSize, difficulty, search, isActive } =
    questionListingCache.parse(searchParams)

  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const base =
    process.env.NEXT_PUBLIC_APP_URL && /^https?:\/\/.+/.test(process.env.NEXT_PUBLIC_APP_URL)
      ? process.env.NEXT_PUBLIC_APP_URL
      : host
        ? `${proto}://${host}`
        : `http://localhost:${process.env.PORT ?? 3000}`
  const url = new URL(`/api/${section}/questions`, base)
  url.searchParams.set('type', questionType)
  url.searchParams.set('page', page.toString())
  url.searchParams.set('pageSize', pageSize.toString())
  if (difficulty) url.searchParams.set('difficulty', difficulty)
  if (search) url.searchParams.set('search', search)
  if (isActive !== undefined) url.searchParams.set('isActive', isActive.toString())

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // This ensures the data is fresh on every request, not cached by Next.js
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch questions from API')
  }

  return response.json()
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

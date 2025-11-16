/**
 * Centralized nuqs parsers for type-safe URL search params
 *
 * Usage:
 * - Client components: Use with useQueryState/useQueryStates
 * - Server components: Use createSearchParamsCache().parse()
 *
 * Benefits:
 * - Type-safe URL params
 * - Automatic validation
 * - Default values
 * - URL sync with state
 */

import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsBoolean,
  createSearchParamsCache,
} from 'nuqs/server'

// ========================================
// Common Parsers
// ========================================

export const paginationParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
}

export const difficultyParser = parseAsStringEnum([
  'Easy',
  'Medium',
  'Hard',
  'All',
] as const).withDefault('All')

export const searchParser = parseAsString.withDefault('')

export const isActiveParser = parseAsBoolean.withDefault(true)

// ========================================
// PTE-specific Parsers
// ========================================

export const pteCategories = [
  'speaking',
  'writing',
  'reading',
  'listening',
] as const
export type PTECategory = (typeof pteCategories)[number]

export const examTypes = ['academic', 'core'] as const
export type ExamType = (typeof examTypes)[number]

export const pteCategoryParser =
  parseAsStringEnum([...pteCategories]).withDefault('reading')

export const examTypeParser =
  parseAsStringEnum([...examTypes]).withDefault('academic')

// ========================================
// Practice Filters
// ========================================

export const practiceFiltersParsers = {
  category: pteCategoryParser,
  type: examTypeParser,
  difficulty: difficultyParser,
  ...paginationParsers,
}

// Cache for server components
export const practiceFiltersCache = createSearchParamsCache(
  practiceFiltersParsers
)

// ========================================
// Question Listing Parsers
// ========================================

export const questionListingParsers = {
  ...paginationParsers,
  difficulty: difficultyParser,
  search: searchParser,
  isActive: isActiveParser,
}

export const questionListingCache = createSearchParamsCache(
  questionListingParsers
)

// ========================================
// Attempt Listing Parsers
// ========================================

export const attemptTypes = [
  'speaking',
  'reading',
  'writing',
  'listening',
] as const
export type AttemptType = (typeof attemptTypes)[number]

export const attemptTypeParsers = {
  type: parseAsStringEnum([...attemptTypes]).withDefault('speaking'),
  ...paginationParsers,
}

export const attemptTypeCache = createSearchParamsCache(attemptTypeParsers)

// ========================================
// Strapi/Blog Parsers
// ========================================

export const blogParsers = {
  ...paginationParsers,
  category: parseAsString,
  tag: parseAsString,
  search: searchParser,
}

export const blogCache = createSearchParamsCache(blogParsers)

export const courseParsers = {
  ...paginationParsers,
  level: parseAsStringEnum(['beginner', 'intermediate', 'advanced']),
  isPremium: parseAsBoolean,
}

export const courseCache = createSearchParamsCache(courseParsers)

// ========================================
// Utility Types
// ========================================

// Extract the parsed type from a parser
export type ParsedParams<T> = {
  [K in keyof T]: T[K] extends { parse: (value: any) => infer R } ? R : never
}

// Example usage in server components:
// const { page, pageSize, difficulty } = questionListingCache.parse(searchParams)
//
// Example usage in client components:
// const [filters, setFilters] = useQueryStates(questionListingParsers)

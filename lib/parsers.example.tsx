/**
 * NUQS USAGE EXAMPLES
 *
 * This file contains examples of how to use nuqs parsers
 * in both client and server components.
 */

// ========================================
// CLIENT COMPONENT EXAMPLE
// ========================================

'use client'

import { useQueryState, useQueryStates } from 'nuqs'
import {
  paginationParsers,
  questionListingParsers,
  practiceFiltersParsers,
} from './parsers'

export function ClientComponentExample() {
  // Example 1: Single query state
  const [page, setPage] = useQueryState('page', paginationParsers.page)

  // Example 2: Multiple query states
  const [filters, setFilters] = useQueryStates(questionListingParsers)

  // Example 3: Practice filters
  const [practiceFilters, setPracticeFilters] = useQueryStates(
    practiceFiltersParsers,
    { history: 'push' } // Use push for navigation
  )

  return (
    <div>
      {/* Single state */}
      <div>
        Current page: {page}
        <button onClick={() => setPage(page + 1)}>Next Page</button>
      </div>

      {/* Multiple states */}
      <div>
        <p>Page: {filters.page}</p>
        <p>Page Size: {filters.pageSize}</p>
        <p>Difficulty: {filters.difficulty}</p>
        <p>Search: {filters.search}</p>

        <button
          onClick={() =>
            setFilters({
              page: 1,
              difficulty: 'Medium',
              search: 'test',
            })
          }
        >
          Apply Filters
        </button>
      </div>

      {/* Practice filters */}
      <div>
        <p>Category: {practiceFilters.category}</p>
        <p>Type: {practiceFilters.type}</p>

        <button
          onClick={() =>
            setPracticeFilters({
              category: 'speaking',
              type: 'academic',
            })
          }
        >
          Switch to Speaking
        </button>
      </div>
    </div>
  )
}

// ========================================
// SERVER COMPONENT EXAMPLE
// ========================================

import {
  questionListingCache,
  practiceFiltersCache,
  blogCache,
} from './parsers'

// Example 1: Question Listing Page (Server Component)
export async function QuestionListingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Parse search params with type safety and defaults
  const { page, pageSize, difficulty, search, isActive } =
    questionListingCache.parse(searchParams)

  // Use parsed params (all are type-safe and validated)
  const questions = await fetchQuestions({
    page, // number (default: 1)
    pageSize, // number (default: 20)
    difficulty, // "Easy" | "Medium" | "Hard" | "All" (default: "All")
    search, // string (default: "")
    isActive, // boolean (default: true)
  })

  return (
    <div>
      <h1>Questions (Page {page})</h1>
      <p>Showing {pageSize} items</p>
      <p>Difficulty: {difficulty}</p>
      {search && <p>Search: {search}</p>}
      {/* Render questions */}
    </div>
  )
}

// Example 2: Practice Page with Filters (Server Component)
export async function PracticePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Parse with practice filters cache
  const { category, type, difficulty, page, pageSize } =
    practiceFiltersCache.parse(searchParams)

  const questions = await fetchPracticeQuestions({
    category, // "speaking" | "writing" | "reading" | "listening"
    type, // "academic" | "core"
    difficulty,
    page,
    pageSize,
  })

  return (
    <div>
      <h1>
        {type} - {category}
      </h1>
      {/* Render questions */}
    </div>
  )
}

// Example 3: Blog Page (Server Component)
export async function BlogPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { page, pageSize, category, tag, search } =
    blogCache.parse(searchParams)

  const posts = await fetchBlogPosts({
    page,
    pageSize,
    category, // string | undefined
    tag, // string | undefined
    search,
  })

  return (
    <div>
      <h1>Blog</h1>
      {category && <p>Category: {category}</p>}
      {tag && <p>Tag: {tag}</p>}
      {/* Render posts */}
    </div>
  )
}

// ========================================
// BENEFITS OF USING NUQS
// ========================================

/*
✅ Type Safety
- Automatic TypeScript types
- Compile-time errors for invalid values
- IDE autocomplete

✅ Validation
- Enum validation (parseAsStringEnum)
- Number parsing with defaults
- Boolean parsing

✅ URL Sync
- Automatic URL updates
- Browser history integration
- Shareable URLs

✅ Default Values
- .withDefault() for fallback values
- No need for manual null checks
- Consistent behavior

✅ Server & Client
- Same parsers work on both sides
- Type-safe on server with createSearchParamsCache
- Reactive on client with useQueryState

BEFORE (Manual parsing):
const page = parseInt(searchParams?.page || '1', 10)
const difficulty = searchParams?.difficulty || 'All'
// No type safety, no validation, manual parsing

AFTER (nuqs):
const { page, difficulty } = questionListingCache.parse(searchParams)
// Type-safe, validated, with defaults
*/

// Mock functions for examples
async function fetchQuestions(params: any) {
  return []
}
async function fetchPracticeQuestions(params: any) {
  return []
}
async function fetchBlogPosts(params: any) {
  return []
}

# 🔗 nuqs Integration Guide

Complete guide for using `nuqs` for type-safe URL search parameter parsing in your PTE Academic SaaS.

## 📚 Table of Contents

- [What is nuqs?](#what-is-nuqs)
- [Setup](#setup)
- [Quick Start](#quick-start)
- [Client Components](#client-components)
- [Server Components](#server-components)
- [Available Parsers](#available-parsers)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## What is nuqs?

**nuqs** (Next.js URL Query State) provides type-safe, validated URL search params for both client and server components in Next.js.

### Benefits

✅ **Type Safety** - Full TypeScript support with autocomplete
✅ **Validation** - Built-in parsing and validation
✅ **URL Sync** - Automatic URL updates
✅ **Server & Client** - Works on both sides
✅ **Default Values** - Fallback values without null checks
✅ **History Integration** - Browser back/forward support

---

## Setup

### 1. Installation

Already installed in your project:

```bash
pnpm add nuqs
```

### 2. Root Layout Provider

Already configured in [app/layout.tsx](app/layout.tsx):

```tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

### 3. Centralized Parsers

All parsers are defined in [lib/parsers.ts](lib/parsers.ts).

---

## Quick Start

### Client Component Example

```tsx
'use client'

import { useQueryStates } from 'nuqs'
import { questionListingParsers } from '@/lib/parsers'

export function QuestionFilters() {
  const [filters, setFilters] = useQueryStates(questionListingParsers)

  return (
    <div>
      <p>Page: {filters.page}</p>
      <p>Difficulty: {filters.difficulty}</p>

      <button onClick={() => setFilters({ page: filters.page + 1 })}>
        Next Page
      </button>

      <select
        value={filters.difficulty}
        onChange={(e) => setFilters({ difficulty: e.target.value as any })}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
        <option value="All">All</option>
      </select>
    </div>
  )
}
```

### Server Component Example

```tsx
import { questionListingCache } from '@/lib/parsers'

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Parse search params - type-safe with defaults
  const { page, pageSize, difficulty } =
    questionListingCache.parse(searchParams)

  const questions = await fetchQuestions({ page, pageSize, difficulty })

  return (
    <div>
      <h1>Questions - Page {page}</h1>
      <p>Difficulty: {difficulty}</p>
      {/* Render questions */}
    </div>
  )
}
```

---

## Client Components

### Single Query State

```tsx
import { useQueryState } from 'nuqs'
import { parseAsInteger } from 'nuqs'

export function Pagination() {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1)
  )

  return (
    <div>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>Page {page}</span>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  )
}
```

### Multiple Query States

```tsx
import { useQueryStates } from 'nuqs'
import { practiceFiltersParsers } from '@/lib/parsers'

export function PracticeFilters() {
  const [filters, setFilters] = useQueryStates(practiceFiltersParsers, {
    history: 'push', // or 'replace'
  })

  return (
    <div>
      {/* Category selector */}
      <select
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value as any })}
      >
        <option value="speaking">Speaking</option>
        <option value="writing">Writing</option>
        <option value="reading">Reading</option>
        <option value="listening">Listening</option>
      </select>

      {/* Exam type */}
      <select
        value={filters.type}
        onChange={(e) => setFilters({ type: e.target.value as any })}
      >
        <option value="academic">Academic</option>
        <option value="core">Core</option>
      </select>

      {/* Reset all filters */}
      <button
        onClick={() =>
          setFilters({
            category: 'reading',
            type: 'academic',
            page: 1,
          })
        }
      >
        Reset
      </button>
    </div>
  )
}
```

### History Options

```tsx
const [filters, setFilters] = useQueryStates(parsers, {
  history: 'push', // Add to history (default)
  // OR
  history: 'replace', // Replace current history entry
})
```

---

## Server Components

### Basic Usage

```tsx
import { questionListingCache } from '@/lib/parsers'

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const params = questionListingCache.parse(searchParams)

  // All params are type-safe and validated
  // params.page: number
  // params.pageSize: number
  // params.difficulty: "Easy" | "Medium" | "Hard" | "All"
  // params.search: string
  // params.isActive: boolean

  return <div>{/* Use params */}</div>
}
```

### With Data Fetching

```tsx
import { practiceFiltersCache } from '@/lib/parsers'
import { fetchListingQuestions } from '@/lib/pte/listing-helpers'

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { category, type, page, pageSize, difficulty } =
    practiceFiltersCache.parse(searchParams)

  const questions = await fetchListingQuestions(category, type, {
    page,
    pageSize,
    difficulty,
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
```

---

## Available Parsers

All parsers are in [lib/parsers.ts](lib/parsers.ts).

### Common Parsers

```typescript
// Pagination
paginationParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
}

// Difficulty filter
difficultyParser = parseAsStringEnum([
  'Easy',
  'Medium',
  'Hard',
  'All',
]).withDefault('All')

// Search
searchParser = parseAsString.withDefault('')

// Active toggle
isActiveParser = parseAsBoolean.withDefault(true)
```

### PTE-Specific Parsers

```typescript
// Practice category
pteCategoryParser = parseAsStringEnum([
  'speaking',
  'writing',
  'reading',
  'listening',
]).withDefault('reading')

// Exam type
examTypeParser = parseAsStringEnum(['academic', 'core']).withDefault('academic')

// Practice filters (combined)
practiceFiltersParsers = {
  category: pteCategoryParser,
  type: examTypeParser,
  difficulty: difficultyParser,
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
}
```

### Question Listing Parsers

```typescript
questionListingParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  difficulty: difficultyParser,
  search: parseAsString.withDefault(''),
  isActive: parseAsBoolean.withDefault(true),
}
```

### Blog/Strapi Parsers

```typescript
blogParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  category: parseAsString,
  tag: parseAsString,
  search: parseAsString.withDefault(''),
}

courseParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  level: parseAsStringEnum(['beginner', 'intermediate', 'advanced']),
  isPremium: parseAsBoolean,
}
```

---

## Migration Guide

### Before (Manual Parsing)

```tsx
// ❌ Old way - no type safety
export async function Page({ searchParams }) {
  const page = parseInt(searchParams?.page || '1', 10)
  const pageSize = parseInt(searchParams?.pageSize || '20', 10)
  const difficulty = searchParams?.difficulty || 'All'
  const search = searchParams?.search || ''

  // page could be NaN
  // difficulty could be any string
  // no validation
}
```

### After (nuqs)

```tsx
// ✅ New way - type-safe & validated
import { questionListingCache } from '@/lib/parsers'

export async function Page({ searchParams }) {
  const { page, pageSize, difficulty, search } =
    questionListingCache.parse(searchParams)

  // page: number (guaranteed valid, default: 1)
  // pageSize: number (guaranteed valid, default: 20)
  // difficulty: "Easy" | "Medium" | "Hard" | "All" (default: "All")
  // search: string (default: "")
}
```

### Migration Steps

1. **Import the cache**: `import { questionListingCache } from '@/lib/parsers'`
2. **Replace manual parsing**: Use `.parse(searchParams)`
3. **Remove parseInt/defaults**: All handled automatically
4. **Update types**: TypeScript will infer correct types

---

## Best Practices

### 1. Use Centralized Parsers

**✅ DO**:
```tsx
import { questionListingParsers } from '@/lib/parsers'
const [filters] = useQueryStates(questionListingParsers)
```

**❌ DON'T**:
```tsx
// Don't define parsers inline
const [page] = useQueryState('page', parseAsInteger.withDefault(1))
```

### 2. Use Caches for Server Components

**✅ DO**:
```tsx
import { questionListingCache } from '@/lib/parsers'
const params = questionListingCache.parse(searchParams)
```

**❌ DON'T**:
```tsx
// Don't manually parse on server
const page = parseInt(searchParams?.page || '1')
```

### 3. Provide Default Values

**✅ DO**:
```tsx
parseAsInteger.withDefault(1)
parseAsString.withDefault('')
```

**❌ DON'T**:
```tsx
parseAsInteger // Could be null
```

### 4. Use Enums for Fixed Values

**✅ DO**:
```tsx
parseAsStringEnum(['Easy', 'Medium', 'Hard']).withDefault('Easy')
```

**❌ DON'T**:
```tsx
parseAsString // Any string allowed
```

### 5. Type Your Components

**✅ DO**:
```tsx
type SearchParams = Record<string, string | string[] | undefined>

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // ...
}
```

### 6. Update History Appropriately

```tsx
// For filters/navigation - use 'push' (default)
useQueryStates(parsers, { history: 'push' })

// For temporary states - use 'replace'
useQueryStates(parsers, { history: 'replace' })
```

---

## Examples in Codebase

### ✅ Already Using nuqs

- [components/pte/PracticeFilters.tsx](components/pte/PracticeFilters.tsx) - Practice category/type filters
- [lib/pte/listing-helpers.ts](lib/pte/listing-helpers.ts) - Server-side question listing

### 📝 Example Files

- [lib/parsers.example.tsx](lib/parsers.example.tsx) - Comprehensive examples
- [lib/parsers.ts](lib/parsers.ts) - All parser definitions

---

## Common Patterns

### Pagination Component

```tsx
'use client'

import { useQueryState } from 'nuqs'
import { parseAsInteger } from 'nuqs'

export function Pagination({ total }: { total: number }) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1)
  )

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  )
}
```

### Search Input

```tsx
'use client'

import { useQueryState } from 'nuqs'
import { parseAsString } from 'nuqs'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput() {
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault('')
  )

  const debouncedSetSearch = useDebouncedCallback(setSearch, 300)

  return (
    <input
      type="search"
      defaultValue={search}
      onChange={(e) => debouncedSetSearch(e.target.value)}
      placeholder="Search questions..."
    />
  )
}
```

### Filter Reset

```tsx
'use client'

import { useQueryStates } from 'nuqs'
import { questionListingParsers } from '@/lib/parsers'

export function FilterControls() {
  const [filters, setFilters] = useQueryStates(questionListingParsers)

  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      difficulty: 'All',
      search: '',
      isActive: true,
    })
  }

  const hasFilters =
    filters.difficulty !== 'All' ||
    filters.search !== '' ||
    filters.isActive !== true

  return (
    <div>
      {/* Filter controls */}
      {hasFilters && <button onClick={resetFilters}>Reset Filters</button>}
    </div>
  )
}
```

---

## Troubleshooting

### Type Errors

**Error**: `Type 'string | null' is not assignable to type 'string'`

**Solution**: Use `.withDefault()`:
```tsx
parseAsString.withDefault('') // Never null
```

### Enum Validation Fails

**Error**: Invalid value passed to enum parser

**Solution**: Use type assertion or check value:
```tsx
const value = e.target.value as 'Easy' | 'Medium' | 'Hard'
setFilters({ difficulty: value })
```

### Server Component Not Parsing

**Error**: `searchParams` is undefined

**Solution**: Check component receives searchParams:
```tsx
export default async function Page({
  searchParams, // ← Must receive this
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // ...
}
```

---

## Resources

- [nuqs Documentation](https://nuqs.47ng.com/)
- [lib/parsers.ts](lib/parsers.ts) - All parsers
- [lib/parsers.example.tsx](lib/parsers.example.tsx) - Examples
- [Next.js App Router Docs](https://nextjs.org/docs/app)

---

**Happy coding with type-safe URLs! 🚀**

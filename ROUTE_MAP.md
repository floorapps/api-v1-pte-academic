# PTE Practice Platform Route Map

This document outlines the final route structure for the PTE Academic practice platform after resolving critical route conflicts and implementing proper route segment configurations.

## Route Structure Overview

All practice routes are located under `/app/pte/academic/practice/`

### Main Practice Routes

- `/pte/academic/practice` - Main practice dashboard
  - **Purpose**: Overview of all practice sections
  - **Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

### Section Routes

- `/pte/academic/practice/[section]` - Section overview (speaking, writing, reading, listening)
  - **Purpose**: List all question types within a section
  - **Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

### Section Tests Routes

- `/pte/academic/practice/section-tests` - Section tests index
  - **Purpose**: Entry point for full section tests
  - **Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

- `/pte/academic/practice/section-tests/[section]` - Section test overview
  - **Purpose**: List question types for section tests
  - **Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

- `/pte/academic/practice/section-tests/[section]/[questionType]` - Section test questions
  - **Purpose**: Display questions for a specific question type in section tests
  - **Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

## Question Type Routes

### Listening Section

All routes under `/pte/academic/practice/listening/`

#### List Pages (Question Lists)
- `/pte/academic/practice/listening/fill-in-blanks`
- `/pte/academic/practice/listening/highlight-correct-summary`
- `/pte/academic/practice/listening/highlight-incorrect-words`
- `/pte/academic/practice/listening/multiple-choice-multiple`
- `/pte/academic/practice/listening/multiple-choice-single`
- `/pte/academic/practice/listening/select-missing-word`
- `/pte/academic/practice/listening/summarize-spoken-text`
- `/pte/academic/practice/listening/write-from-dictation`

**Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

#### Detail Pages (Individual Questions)
- `/pte/academic/practice/listening/fill-in-blanks/question/[id]`
- `/pte/academic/practice/listening/highlight-correct-summary/question/[id]`
- `/pte/academic/practice/listening/highlight-incorrect-words/question/[id]`
- `/pte/academic/practice/listening/multiple-choice-multiple/question/[id]`
- `/pte/academic/practice/listening/multiple-choice-single/question/[id]`
- `/pte/academic/practice/listening/select-missing-word/question/[id]`
- `/pte/academic/practice/listening/summarize-spoken-text/question/[id]`
- `/pte/academic/practice/listening/write-from-dictation/question/[id]`

**Config**: `dynamicParams = true`, `revalidate = 86400`

### Reading Section

All routes under `/pte/academic/practice/reading/`

#### List Pages
- `/pte/academic/practice/reading/fill-in-blanks`
- `/pte/academic/practice/reading/multiple-choice-multiple`
- `/pte/academic/practice/reading/multiple-choice-single`
- `/pte/academic/practice/reading/reading-writing-fill-blanks`
- `/pte/academic/practice/reading/reorder-paragraphs`

**Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

#### Detail Pages
- `/pte/academic/practice/reading/fill-in-blanks/question/[id]`
- `/pte/academic/practice/reading/multiple-choice-multiple/question/[id]`
- `/pte/academic/practice/reading/multiple-choice-single/question/[id]`
- `/pte/academic/practice/reading/reading-writing-fill-blanks/question/[id]`
- `/pte/academic/practice/reading/reorder-paragraphs/question/[id]`

**Config**: `dynamicParams = true`, `revalidate = 86400`

### Speaking Section

All routes under `/pte/academic/practice/speaking/`

#### List Pages
- `/pte/academic/practice/speaking/answer-short-question`
- `/pte/academic/practice/speaking/describe-image`
- `/pte/academic/practice/speaking/read-aloud`
- `/pte/academic/practice/speaking/repeat-sentence`
- `/pte/academic/practice/speaking/respond-to-situation`
- `/pte/academic/practice/speaking/retell-lecture`
- `/pte/academic/practice/speaking/summarize-group-discussion`

**Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

#### Detail Pages
- `/pte/academic/practice/speaking/answer-short-question/question/[id]`
- `/pte/academic/practice/speaking/describe-image/question/[id]`
- `/pte/academic/practice/speaking/read-aloud/question/[id]`
- `/pte/academic/practice/speaking/repeat-sentence/question/[id]`
- `/pte/academic/practice/speaking/respond-to-situation/question/[id]`
- `/pte/academic/practice/speaking/retell-lecture/question/[id]`
- `/pte/academic/practice/speaking/summarize-group-discussion/question/[id]`

**Config**: `dynamicParams = true`, `revalidate = 86400`

### Writing Section

All routes under `/pte/academic/practice/writing/`

#### List Pages
- `/pte/academic/practice/writing/summarize-written-text`
- `/pte/academic/practice/writing/write-essay`

**Config**: `dynamic = 'force-dynamic'`, `revalidate = 3600`

#### Detail Pages
- `/pte/academic/practice/writing/summarize-written-text/question/[id]`
- `/pte/academic/practice/writing/write-essay/question/[id]`

**Config**: `dynamicParams = true`, `revalidate = 86400`

## Route Configuration Summary

### List Pages (Question Lists)
- **Purpose**: Display paginated lists of questions with filtering
- **Data Fetching**: Server-side via `fetchListingQuestions()`
- **Caching**: `dynamic = 'force-dynamic'`, `revalidate = 3600` (1 hour ISR)
- **Loading**: Custom loading.tsx with skeleton components

### Detail Pages (Individual Questions)
- **Purpose**: Display individual questions for practice
- **Data Fetching**: Server-side database queries with `generateStaticParams()`
- **Caching**: `dynamicParams = true`, `revalidate = 86400` (24 hour ISR)
- **Loading**: Generic loading.tsx with skeleton UI

## Loading States

All question detail pages (`/question/[id]/`) have dedicated `loading.tsx` files that provide skeleton UI during data fetching.

Selected list pages with heavy data fetching also include `loading.tsx` files.

## Conflict Resolution

- ✅ Removed conflicting dynamic route `app/pte/academic/practice/[section]/[questionType]/page.tsx`
- ✅ Eliminated duplicate routes in section-tests directory
- ✅ Standardized route patterns across all sections
- ✅ Added proper route segment configurations
- ✅ Implemented consistent loading states

## Total Route Count

- **List Pages**: 27 (main + section + section-tests + question type lists)
- **Detail Pages**: 22 (individual questions across all sections)
- **Total Active Routes**: 49

All routes follow standardized patterns and include proper Next.js 13+ App Router configurations.
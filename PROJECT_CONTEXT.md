# Project Context: PTE Learning LMS

## 1. Project Identity
**Name:** PTE Learning LMS
**Goal:** A comprehensive Learning Management System for PTE (Pearson Test of English) preparation, featuring AI-driven scoring and feedback.
**Current Focus:** Implementing the **Speaking** section (Read Aloud) and integrating **Google Gemini** for AI scoring.

## 2. Tech Stack
- **Framework:** Next.js 16.0.3 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **Authentication:** Better Auth
- **Styling:** Tailwind CSS 4.0, Radix UI, Lucide React
- **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/google`), Google Generative AI
- **State Management:** Zustand, Nuqs (URL state)
- **Testing:** Playwright

## 3. Architecture & Key Directories
- **`app/`**: Next.js App Router pages and layouts.
    - `app/pte/`: Core PTE application routes.
    - `app/api/`: API routes (including AI streaming).
- **`components/`**: Reusable UI components.
    - `components/ui/`: Shadcn/Radix primitives.
    - `components/pte/`: PTE-specific components (e.g., `AudioRecorder`, `Timer`).
- **`lib/`**: Utility functions and shared logic.
    - `lib/db/`: Database schema (`schema.ts`) and connection.
    - `lib/ai/`: AI prompts and scoring logic.
    - `lib/actions/`: Server Actions for data mutation.
- **`public/`**: Static assets.

## 4. Database Schema Overview
The database is managed via Drizzle ORM (`lib/db/schema.ts`). Key domains include:

### Authentication (Better Auth)
- `users`: Core user profile.
- `sessions`, `accounts`, `verifications`: Auth management.

### PTE Core
- `pte_tests`: Definitions of mock/practice tests.
- `pte_questions`: The central question bank (polymorphic via `question_type`).
- `test_attempts`: User attempts at full tests.
- `test_answers`: Individual answers within an attempt.

### Module-Specific Tables
- **Speaking:** `speaking_questions`, `speaking_attempts`, `speaking_templates`.
- **Reading:** `reading_questions`, `reading_attempts`.
- **Writing:** `writing_questions`, `writing_attempts`.
- **Listening:** `listening_questions`, `listening_attempts`.

### AI & Realtime
- `conversation_sessions`: Logs for OpenAI Realtime API sessions (Speaking Practice).
- `pte_sync_jobs`: Tracking for external content synchronization.

## 5. Development Workflow
- **Package Manager:** `pnpm`
- **Dev Server:** `pnpm run dev`
- **Database Studio:** `pnpm db:studio` (Drizzle Studio)
- **Migrations:** `pnpm db:generate` && `pnpm db:migrate`
- **Seeding:** `pnpm db:seed` or `pnpm db:seed:speaking`

## 6. Current Implementation Status
- **Speaking - Read Aloud:** In progress.
    - UI: `components/simple-ai-scoring.tsx` (Prototype).
    - Scoring: Integrating Google Gemini for pronunciation and fluency analysis.
- **Database:** Schema is comprehensive and deployed.

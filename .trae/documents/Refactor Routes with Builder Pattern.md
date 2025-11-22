# Objectives
- Consolidate and refactor all routes into a clear builder-pattern architecture.
- Deduplicate overlapping route functionality via a centralized route registry.
- Enforce consistent naming, validation, and error handling across domains (API, academic, uploads, AI scoring, hooks).
- Verify dependencies, remove circular references, and keep TypeScript path aliases coherent.
- Maintain identical runtime behavior with integration tests and measure performance before/after.
- Restrict AI integrations to OpenAI GPT‑4o and Gemini 3 Pro via Vercel AI Gateway with AI SDK v5.

# Current State (Survey)
- API routes: `app/api/*` with many domain folders (ai-scoring, listening, reading, speaking, writing, uploads, user, etc.).
- Academic routes: `app/pte/academic/*` with nested section/type/question pages (speaking, listening, reading, writing).
- Components: UI and feature clients in `components/*` including PTE practice and AI scoring frontends.
- AI scoring routes: `app/api/ai-scoring/*` include `speaking`, `writing`, `reading`, `listening`, `models`, `score`, `simple`, and `schemas.ts`.
- Uploads: `app/api/uploads/audio/route.ts`.
- Hooks: `hooks/*` custom hooks for toast and mobile detection.

# Target Architecture (Builder Pattern)
## Core Principles
- Single source of truth for route definitions via a centralized registry.
- Base builder exposes common behaviors (validation, auth, middleware, error formatting, logging).
- Domain builders extend base builder with domain concerns (API, academic, uploads, ai‑scoring).
- Auto-generated manifest from registry to keep file paths and imports correct.

## Folder Structure
- `lib/routes/`
  - `registry.ts` (central route registry; declarative route entries)
  - `builders/`
    - `base-route-builder.ts` (validation, errors, middleware hooks)
    - `api-route-builder.ts` (App Router handlers, Next Request/Response bindings)
    - `academic-route-builder.ts` (page loaders, param handling, data-fetch pattern)
    - `upload-route-builder.ts` (multipart/file validation, storage abstractions)
    - `ai-scoring-route-builder.ts` (AI SDK integration + gateway clients)
  - `middleware/` (auth, rate-limit, schema enforcement)
  - `schemas/` (zod schemas shared across domains)
  - `types.ts` (RouteEntry, RouteBuilder interfaces)
- `app/api/` remains as filesystem routing, but each `route.ts` delegates to a composed builder instance created from registry rather than bespoke logic.
- `app/pte/academic/` pages import `academic-route-builder` for data-loading and handler composition, not ad-hoc patterns.

# Central Route Registry
- Declaratively define routes:
```ts
// lib/routes/registry.ts
export const routes: RouteEntry[] = [
  { id: 'ai.speaking.score', path: '/api/ai-scoring/speaking', method: 'POST', builder: 'ai-scoring', handler: 'speakingScore' },
  { id: 'ai.writing.score', path: '/api/ai-scoring/writing', method: 'POST', builder: 'ai-scoring', handler: 'writingScore' },
  { id: 'uploads.audio', path: '/api/uploads/audio', method: 'POST', builder: 'upload', handler: 'audioUpload' },
  { id: 'reading.questions.get', path: '/api/reading/questions', method: 'GET', builder: 'api', handler: 'readingQuestionsGet' },
  // ... all existing routes mapped here
]
```
- A small codegen (or runtime import) binds each filesystem `route.ts` to the correct builder + handler implementation; registry is the single source of truth.

# Deduplication Strategy
- Automated detection of duplicates:
  - Static analysis: parse handlers (AST via `ts-morph`) to compute a fingerprint based on control flow + external calls.
  - Heuristics: match identical zod schemas, identical prompts, identical storage mutations.
  - Report: produce a diff list of suspected duplicates (e.g., `ai-scoring/score` vs `ai-scoring/speaking/writing`).
- Action:
  - Merge duplicates to one handler implementation under the builder (e.g., `ai-scoring-route-builder.ts` exposes `score(section)`), keep route files as thin wrappers.
  - Update imports and consumers to the canonical handler.

# Domain Builders (Implementation Plan)
- `BaseRouteBuilder`:
  - Methods: `use(middleware)`, `validate(schema)`, `handle(errors)`, `log(context)`.
  - Ensures consistent HTTP error shape and logging.
- `ApiRouteBuilder`:
  - Wraps Next.js App Router handlers (`GET`, `POST`, etc.) and NextRequest/Response translation.
  - Shared auth/rate-limit middleware.
- `AcademicRouteBuilder`:
  - Parameterized loaders: `loadSection(section)`, `loadQuestion(type, id)`.
  - Standardize data-fetch + error UX across academic pages.
- `UploadRouteBuilder`:
  - Validates `multipart/form-data`, normalizes file buffers, integrates with storage (Blob/S3).
- `AiScoringRouteBuilder`:
  - Restrict models to OpenAI GPT‑4o and Gemini 3 Pro via Vercel AI Gateway.
  - Provide helpers: `scoreSpeaking`, `scoreWriting`, `scoreReading`, `scoreListening` using AI SDK v5.
  - Uniform zod schemas and error messages across all AI routes.

# Naming & Conventions
- Route IDs: `domain.subdomain.action` (e.g., `ai.speaking.score`).
- File names: kebab-case; builder handlers are verb-led (e.g., `speakingScore.ts`).
- Schemas: colocated in `lib/routes/schemas/*` and imported by builders.
- Avoid deep nesting in API unless required by Next filesystem routing.

# Dependency Verification
- Build a dependency graph:
  - Use `depcruise` or `madge` offline to generate a graph for `app/api/*`, `app/pte/academic/*`, `components/*`.
  - Identify cycles; move shared logic into `lib/*` to break cycles.
- Update TypeScript path aliases:
  - Add `@/routes/*` for builders/registry in `tsconfig.json`.
  - Verify all imports resolve via `tsc --noEmit` and Next build.

# Testing Plan
- Integration tests (Playwright + Next test server):
  - For each route mapped in registry, assert identical behavior (status codes, payloads, error cases).
  - Edge cases: invalid payloads, auth failures, rate limits, large uploads.
- AI Scoring tests:
  - Mock AI Gateway; verify prompt construction, schema outputs, error handling.
  - Models used: only `openai:gpt-4o` and `google:gemini-3.0-pro` (via gateway) per docs.
- Frontend→Backend wiring:
  - Validate components under `components/pte/*` call the new endpoints correctly; snapshot payload shapes.

# Performance Benchmarks
- Before/after benchmarks with `autocannon` against key endpoints:
  - `ai-scoring/speaking`, `ai-scoring/writing`, `uploads/audio`, `reading/questions`.
- Metrics: p50/p95 latency, throughput, error rates; store results in `docs/perf/`.

# Migration & Documentation
- `ARCHITECTURE.md`:
  - Describe the builder pattern, registry, and domain builders.
  - Document route IDs, naming conventions, and extension guidelines.
- Route documentation:
  - Auto-generate route manifest (path, method, handler, schema, description) from registry.
- Migration guide:
  - Mapping from old paths to new builder-backed implementations.
  - List of deduplicated routes and the canonical replacement.
- Breaking changes:
  - Ideally none; if any signature changes are necessary, list them clearly with upgrade steps.

# Version Control & Delivery
- Atomic commits per step:
  1) Introduce registry + base builder.
  2) Add domain builders.
  3) Refactor AI scoring routes to builder wrappers.
  4) Refactor uploads and reading/listening/writing routes.
  5) Update components to new endpoints if needed.
  6) Add tests.
  7) Benchmarks + docs.
- Use feature branch (`refactor/routes-builder-pattern`) and PR with checklist.

# Execution Steps (High-Level)
1. Create `lib/routes/*` scaffold: base builder, types, registry.
2. Implement `AiScoringRouteBuilder` constrained to GPT‑4o and Gemini 3 Pro via Vercel AI Gateway and AI SDK v5.
3. Wrap existing `app/api/ai-scoring/*` handlers to delegate to the builder.
4. Add `UploadRouteBuilder` and refactor `app/api/uploads/audio/route.ts`.
5. Add `ApiRouteBuilder` for generic REST endpoints (reading/listening/speaking/writing/user/*).
6. Add `AcademicRouteBuilder` to unify data-loading patterns under `app/pte/academic/*`.
7. Populate registry with all route entries; generate manifest.
8. Run dependency graph, fix cycles, update tsconfig paths.
9. Write integration tests and run them.
10. Run benchmarks and record results.
11. Produce `ARCHITECTURE.md` and migration docs.

# Acceptance Criteria
- All existing functionality preserved; test suite passes.
- Registry becomes the single source of truth; file-based routes are thin wrappers.
- No circular dependencies; imports resolve.
- Only GPT‑4o and Gemini 3 Pro used via Vercel AI Gateway and AI SDK v5 in AI routes.
- Clear documentation and performance benchmarks included.

Please confirm this plan. Once approved, I will implement it step by step with atomic commits, tests, and benchmarks.
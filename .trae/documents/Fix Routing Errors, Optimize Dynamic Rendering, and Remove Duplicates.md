## Problems Identified
- Dev lock prevents server start due to `.next/dev/lock` (port 3001 fallback was fine).
- Build failures:
  - Missing component `@/components/ui/alert` used by multiple speaking components.
  - `getQuestionById` is imported across many pages but not exported from `lib/actions/pte.ts`.
- Duplicated route patterns for speaking/academic practice:
  - Legacy: `/pte/speaking/<snake_case>/[questionId]`
  - Canonical: `/pte/academic/practice/<section>/<type>/<id>` and `.../<type>/question/[id]`
- Non-idiomatic `params: Promise<...>` signatures in dynamic pages.
- Duplicate schema file `lib/db/schema/speaking.ts` vs central `lib/db/schema.ts` type/tables.

## Plan of Action
### 1) Implement Missing Components & APIs
- Add `components/ui/alert.tsx` with `Alert`, `AlertTitle`, `AlertDescription` (variants: default/destructive), accessible `role="alert"`, Tailwind classes consistent with existing UI.
- Add `getQuestionById({ id, category })` to `lib/actions/pte.ts`:
  - Auth check via Better Auth (consistent with existing actions).
  - `switch(category)` fetches from: `speakingQuestions`, `readingQuestions`, `writingQuestions`, `listeningQuestions`.
  - Returns the row with expected shape used by practice components; throws `Error('Not found')` → pages handle via `notFound()`.

### 2) Routing Improvements & Clean URLs
- Choose canonical dynamic route: `/pte/academic/practice/<section>/<type>/<id>`.
- Update legacy pages under `app/pte/speaking/**/[questionId]/page.tsx` to issue a `redirect()` to the canonical path, mapping `snake_case` → `kebab-case` as needed.
- Standardize all dynamic page signatures from `params: Promise<...>` to `params: { ... }` and remove `await params`.
- Ensure all detail pages use `getQuestionById` with proper `category` and `notFound()` on null.
- Keep existing public links intact; add prefetch on main list pages.

### 3) Remove Duplicates Safely
- Replace the only import of `@/lib/db/schema/speaking` with `@/lib/db/schema` and then delete `lib/db/schema/speaking.ts` (single-use duplicate).
- Collapse duplicate "question" subsegment pages to simple redirect wrappers to the canonical path, eliminating copied rendering code.

### 4) Optimize Rendering
- Use server components for data fetching in dynamic pages; keep client components for interaction only.
- Normalize shared props across practice components; avoid `any` where easy wins are possible without refactors.
- Add minimal error boundaries and graceful fallbacks in dynamic pages (loading, not found).

### 5) Cleanup & Verification
- Cleanup artifacts: remove `.next`, `.turbo`, `.swc`, and any lingering lock file; run `pnpm clean`.
- Start dev and run a production build to verify no missing modules and correct exports.
- Manual page tests:
  - `/pte/dashboard`
  - `/pte/academic/practice/speaking` list and a detail page.
  - One reading, listening, writing detail page each.
- Accessibility check: ensure alert roles and nav semantics remain correct.

### 6) Error Handling & Consistency
- All dynamic pages use `try/catch` around action calls and either show a safe message or `notFound()`.
- Redirects ensure old URLs still function while converging on the canonical structure.

## Deliverables
- New `Alert` component.
- `getQuestionById` implementation.
- Redirected legacy pages and standardized dynamic page params.
- Duplicate schema cleanup.
- Verified dev/build runs and page rendering across categories.

If approved, I will implement the above changes, run cleanup/build, and verify across routes before finishing.
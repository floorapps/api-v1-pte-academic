## Scope
- Finalize unified practice flow across `/pte/academic/practice` for Speaking, Reading, Listening, Writing.
- Ensure listing pages use `{ data, total, limit }` from `getQuestions` with pagination and filters.
- Confirm attempt pages exist and render correctly for all question types under canonical `/question/[id]` paths.
- Validate redirects and remove duplicate renderers.
- Clean caches and verify build/dev.

## Implementation Steps
1) Pages & Data Contracts
- Standardize `searchParams` signatures to objects (no Promise) across category pages.
- Keep `QuestionList` for category pages; confirm it receives `data`, `total`, `limit`, `page`.
- For type listings (e.g., Read Aloud) ensure they fetch via helpers and render `QuestionsTable` with canonical links.

2) Attempt Pages Consistency
- Verify all attempt pages (`/question/[id]`) across the four sections enforce type checks and `notFound()`.
- Confirm they render client attempt components (`SpeakingAttempt`, `ReadingAttempt`, etc.).

3) Routing Cleanup
- Keep legacy speaking deep links via `redirect()` to canonical paths.
- Redirect generic `[type]/[id]` pages to `/question/[id]` for all sections.
- Remove duplicated render pages only after verifying redirects.

4) Pagination & Filters
- Ensure `page`, `type`, `difficulty` are supported across category listings and maintain URL state.
- Add prefetch where needed for smoother navigation.

5) Verification
- Clean `.next/.turbo/.swc` and start dev; run production build.
- Manually test flows:
  - `/pte/academic/practice?category=speaking`
  - `/pte/academic/practice/speaking/read-aloud`
  - `/pte/academic/practice/speaking/read-aloud/question/<id>`
  - Equivalent paths for reading, listening, writing.
- Confirm legacy URLs redirect correctly.

## Deliverables
- Consistent listings with pagination for all four sections.
- Canonical attempt pages and validated redirects.
- Passing build and working dev server.

If approved, I will execute these steps, apply edits, clean caches, run dev/build, and verify all flows end-to-end.
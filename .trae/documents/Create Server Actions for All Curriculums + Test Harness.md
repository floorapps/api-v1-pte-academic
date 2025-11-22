## Objectives
- Create secure Next.js Server Actions for PTE Speaking, Reading, Writing, and Listening scoring.
- Standardize prep/record timers and single short beep at recording start (Read Aloud).
- Integrate results into existing dialogs and attempts lists.
- Add a small test harness (unit + e2e) to validate end-to-end.

## Architecture
- Use Next.js App Router + Server Actions to keep API keys server-only.
- Models:
  - Writing: `gemini-1.5-flash-latest` (fast text analysis).
  - Speaking: `gemini-1.5-pro-latest` (multimodal; audio-aware).
  - Listening: `gemini-1.5-pro-latest` for audio tasks; `flash` for transcript-only.
  - Reading: `gemini-1.5-flash-latest` (text grading).
- Optional: switch to `gemini-2.5-pro` as soon as available.

## Packages
- Already present: `ai`, `@ai-sdk/google`, `zod`.
- Env: `GOOGLE_API_KEY` server-only.

## Server Actions (New/Unified)
- `app/actions/score-speaking.ts` (existing): keep gemini-pro; input `{ type, transcript, promptText }`; output `{ overall, subscores, rationale, suggestions }`.
- `app/actions/score-writing.ts` (added): gemini-flash; structured schema for `{scores: {content, grammar, vocabulary, spelling, total}, feedback, detected_errors}`.
- `app/actions/score-reading.ts` (new):
  - Input: `{ type, userResponse, promptText, options?, answerKey? }`.
  - Output: `{ overall (0–90), subscores: {accuracy, comprehension, vocabulary}, mistakes: string[], rationale, suggestions }`.
  - Scoring rules per type:
    - MC-single/multiple: compare against `answerKey`; accuracy primary.
    - Reorder paragraphs: compare sequence similarity (Gemini judges + heuristic order distance).
    - Fill-in-blanks: exact match + Gemini semantic hints for near-misses.
- `app/actions/score-listening.ts` (new):
  - Input: `{ type, audioUrl | transcript, promptText? }`.
  - Output: `{ overall, subscores: {content, pronunciation, fluency | accuracy}, transcript?, rationale, suggestions }`.
  - For audio inputs, pass a URL to gemini-pro; for highlight tasks use transcript-only.

## Embeddings (KAT-like semantic relevance)
- Helper `lib/ai/embeddings.ts`: `embedText(text)` using `google.embedding('models/text-embedding-004')`.
- DB (later step): add pgvector columns for attempts/prompts; persist embeddings and query nearest neighbours for relevance/recommendations.

## UI Integration
- Speaking: dialog already refactored to call Server Action directly.
- Reading & Listening:
  - Add `ScoreDetailsDialog` variants (or extend current) to render `{accuracy/comprehension}` and mistakes.
  - Update attempts list components per section to show a compact score badge and “Score Info” button.
- Standardize prep/record timers and beep where applicable.

## Tests
- Unit tests (server):
  - `tests/actions/score-writing.test.ts`: validates schema shape and score ranges for sample essays.
  - `tests/actions/score-speaking.test.ts`: sample transcript vs promptText; asserts subscores returned.
  - `tests/actions/score-reading.test.ts`: MC and reorder samples; checks accuracy calc.
  - `tests/actions/score-listening.test.ts`: mock transcript; verifies outputs.
- E2E (Playwright):
  - Recording flow: open Read Aloud, observe 35–40s prep, beep at start, auto-stop at 40s, submit, open Score Info.
  - Reading flow: answer MC-single and open dialog to verify accuracy and rationale.

## Rollout Steps
1. Implement `score-reading.ts` and `score-listening.ts` server actions and export.
2. Extend dialogs and attempts lists for Reading/Listening.
3. Add unit tests and Playwright e2e for representative tasks.
4. Optional: add pgvector migration & `embedText()` and wire persistence.
5. Verify in dev; measure latency; adjust prompts/temperature.

## Deliverables
- New server actions for Reading & Listening with structured JSON outputs.
- UI hooks to invoke actions and present score details.
- Unit and e2e tests proving correctness.

If approved, I’ll implement the new actions, wire the UI, and provide tests to validate all four curricula end-to-end.
**Objective**
- Align Read Aloud to Pearson format: 35–40s preparation, single short beep at recording start, 40s auto-stop.
- Ensure prep-end beep is consistent across all speaking types.
- Add the missing UI parts (audio player, "Score Info" button, time display) in the attempts/discussion section.
- Replace existing AI scoring endpoints with secure Next.js Server Actions using Gemini models; add pgvector-based semantic relevance.

**Current State**
- Timers: `SPEAKING_TIMER_MAP.read_aloud` has `prepMs: 35_000`, `recordMs: 40_000` in `lib/pte/types.ts`.
- Beep/recording: `SpeakingRecorder` already plays a beep right as recording begins and auto-stops at `recordMs`. Start/stop beeps also exist in legacy hooks (`use-audio-recorder`).
- Scoring: `/api/ai-scoring/score` and `lib/ai/*` orchestrators drive scoring; `ScoreDetailsDialog` fetches from that API (components/pte/speaking/ScoreDetailsDialog.tsx:75).
- Attempts UI: Discussion/Me tabs exist but public answer listing with audio + "Score Info" is missing.

**Changes**
- Beep & Timing
  - Standardize a single short prep-end beep at transition to recording (Pearson style) across `SpeakingRecorder` and legacy components.
  - Keep auto-stop at 40s. No extra beeps during prep; optional short beep at stop remains.
- UI Additions
  - In Discussion/Me tabs, list attempts with:
    - `audio` player for each attempt (`controls`, `source` URL)
    - `button` with `<span class="text-primary pe-1">Score Info</span><score>` to open `ScoreDetailsDialog`
    - Time display `p` like `Time: 00:26`
    - Preserve existing pagination and tabs; add items when user has attempts or public answers
- Server Actions (Security)
  - Remove `/api/ai-scoring/score` + orchestrator wrappers.
  - Add `app/actions/score-writing.ts` using `ai` + `@ai-sdk/google` (gemini-1.5-flash-latest) per your provided schema.
  - Add `app/actions/score-speaking.ts` using `ai` + `@ai-sdk/google` (gemini-1.5-pro-latest). For audio, prefer uploading to storage and sending a URL to the model.
  - Client components will call Server Actions (via form/actions) instead of hitting public API routes.
- pgvector Embeddings
  - Enable pgvector in Postgres/Neon and add vector columns via Drizzle:
    - `speaking_attempts.embedding` (stores transcript embedding)
    - `writing_attempts.embedding` (stores essay embedding)
    - `speaking_questions.prompt_embedding` (stores prompt embedding)
  - Create helper to embed text with `google.embedding('models/text-embedding-004')` and persist.
  - Add cosine-similarity queries for semantic relevance/KAT-like checks and recommendations.

**File-Level Plan**
- Beep & Recorder
  - `components/pte/speaking/SpeakingRecorder.tsx`: ensure `playBeep()` fires exactly when prep countdown hits 0 and before `startRecording()`; keep auto-stop timeout.
  - `components/pte/hooks/use-audio-recorder.tsx`: align `playBeep` frequency/duration to match recorder (single ~400ms tone at ~1000Hz), used by any legacy screens.
  - Read Aloud-specific client pages re-use `SpeakingRecorder` to unify behaviour.
- Attempts UI
  - `components/pte/speaking/ScoreDetailsDialog.tsx`: refactor to accept structured Server Action result (scores, transcript, feedback) rather than calling `/api/ai-scoring/score` (currently triggered at line 75 useEffect).
  - `components/pte/speaking/SpeakingQuestionClient.tsx`: after recording & storing attempt, render audio + "Score Info" button as shown in your reference markup.
  - Add lightweight list in Discussion/Me tabs populated from attempts for the current question.
- Server Actions
  - Add `app/actions/score-writing.ts` and `app/actions/score-speaking.ts` exactly per your provided schemas and model usage.
  - Add `lib/ai/embeddings.ts` helper: `embedText(text)` using `ai` `embed` + `@ai-sdk/google` `text-embedding-004`.
- DB & Queries
  - `lib/db/schema.ts`: add pgvector columns; Drizzle migration to `CREATE EXTENSION IF NOT EXISTS vector` and `ALTER TABLE ... ADD COLUMN ... vector(768)`.
  - `lib/db/queries.ts`: add `findNearestByEmbedding(table, vector)` using `<->` for cosine distance.
  - Persist embeddings at attempt creation/update and on question seeding.
- Remove Legacy Endpoints
  - Delete `/api/ai-scoring/score` and `lib/ai/orchestrator.ts` (and any unused provider wrappers).
  - Update `lib/pte/speaking-score.ts` to call the new Server Action and remove orchestrator references.

**Dependencies & Config**
- Install: `npm install ai @ai-sdk/google zod`
- Env: `GOOGLE_API_KEY` in server-only scope; do not expose to client.
- Optional model switches: when available, upgrade to `gemini-2.5-pro` for speaking and `gemini-1.5-flash` for writing.

**Verification**
- Run dev, open Read Aloud:
  - Confirm 35–40s prep countdown.
  - Single short beep when recording starts; mic opens.
  - Auto-stop at 40s; optional stop beep.
  - Attempt appears in Discussion/Me tab with audio player and "Score Info"; dialog shows structured scores & transcript.
- Seed a few prompts with embeddings; verify nearest-neighbour queries produce sensible semantic scores.

**Migration & Rollback**
- Migrations enable pgvector and add vector columns; maintain idempotency.
- Keep `/api/speaking/attempts` for storage but switch scoring to Server Actions; rollback by restoring legacy endpoint and removing new actions if needed.

If you confirm, I’ll implement the changes, wire Server Actions, migrate the DB for pgvector, refactor the UI, and validate end-to-end with recordings and scoring.
## Scope
- Apply the unified recorder, timing, beep, and secure Gemini scoring to all speaking modules: read_aloud, repeat_sentence, describe_image, retell_lecture, answer_short_question, summarize_group_discussion, respond_to_a_situation.

## Recorder & Timing
- Use `components/pte/speaking/SpeakingRecorder.tsx` for all modules (prep/record timers, auto-stop, short start beep). 
- Map timers via `SPEAKING_TIMER_MAP` (`lib/pte/types.ts`).
- External time label surfaces `prepping`/`recording` remaining time from recorder state.

## Scoring
- Route all submissions through `/api/speaking/attempts` which invokes `scoreAttempt` (`lib/pte/speaking-score.ts:15`) → `scoreSpeakingAction` (`lib/actions/score.ts:31`) using `gemini-1.5-pro-latest`.
- Score dialog uses Server Actions instead of client API (`components/pte/speaking/ScoreDetailsDialog.tsx:44–75`).

## UI Unification
- Page client: adopt `SpeakingQuestionClient` (`components/pte/speaking/SpeakingQuestionClient.tsx`) across all modules to load question, mount recorder, upload audio, submit, and open dialog.
- Add:
  - Breadcrumbs and header per module (Dashboard → Practice → Academic → Speaking → Module → Title).
  - External `Time: mm:ss` label and compact linear progress + “Click to stop”.
  - Demo button to play example audio per question (use `promptMediaUrl` or a demo asset).
  - Controls: Submit (disabled until recorded), Redo, Demo; Search input; Prev/Next bound to `prevId`/`nextId`.

## Attempts & Discussion
- Per module page, render Attempts list with `audio` player and a chip-like “Score Info” button (already added in `components/pte/speaking/AttemptsList.tsx:150`).
- Add a Discussion tab that lists `speaking_attempts` where `isPublic=true` for the current question, with pagination and a share icon.
- On submit, allow marking attempt as public (default private).

## Module Pages
- Refactor module-specific components to thin wrappers around `SpeakingQuestionClient` with the correct `SpeakingType`.
- Replace any legacy `use-audio-recorder` usage with `SpeakingRecorder` to standardize beep/timing.

## Accessibility & UX
- Ensure ARIA labels for buttons and progress, and keyboard shortcut (`Space`) for start/stop maintained by recorder.
- Audio format and max size hints remain visible.

## Tests
- Unit tests: time label sync and progress values during prep/record for each module.
- E2E (Playwright):
  - Record→Submit→Score Info for at least 3 modules.
  - Prev/Next navigation works and preserves state.
  - Discussion tab shows public attempts with audio and chips; pagination renders.

## Rollout
- Migrate pages module-by-module to `SpeakingQuestionClient`.
- Validate in dev Preview.
- Optional next: pgvector embeddings for semantic relevance and recommendations.

If you confirm, I’ll refactor each speaking module to use the shared client/recorder, wire discussion/public answers, and verify with tests and Preview.
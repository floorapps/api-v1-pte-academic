## Objectives
- Deliver a complete PTE Academic speaking practice experience starting with Read Aloud, then Repeat Sentence, Describe Image, Answer Short Question, Retell Lecture.
- Provide intuitive recording UX, strict timing, playback, AI scoring with structured outputs, and persistent progress analytics.
- Maintain session continuity across question types and pages.

## UI/UX
- Build responsive pages under `app/pte/academic/practice/speaking/*` matching OnePTE layout patterns.
- Components:
  - Prompt panel with audio/text and difficulty metadata
  - Recorder with prep/record timers, mic selector, waveform, space-key control, redo
  - Submit/Redo controls, help links
  - Score details dialog with 0–5 rubric, structured 0–90 subscores, rationale, transcript, audio scrubber
  - Attempts list (latest first) with badges and quick playback
- Accessibility:
  - Keyboard shortcuts (Space to start/stop)
  - ARIA labels on controls and progress bars
  - Focus management in the dialog

## Architecture
- Client: React components in `components/pte/speaking/*` (Recorder, QuestionClient, ScoreDialog, AttemptsList).
- Server APIs:
  - Attempts: `app/api/speaking/attempts` (auth, rate-limit, validate, persist)
  - Scoring: `app/api/ai-scoring/speaking` (orchestrator → providers → AI Gateway)
- Orchestrator: `lib/ai/orchestrator.ts` selects provider, integrates deterministic where applicable, merges subscores.
- Data: Drizzle schema `speakingAttempts`, `speakingQuestions`; queries in `lib/pte/queries`.

## Recording & Playback
- MediaRecorder pipeline: `audio/webm;codecs=opus`, 128kbps, chunked; prep countdown then auto-stop at `recordMs`.
- Mic selector, live waveform, audio-level monitoring; file upload fallback.
- Client-side 15MB size guard; server validates duration and timing with anti-tamper window.

## AI Scoring Integration
- Primary flow: Attempts endpoint transcribes audio, calls `scoreAttempt` (`lib/pte/speaking-score.ts`) → orchestrator (OpenAI/Gemini/Vercel AI SDK via `AI_GATEWAY_API_KEY`).
- Structured output:
  - Orchestrator returns `overall`, `subscores: { content, pronunciation, fluency, grammar, vocabulary }`, `rationale`.
  - Dialog fetches live details from `/api/ai-scoring/speaking` and displays 0–90 subscores + rationale alongside persisted 0–5 rubric.
- Environment:
  - `AI_GATEWAY_API_KEY` (primary), optional direct provider keys, model hints (`VERCEL_AI_OPENAI_MODEL`).

## Phase 1: Read Aloud
- Page: `app/pte/academic/practice/speaking/read-aloud/page.tsx` lists questions; Question page renders `SpeakingQuestionClient` with timers from `SPEAKING_TIMER_MAP`.
- Recorder UX: prep 3–10s, record 40s, waveform, mic selector, space toggle.
- Scoring: derive transcript → orchestrator; convert 0–90 → official 0–5 for Content/Pronunciation/Fluency; show dialog with AI details.
- Analytics: store words, WPM, filler rate, model/provider/latency; render charts later.

## Phase 2: Repeat Sentence
- Prompt-only audio; show 1x/1.25x speed selector and remaining time banner.
- Audio processing: latency-safe start when mic opens; transcript quality checks (short/empty detection).
- Feedback UI: suggestions, strengths, areas for improvement; AI transcript visible in dialog.

## Phase 3: Other Speaking Types
- Describe Image: prompt image panel, checklist of elements described; specialized content heuristics combined with AI subscores.
- Answer Short Question: compact input and quick feedback; content emphasis with correctness hint.
- Retell Lecture: long-form audio prompt, note-taking hints; extended recorder duration with same scoring pipeline.

## Session Continuity
- Maintain a per-user practice session (existing `/api/attempts/session`) to track timing windows and anti-tamper; store `timings` with prep/record timestamps.
- Persist navigation state (prev/next question) and drafts; handle back/forward within section.

## Security & Compatibility
- Secure POST with auth, rate limits (≤60/hour/user), strict JSON bodies, redaction of keys in health endpoint.
- Compatible with existing `div` layouts and utility classes; components accept container constraints.

## Testing
- Usability: recruit PTE candidates; observe recording flow, dialog clarity.
- Load: simulate concurrent attempts and AI scoring bursts; ensure DB and storage are stable.
- Accuracy: validate subscores against reference responses; adjust weightings and prompts.
- Cross-browser: Chrome, Edge, Firefox, Safari (Recorder fallback to upload where needed).

## Documentation
- System architecture (pearson-official): diagrams of flow (UI → attempts → transcribe → orchestrator → providers → persist).
- API integration guide (pearson-official): endpoints, payloads, timing rules, error formats.
- User manuals: how to practice each speaking type; Admin guide: managing questions and reviewing attempts.

## Deliverables
- Read Aloud production-ready flow with scoring dialog and attempts list.
- Repeat Sentence implementation.
- Reusable components for other types; scaffold pages for Describe Image, ASQ, Retell Lecture.
- Test scripts (`pnpm deploy:test`) extended with speaking attempt mocks; health endpoint verification.

## Acceptance Criteria
- Recording + submission works reliably with visual cues.
- AI scoring shows both rubric 0–5 and structured 0–90 subscores with rationale.
- Attempts persist with transcript and analytics; dialog reflects accurate details.
- Session continuity across question pages; responsive layouts across devices.

Please confirm this plan; upon approval, I will implement Phase 1 end-to-end and proceed with Phases 2 and 3, including tests and documentation.
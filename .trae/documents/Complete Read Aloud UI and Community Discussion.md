## Scope
- Align Read Aloud UI with Pearson format and your browser reference.
- Add community/public answers with audio players, Score Info chips, share actions, and pagination.
- Keep all AI scoring via Server Actions (Gemini), no client-side keys.

## Read Aloud UI
- Breadcrumbs and header: render Dashboard → Practice → Academic → Speaking → Read Aloud → current title.
- External time label: show `Time: mm:ss`; bind to prep/record phases from `SpeakingRecorder` state.
- Linear progress + mic control: display a compact progress bar with “Click to stop” while recording.
- Demo button: play the item’s demo audio (`promptMediaUrl` or bundled asset).
- Controls row: Submit (disabled until recorded), Redo, Demo; then Search input and Prev/Next wired to `prevId`/`nextId`.

## Attempts and Score Info
- In attempts list, style the “Score Info” button as chip with score, add share icon.
- Keep audio player and dialog; dialog continues to use Gemini Server Action.

## Community/Public Answers
- Data: query `speaking_attempts` with `isPublic=true` for the current question; paginate.
- Tabs: Discussion | Board | Me; render public answers with audio, score chip, share icon; add pagination controls.
- Submission toggle: allow marking an attempt public during submit.

## Reading & Listening Hooks
- Add score dialogs for Reading/Listening using the new Server Actions; compact subscores and rationale.

## Tests
- Unit: prep/record time label sync, progress bar values.
- E2E (Playwright): Read Aloud end-to-end, Prev/Next navigation, public answers list rendering and pagination.

## Delivery
- Implement UI changes in existing components.
- Validate in dev Preview and with test script.

Confirm to proceed and I will implement these UI and community features end‑to‑end and verify them in Preview.
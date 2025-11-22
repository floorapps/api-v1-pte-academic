## Findings from Browser
- Public attempts list shows audio players, "Score Info" chips, share icon, and pagination.
- Breadcrumb trail to the Read Aloud item with question title and instruction text.
- Visible time label like "Time: 00:32" outside the recorder; linear progress bar and mic icon with "Click to stop".
- Controls: Submit (disabled until recorded), Redo, Demo; plus search input and previous/next navigation.

## Missing Items
- Breadcrumbs and question header formatting.
- External time label (preparation/recording) synchronized with recorder state.
- Linear progress UI alongside waveform; mic-action label.
- Demo playback button (sample recorded audio for the item).
- Search input and Prev/Next anchors bound to `prevId`/`nextId` already available in `SpeakingQuestionClient` payload.
- Community Discussion:
  - Public answers tab with attempt audio, a "Score Info" chip and share button.
  - Pagination for public answers.

## Implementation Plan
### Read Aloud Page Enhancements
1. Add breadcrumb component and question header to the page container.
2. Bind a visible `Time: mm:ss` label to `SpeakingRecorder` state (prepping → remaining; recording → remaining).
3. Render a linear progress bar in addition to the existing waveform for prep/record phases.
4. Add a "Demo" button to play example audio (from question prompt media or a demo asset).
5. Expose search input and Prev/Next buttons wired to `payload.prevId`/`payload.nextId` in `SpeakingQuestionClient`.

### Attempts and Score Info
1. Extend attempts list to style "Score Info" as a chip and include a share icon.
2. Keep the dialog trigger; populate with Server Action results already in place.

### Community/Public Answers
1. Add an API + query for public attempts of a question (filter `isPublic=true`).
2. Render a tabbed Discussion view with audio items, score chips, share action, and pagination.
3. Add a toggle on submit to mark attempt public; default private.

### Testing
1. Unit tests for the time label and progress synchronization logic.
2. Playwright e2e for Record→Submit→Score Info flow and Prev/Next navigation.

## Delivery
- Implement UI changes with existing components, minimal new code.
- No client secrets exposed; all scoring stays in Server Actions.
- Provide a short test script and e2e covering the new UI pieces.

Confirm to proceed and I will implement these UI and community features and validate them end-to-end.
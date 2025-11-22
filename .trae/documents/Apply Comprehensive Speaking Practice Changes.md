## Summary of Changes to Apply
- Enhance prompt audio with speed control and event callbacks.
- Auto-start recording for Repeat Sentence right after prompt audio ends.
- Show transcript, structured AI subscores (0–90), provider metadata and rationale in score dialog.
- Display WPM and filler-rate analytics in attempts list.
- Keep unified orchestrator scoring via AI Gateway and existing attempts endpoint.

## UI/UX Updates
- AudioPlayer: add playback speed selector, time display, and `onEnded/onPlay/onPause` callbacks.
- QuestionPrompt: use AudioPlayer; expose optional `onPromptAudioEnd/onPromptAudioPlay` props.
- SpeakingQuestionClient: orchestrate Repeat Sentence flow:
  - Listen for prompt audio end → toggle recorder `auto.active` → begin recording.
  - Show banner indicating auto start after prompt ends.
  - Render transcript below prompt after submission.
- ScoreDetailsDialog: fetch `/api/ai-scoring/speaking` on open; render 0–90 subscores, rationale, provider/model/latency; show transcript.
- AttemptsList: add badges for WPM and filler rate.

## Integration
- Use existing backend routes:
  - `POST /api/speaking/attempts` (auth, transcribe, score via orchestrator)
  - `POST /api/ai-scoring/speaking` (structured subscores + rationale)
- Environment: ensure `AI_GATEWAY_API_KEY` set; optional model hints.

## Testing
- Run API smoke tests: `pnpm deploy:test`.
- Manual flows: Read Aloud and Repeat Sentence recording, submission, dialog display.
- Cross-browser checks: Chrome/Edge for recording; upload fallback where unsupported.

## Deliverables
- Updated components: AudioPlayer, QuestionPrompt, SpeakingQuestionClient, ScoreDetailsDialog, AttemptsList.
- Verified end-to-end Read Aloud and Repeat Sentence user flows with structured AI scoring and analytics.

Confirm to apply these changes end-to-end now.
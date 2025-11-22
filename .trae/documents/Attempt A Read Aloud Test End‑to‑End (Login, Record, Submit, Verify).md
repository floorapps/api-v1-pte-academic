## Prerequisites
- Sign in at `http://localhost:3000/sign-in` (attempts API requires auth).
- Allow mic permission in the browser.
- Use our app routes; external demo (`onepte.com/.../618`) is not auto‑linked. Optional: configure `ONEPTE_API_BASE_URL` + `ONEPTE_API_TOKEN` and POST `/api/pte-practice/sync/speaking` with `{ "type": "s_read_aloud" }` to import that content.

## Test Flow
1) Navigate to list: `http://localhost:3000/pte/academic/practice/speaking/read-aloud`.
2) Open any question from the list.
3) Verify UI:
   - Prompt text/audio loads.
   - External time label shows prep countdown; single beep at transition; recording auto‑starts; auto‑stop at 40s.
   - Progress bars for prep/record are visible.
4) Record and stop (auto): observe duration and “Audio ready” status.
5) Click Submit:
   - Expect 201 with attempt + feedback.
   - If 401, sign in and retry.
6) Attempts list:
   - New attempt appears with audio player.
   - “Score Info” opens subscores and feedback.
7) Optional: mark public if UI supports and verify in discussion boards.

## Verification
- Confirm list and detail pages return 200.
- Confirm `Attempts` renders the new row and audio plays.
- If desired, open Drizzle Studio and verify a new row in `speaking_attempts`.

## External 618 (Optional)
- If you want to attempt the exact external 618 passage (South Australia COVID‑19 care), sync Read Aloud via the external API, then open it from our list and follow the same steps.

Approve to proceed and I’ll guide the live attempt, capture statuses (401/201), and verify the new attempt appears in the UI.
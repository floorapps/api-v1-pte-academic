## Preconditions
- Use `.env.local` for dev (`NODE_ENV=development`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` = `http://localhost:3000`).
- Close any old browser tabs that cached an unauthenticated state.
- Ensure port `3000` is free.

## Steps
1) Stop any running dev server process.
2) Start dev server: `pnpm run dev` (port 3000).
3) Verify readiness:
   - `GET /api/health` (200 if all AI providers ok; 503 is acceptable in dev).
   - `GET /pte/academic/practice/speaking/read-aloud` returns 200.
   - `GET /pte/academic/practice/speaking/read_aloud/question/<id>` returns 200.
4) Sign in:
   - Open `/sign-in`, log in (email/password or Google).
   - Confirm session cookie is set; then reload the question page.
5) Attempt flow:
   - Auto prep countdown → single beep → auto recording → auto-stop at 40s.
   - Click `Submit`; expect 201; if 401, re-login and retry.
6) Verify attempts:
   - `GET /api/speaking/attempts?questionId=<id>` returns 200 and shows your attempt.
   - UI list shows audio and `Score Info`.
7) Optional checks:
   - Open Drizzle Studio and confirm new row in `speaking_attempts`.

## Troubleshooting
- If `net::ERR_ABORTED` occurs, refresh after login and ensure the server was restarted.
- If mic permission denied, enable browser mic access.
- If health remains 503, continue; it does not block practice.

Approve to proceed and I will restart the server, validate endpoints, guide the login and attempt, and confirm the attempt appears in the UI.
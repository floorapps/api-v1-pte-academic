## Goals
- Remove client fetch to APIs for speaking submission; use Server Actions instead.
- Use secure auth context: session cookie or `Authorization: Bearer <user_access_token>` from DB.
- Stabilize page navigation to prevent `net::ERR_ABORTED` during HMR.
- Allow Google avatar domain.

## Changes
- Create `app/actions/speaking.ts` with server actions:
  - `submitSpeakingAttempt(formData)`
    - Inputs: `questionId`, `type`, `timings`, `audio` (File)
    - Auth: resolve user via Better Auth session; fallback to header token → `getUserByAccessToken(token)`
    - Upload audio (server-only), transcribe, score, insert `speaking_attempts`, return attempt
    - `revalidatePath('/pte/academic/practice/speaking/read-aloud/question/[id]')`
  - `getSpeakingAttempts({questionId, page, pageSize})`
    - Auth same as above; returns items for current user
- Generate and store `user_access_token`:
  - On signup/sign-in, if missing, create token and store on the user (hashed) in DB
  - Provide `authContextFromHeaders()` that checks cookie session; else parses `Authorization` header and validates token

## Client Integration
- Update `SpeakingQuestionClient`:
  - Replace upload + `fetch('/api/speaking/attempts')` with `useActionState(submitSpeakingAttempt)`
  - Build `FormData` from recorded Blob, append fields, call action; show pending/success; open Score Info
  - On success, call `router.refresh()`
- Update `AttemptsList` pattern:
  - Add server wrapper `AttemptsListServer` (RSC) that calls `getSpeakingAttempts` and passes `items` to a thin client renderer; include a “Refresh” button that triggers `router.refresh()`
  - Remove client `fetch('/api/speaking/attempts')`

## Navigation Stability
- Avoid client `fetch` during navigation; rely on server actions + RSC for data
- Ensure external time label and recorder state remain unaffected by HMR (already in place); use `router.refresh()` after submit

## Avatar Domain
- Add `images.remotePatterns` entry for `lh3.googleusercontent.com` in `next.config.ts` to prevent avatar load errors

## Security
- Server actions run server-side; no credentials exposed to client
- For token use, read `Authorization: Bearer` header only on server; hash token at rest; rotate on demand

## Validation
- Attempt flow: record → auto-stop at 40s → submit via server action → 201 equivalent result → attempts render via RSC
- Sign-in ensures session; if using token, include header automatically via fetch interceptor or cookie; server actions prefer session
- Verify avatar loads and navigation no longer logs `ERR_ABORTED`

Approve and I will implement the server actions, refactor client components to use them, add token auth helpers, update image host, and validate the attempt flow end-to-end without API route calls.
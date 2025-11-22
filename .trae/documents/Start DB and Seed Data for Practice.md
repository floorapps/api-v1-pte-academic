## What You Asked
- Do not seed if the current DB is clean or if there’s any risk of mistakes.
- Resume code plans safely and verify the speaking flow end-to-end.

## Safe Validation (No Seed)
- Confirm env: ensure `POSTGRES_URL`/`DATABASE_URL` and `GOOGLE_API_KEY` exist in `.env` or `.env.local`.
- Schema health: check tables exist and match Drizzle (`speaking_questions`, `speaking_attempts`, `reading_questions`, `writing_questions`, `listening_questions`, `users`).
- Data counts: verify current row counts to decide whether seeding is needed:
  - `speaking_questions` count and per-type distribution.
  - `speaking_attempts` should be empty on clean dev.
- Duplicate guard: check duplicates by `(type,title)`; seeding logic already avoids duplicates (no `--reset`).
- Studio check only: open `drizzle-kit studio` to view data; do not run any seed yet.

## If Issues Found (Targeted Fixes)
- Minor duplicates/missing: run idempotent seed (no reset): `pnpm db:seed:speaking` (inserts only missing `(type,title)`), optionally `--limit=<N>`.
- Bad data only in speaking: use targeted reset: `pnpm tsx lib/db/seed.ts --speaking --reset` then idempotent seed.
- Never reset other modules unless explicitly approved; keep reading/writing/listening untouched.

## Run App & Verify (No DB Changes)
- Start dev server: `pnpm run dev` (port `3000`).
- Navigate Speaking: `/pte/academic/practice/speaking/read-aloud`.
- Validate end-to-end without seeding:
  - Prep timing/beep: 35–40s prep; single beep at record start; auto-stop at 40s.
  - Submit attempt: receive 201/200 from Server Action/API; audio saved to Blob; scores rendered.
  - Attempts list: visible under “Attempts” with audio player + “Score Info”.
  - Discussion/public: only shows attempts marked public.

## Contingency
- If questions list is empty on a truly clean DB, pause and ask approval to run minimal idempotent seed for speaking only.
- If `GOOGLE_API_KEY` is missing, enable AI scoring by adding it to server env (server-only).

## Next Actions After Approval
- Open Studio to validate counts; skip seeding unless you approve.
- Start dev server and guide a speaking practice attempt live to confirm timing, scoring, and rendering.
- If empty content blocks testing, request approval to run safe idempotent speaking seed (no reset).
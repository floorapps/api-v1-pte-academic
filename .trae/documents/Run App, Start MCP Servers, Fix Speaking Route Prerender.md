## Overview
- Run the Next.js app locally, connect MCP providers, and resolve build/prerender errors blocking preview.
- Standardize dynamic route handling for speaking question pages and clean up environment configuration.

## Environment & Secrets
- Verify `.env` and `.env.local` for required keys: `AI_GATEWAY_API_KEY`, `ONEPTE_API_BASE_URL`, `ONEPTE_API_TOKEN`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`.
- Add missing `ONEPTE_*` values to stop client warnings; keep non-production secrets in `.env.local` only.
- Ensure `.gitignore` excludes `.env.local` and any secret-bearing files.

## MCP Servers
- Initialize MCP integrations available in this workspace: GitHub, PostgreSQL, YouTube, Clojars.
- Confirm credentials/tokens are present; if missing, stub safe read-only actions and prompt for keys.
- Smoke-test each: list GitHub repos, run a simple read-only SQL query, fetch YouTube video details, check Clojars artifact.

## Speaking Routes Fixes
- Audit all speaking question pages for unsafe `id.slice(0, 8)` usage in headers, breadcrumbs, and `generateMetadata`.
- Update `generateMetadata` signatures to accept `{ params }: { params: Promise<{ id: string }> }` and use null-safe `id?.slice(0, 8) || 'Unknown'`.
- Add guard clauses in `QuestionContent` to `notFound()` when `id` is missing or record inactive/wrong type.
- Ensure `export const cacheComponents = false` where prerender is sensitive.

## ONEPTE Client Warnings
- Locate ONEPTE client module and verify it reads `process.env.ONEPTE_API_BASE_URL` and `process.env.ONEPTE_API_TOKEN` with clear error messages.
- Add a lightweight runtime check: throw a typed error if missing (for dev only) and avoid noisy logs in prod.

## Build & Preview
- Run `npm run build` to verify a clean production build.
- Launch dev server with `npm run dev` and open preview; navigate through speaking pages to confirm rendering.
- Watch terminal for source map warnings; if they persist but are non-fatal, document; otherwise disable problematic source maps in dev config.

## QA & Verification
- Typecheck (`tsc --noEmit`), lint (`eslint`), and quick E2E smoke through critical flows: login, listing, attempting a speaking question, AI scoring call.
- Validate AI Gateway usage against `AI_GATEWAY_API_KEY` and ensure no secrets are logged.

## Deployment (Optional)
- If local preview succeeds, trigger production deploy (Vercel or chosen platform), mindful of prior rate limits.
- Verify environment variables on the hosting platform and run post-deploy smoke tests.

## Deliverables
- Updated speaking pages with safe `id` handling and consistent metadata.
- Clean build and running local preview.
- MCP integrations verified with read-only checks.
- Documented environment requirements and security posture for secrets.

Please confirm and I’ll execute the steps end-to-end, start the app, initialize MCP providers, and resolve the remaining build/prerender issues.
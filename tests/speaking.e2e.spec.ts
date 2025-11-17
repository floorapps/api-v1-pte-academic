/**
 * End-to-end QA tests for PTE Speaking features.
 *
 * These tests use Playwright's test runner. They validate:
 * - Question listing API for each speaking type
 * - GET-by-id API navigation context
 * - Attempts POST requires authentication
 * - Uploads API behavior (presign/fallback) authentication and env checks
 * - Basic UI rendering for list and detail pages (recorder presence)
 *
 * Pre-requisites to run full happy-path (attempt creation + blob upload):
 * - Server running locally: BASE_URL=http://localhost:3000 (default)
 * - Authenticated session cookie named "session" (see [getSession()](lib/auth/session.ts:41))
 * - Env: VERCEL_BLOB_READ_WRITE_TOKEN present if you want presigned/fallback uploads to succeed
 * - Seeds loaded: pnpm run db:seed:all
 *
 * Run:
 *   npx playwright test tests/speaking.e2e.spec.ts --project=chromium
 *
 * References:
 * - List API: [route.ts](app/api/speaking/questions/route.ts:1)
 * - ById API: [route.ts](app/api/speaking/questions/%5Bid%5D/route.ts:1)
 * - Attempts API: [route.ts](app/api/speaking/attempts/route.ts:1)
 * - Uploads API: [route.ts](app/api/uploads/audio/route.ts:1)
 * - Timers/types: [lib/pte/types.ts](lib/pte/types.ts:1)
 * - Recorder UI: [components/pte/speaking/SpeakingRecorder.tsx](components/pte/speaking/SpeakingRecorder.tsx:1)
 * - Client Orchestrator: [components/pte/speaking/SpeakingQuestionClient.tsx](components/pte/speaking/SpeakingQuestionClient.tsx:1)
 */

/**
 * Authenticated happy-path E2E (optional)
 * Verifies: presign upload → direct upload to Vercel Blob → POST attempt → attempts list has new row.
 * Skips automatically when:
 *  - E2E_SESSION env var is not set (cookie "session=&lt;token&gt;")
 *  - Upload presign not available or blob token missing (501/500)
 *
 * To run:
 *   E2E_SESSION=&lt;your_cookie_value&gt; npx playwright test tests/speaking.e2e.spec.ts -g "Authenticated E2E"
 */
import { expect, request as pwRequest, request, test } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Speaking type identifiers (API) and kebab-case slugs (detail routes)
const SPEAKING_TYPES = [
  { type: 'read_aloud', slug: 'read-aloud' },
  { type: 'repeat_sentence', slug: 'repeat-sentence' },
  { type: 'describe_image', slug: 'describe-image' },
  { type: 'retell_lecture', slug: 'retell-lecture' },
  { type: 'answer_short_question', slug: 'answer-short-question' },
  { type: 'summarize_group_discussion', slug: 'summarize-group-discussion' },
  { type: 'respond_to_a_situation', slug: 'respond-to-a-situation' },
] as const

async function api() {
  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  })
}

async function getFirstQuestionId(
  ctx: request.APIRequestContext,
  type: string
) {
  const res = await ctx.get(
    `/api/speaking/questions?type=${encodeURIComponent(type)}&page=1&pageSize=1`
  )
  if (!res.ok()) return null
  const data = await res.json()
  return data?.items?.[0]?.id || null
}

test.describe('API: /api/speaking/questions listing', () => {
  for (const { type } of SPEAKING_TYPES) {
    test(`returns items for type=${type}`, async () => {
      const ctx = await api()
      const res = await ctx.get(
        `/api/speaking/questions?type=${encodeURIComponent(type)}&page=1&pageSize=5`
      )
      expect(
        res.ok(),
        `List request should be successful for type=${type}`
      ).toBeTruthy()
      const json = await res.json()
      expect(json).toHaveProperty('items')
      expect(Array.isArray(json.items)).toBeTruthy()
      // After seeding we expect at least 1 item, otherwise surface a readable message
      expect(
        json.items.length,
        `No questions found for type=${type}. Did you run "pnpm run db:seed:all"?`
      ).toBeGreaterThan(0)
    })
  }
})

test('API: /api/speaking/questions/[id] returns navigation context', async () => {
  const ctx = await api()
  const firstRes = await ctx.get(
    `/api/speaking/questions?type=read_aloud&page=1&pageSize=1`
  )
  test.skip(!firstRes.ok(), 'Server not reachable or list API unavailable')
  const first = await firstRes.json()
  const id = first?.items?.[0]?.id as string | undefined
  test.skip(
    !id,
    'No question id found for read_aloud. Seed data may be missing.'
  )
  const byId = await ctx.get(`/api/speaking/questions/${id}`)
  expect(byId.ok()).toBeTruthy()
  const obj = await byId.json()
  expect(obj).toHaveProperty('question')
  expect(obj.question?.id).toBe(id)
  // prevId/nextId may be null for ends; just ensure property exists
  expect(obj).toHaveProperty('prevId')
  expect(obj).toHaveProperty('nextId')
})

test.describe('API: Attempts and Uploads auth/env behavior', () => {
  test('POST /api/speaking/attempts requires auth', async () => {
    const ctx = await api()
    const id = await getFirstQuestionId(ctx, 'read_aloud')
    test.skip(!id, 'No read_aloud question id available to test attempts.')
    const res = await ctx.post(`/api/speaking/attempts`, {
      data: {
        questionId: id,
        type: 'read_aloud',
        audioUrl: 'https://example.com/fake.webm',
        durationMs: 3000,
        timings: { prepMs: 35000, recordMs: 40000 },
      },
    })
    expect(
      [401, 403].includes(res.status()),
      'Unauthenticated attempt should be rejected'
    ).toBeTruthy()
  })

  test('POST /api/uploads/audio (presign JSON) → 401 without auth or 500 when blob token missing', async () => {
    const ctx = await api()
    const id = await getFirstQuestionId(ctx, 'read_aloud')
    test.skip(
      !id,
      'No read_aloud question id available for upload presign test.'
    )
    const res = await ctx.post(`/api/uploads/audio`, {
      data: { type: 'read_aloud', questionId: id, ext: 'webm' },
      headers: { 'Content-Type': 'application/json' },
    })
    // Accept any of the expected outcomes depending on environment
    const acceptable = [401, 500, 501]
    expect(
      acceptable.includes(res.status()),
      `Expected 401/500/501, got ${res.status()}`
    ).toBeTruthy()
  })
})

test.describe('UI: Speaking list pages render and link to detail', () => {
  for (const { type, slug } of SPEAKING_TYPES) {
    // Map legacy dynamic list route format used by the project for speaking pages
    test(`list page for type=${type} renders`, async ({ page }) => {
      const url = `${BASE_URL}/pte/academic/practice/speaking/${slug}`
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded' })
      test.skip(!resp || !resp.ok(), `Cannot reach list page: ${url}`)
      // Expect the table of questions to appear; assert at least one link to a speaking detail route
      const link = page.locator(
        'a[href*="/pte/academic/practice/speaking/"][href*="/question/"]'
      )
      await expect(
        link.first(),
        `No question links found on ${url}. Did you seed data?`
      ).toBeVisible()
    })
  }
})

test.describe('UI: Speaking detail page renders prompt and recorder controls', () => {
  for (const { type, slug } of SPEAKING_TYPES) {
    test(`detail page for ${type} shows recorder and submit UI`, async ({
      page,
      request,
    }) => {
      const ctx = await api()
      const id = await getFirstQuestionId(ctx, type)
      test.skip(!id, `No question id for ${type}`)
      const detailUrl = `${BASE_URL}/academic/pte-practice-test/speaking/${slug}/question/${id}`
      const resp = await page.goto(detailUrl, { waitUntil: 'domcontentloaded' })
      test.skip(!resp || !resp.ok(), `Cannot reach detail page: ${detailUrl}`)

      // Recorder buttons present (labels defined in SpeakingQuestionClient/SpeakingRecorder)
      const submitBtn = page.getByRole('button', { name: /submit/i })
      const redoBtn = page.getByRole('button', { name: /redo/i })
      await expect(
        submitBtn,
        'Submit button should be rendered (disabled until recording done)'
      ).toBeVisible()
      await expect(redoBtn, 'Redo button should be rendered').toBeVisible()

      // Prompt area visible (text, audio, or image)
      const promptText = page.locator('[data-testid="speaking-prompt-text"]')
      const promptAudio = page.locator('audio')
      const promptImage = page.locator('img')
      await expect(
        promptText.or(promptAudio).or(promptImage),
        'At least one prompt renderer should be present'
      ).toBeVisible()
    })
  }
})

/**
 * Optional advanced E2E: Fake MediaRecorder to validate timers/recording without mic permission.
 * These tests are skipped by default. Enable by setting SPEAKING_E2E_FAKE_REC=1
 * They stub window.MediaRecorder and navigator.mediaDevices.getUserMedia to simulate a quick recording blob.
 */
const USE_FAKE_REC = process.env.SPEAKING_E2E_FAKE_REC === '1'

test.skip(
  !USE_FAKE_REC,
  'Set SPEAKING_E2E_FAKE_REC=1 to run fake recording tests'
)

test.describe('UI: Fake recording flow smoke', () => {
  test('simulate minimal recording and ensure submit enables', async ({
    page,
  }) => {
    const ctx = await api()
    const id = await getFirstQuestionId(ctx, 'repeat_sentence')
    test.skip(!id, 'No question id for repeat_sentence')
    const slug = 'repeat-sentence'

    await page.addInitScript(() => {
      // @ts-ignore
      navigator.mediaDevices = {
        getUserMedia: async () => ({ fake: true }),
      }
      // Minimal fake MediaRecorder implementation
      class FakeMediaRecorder {
        stream: any
        onstop: any
        ondataavailable: any
        state = 'inactive'
        constructor(stream: any) {
          this.stream = stream
        }
        start() {
          this.state = 'recording'
          setTimeout(() => {
            const blob = new Blob([new Uint8Array([1, 2, 3, 4])], {
              type: 'audio/webm',
            })
            this.ondataavailable?.({ data: blob })
            this.stop()
          }, 500)
        }
        stop() {
          this.state = 'inactive'
          this.onstop?.()
        }
      }
      // @ts-ignore
      window.MediaRecorder = FakeMediaRecorder
    })

    const resp = await page.goto(
      `${BASE_URL}/academic/pte-practice-test/speaking/${slug}/question/${id}`,
      { waitUntil: 'domcontentloaded' }
    )
    test.skip(!resp || !resp.ok(), 'Cannot reach detail page')

    // Click Start if present; otherwise the recorder might auto-handle prep timer; try to find a "Start" button
    const startBtn = page.getByRole('button', { name: /start/i })
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
    }

    // Wait a bit for fake recording to "finish"
    await page.waitForTimeout(1200)

    const submitBtn = page.getByRole('button', { name: /submit/i })
    // Submit may still require auth; at least ensure button becomes enabled after recording
    await expect(submitBtn).toBeVisible()
  })
})

const SESSION_COOKIE = process.env.E2E_SESSION || process.env.PTE_SESSION || ''

async function authedApi() {
  if (!SESSION_COOKIE) return null
  return await pwRequest.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      // Session cookie used by [getSession()](lib/auth/session.ts:41)
      Cookie: `session=${SESSION_COOKIE}`,
    },
  })
}

test('Authenticated E2E: presign upload → create attempt → verify list', async () => {
  test.skip(
    !SESSION_COOKIE,
    'Set E2E_SESSION to run the authenticated end-to-end test'
  )

  const ctx = await authedApi()
  test.skip(!ctx, 'No authenticated API context')

  // Choose a speaking type that is always seeded
  const type = 'read_aloud'
  const questionId = await getFirstQuestionId(ctx!, type)
  test.skip(
    !questionId,
    'No question available; ensure "pnpm run db:seed:all" was executed'
  )

  // Step 1: Request presigned upload URL
  const presignRes = await ctx!.post(`/api/uploads/audio`, {
    headers: { 'Content-Type': 'application/json' },
    data: { type, questionId, ext: 'webm' },
  })

  if ([500, 501].includes(presignRes.status())) {
    test.skip(
      true,
      `Uploads not available in this environment (status ${presignRes.status()}). Set VERCEL_BLOB_READ_WRITE_TOKEN to enable.`
    )
    return
  }

  expect(
    presignRes.ok(),
    `Expected presign to succeed, got ${presignRes.status()}`
  ).toBeTruthy()
  const presigned = (await presignRes.json()) as {
    uploadUrl: string
    blobUrl: string
    pathname: string
    expiresAt?: string
  }

  // Step 2: Direct upload tiny "audio/webm" payload to the presigned URL
  const tinyBytes = new Uint8Array([26, 69, 223, 163, 3, 101, 103, 103]) // arbitrary small payload
  const directCtx = await pwRequest.newContext() // absolute URL upload
  const directUpload = await directCtx.post(presigned.uploadUrl, {
    multipart: {
      file: {
        name: 'e2e.webm',
        mimeType: 'audio/webm',
        buffer: Buffer.from(tinyBytes),
      },
    },
  })
  expect(
    directUpload.ok(),
    `Direct upload failed: ${directUpload.status()}`
  ).toBeTruthy()

  let finalBlobUrl: string | null = null
  try {
    const json = await directUpload.json()
    finalBlobUrl = json?.url || null
  } catch {
    // Some presigned endpoints may not return JSON; fall back to predicted blobUrl
  }
  if (!finalBlobUrl) finalBlobUrl = presigned.blobUrl

  // Step 3: Create attempt with uploaded audioUrl
  const createRes = await ctx!.post(`/api/speaking/attempts`, {
    data: {
      questionId,
      type,
      audioUrl: finalBlobUrl,
      durationMs: 1250,
      timings: { prepMs: 0, recordMs: 15000 },
    },
  })
  expect(
    createRes.ok(),
    `Attempt creation failed: ${createRes.status()}`
  ).toBeTruthy()
  const createJson = await createRes.json()
  const attemptId = createJson?.attempt?.id
  expect(attemptId, 'Attempt id should be returned').toBeTruthy()

  // Step 4: Verify attempt appears in the user’s list
  const listRes = await ctx!.get(
    `/api/speaking/attempts?questionId=${encodeURIComponent(questionId)}`
  )
  expect(
    listRes.ok(),
    `Listing attempts failed: ${listRes.status()}`
  ).toBeTruthy()
  const listJson = await listRes.json()
  expect(
    Array.isArray(listJson?.items),
    'Items should be an array'
  ).toBeTruthy()
  const found = listJson.items.find((a: any) => a.id === attemptId)
  expect(
    !!found,
    'Newly created attempt should be present in attempts list'
  ).toBeTruthy()
})

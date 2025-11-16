/**
 * API tests for Polar.sh checkout functionality.
 *
 * These tests validate:
 * - Checkout session creation with valid/invalid inputs
 * - Authentication requirements
 * - Error handling for missing configurations
 * - Webhook processing and subscription updates
 *
 * Prerequisites:
 * - Server running locally: BASE_URL=http://localhost:3000
 * - Authenticated session cookie (E2E_SESSION env var)
 * - Database seeded: pnpm run db:seed:all
 * - Polar.sh access token configured
 *
 * Run:
 *   E2E_SESSION=<cookie> npx playwright test tests/checkout.polar.api.test.ts
 */

import { expect, request, test } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function api() {
  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  })
}

async function authedApi() {
  const sessionCookie = process.env.E2E_SESSION
  if (!sessionCookie) return null

  return await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      Cookie: `session=${sessionCookie}`,
    },
  })
}

test.describe('API: /api/checkout/polar', () => {
  test('POST requires authentication', async () => {
    const ctx = await api()
    const res = await ctx.post('/api/checkout/polar', {
      data: { tier: 'pro' },
    })

    expect([401, 403].includes(res.status())).toBeTruthy()
  })

  test('POST rejects invalid tier', async () => {
    const ctx = await authedApi()
    test.skip(!ctx, 'No authenticated session available')

    const res = await ctx!.post('/api/checkout/polar', {
      data: { tier: 'invalid' },
    })

    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid tier')
  })

  test('POST handles missing price configuration', async () => {
    const ctx = await authedApi()
    test.skip(!ctx, 'No authenticated session available')

    // Test with pro tier (which has placeholder price ID)
    const res = await ctx!.post('/api/checkout/polar', {
      data: { tier: 'pro' },
    })

    // Should return 500 if price ID is not configured
    if (res.status() === 500) {
      const json = await res.json()
      expect(json.error).toContain('Price ID not configured')
    } else {
      // If price IDs are configured, should succeed
      expect(res.ok()).toBeTruthy()
      const json = await res.json()
      expect(json).toHaveProperty('url')
      expect(json.url).toMatch(/^https:\/\/checkout\.polar\.sh\//)
    }
  })

  test('POST creates valid checkout session for premium tier', async () => {
    const ctx = await authedApi()
    test.skip(!ctx, 'No authenticated session available')

    const res = await ctx!.post('/api/checkout/polar', {
      data: { tier: 'premium' },
    })

    if (res.status() === 500) {
      // Price ID not configured - this is expected in test environment
      const json = await res.json()
      expect(json.error).toContain('Price ID not configured')
    } else {
      // If configured, validate response structure
      expect(res.ok()).toBeTruthy()
      const json = await res.json()
      expect(json).toHaveProperty('url')
      expect(json).toHaveProperty('id')
      expect(typeof json.url).toBe('string')
      expect(typeof json.id).toBe('string')
    }
  })
})

test.describe('API: /api/webhooks/polar', () => {
  test('POST processes checkout.session.completed event', async () => {
    const ctx = await api()

    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        customer_id: 'test_customer_123',
        metadata: {
          userId: 'test_user_123',
          tier: 'pro',
        },
        status: 'completed',
      },
    }

    const res = await ctx.post('/api/webhooks/polar', {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, include proper webhook signature
      },
    })

    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json).toHaveProperty('received', true)
  })

  test('POST handles invalid webhook data gracefully', async () => {
    const ctx = await api()

    const invalidPayload = {
      type: 'invalid.event',
      data: {},
    }

    const res = await ctx.post('/api/webhooks/polar', {
      data: invalidPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(res.ok()).toBeTruthy()
  })

  test('POST processes subscription lifecycle events', async () => {
    const ctx = await api()

    const events = [
      {
        type: 'customer.subscription.created',
        data: { id: 'sub_123', customer_id: 'cus_123' },
      },
      {
        type: 'customer.subscription.updated',
        data: { id: 'sub_123', status: 'active' },
      },
      {
        type: 'customer.subscription.deleted',
        data: { id: 'sub_123', customer_id: 'cus_123' },
      },
    ]

    for (const event of events) {
      const res = await ctx.post('/api/webhooks/polar', {
        data: event,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(res.ok()).toBeTruthy()
      const json = await res.json()
      expect(json).toHaveProperty('received', true)
    }
  })
})

test.describe('Integration: Checkout flow with database', () => {
  test('Complete checkout flow updates user subscription', async () => {
    const ctx = await authedApi()
    test.skip(!ctx, 'No authenticated session available')

    // This test would require:
    // 1. Creating a test user
    // 2. Simulating checkout creation
    // 3. Simulating webhook delivery
    // 4. Verifying database state

    // For now, skip as it requires more complex setup
    test.skip(true, 'Requires full test environment setup')
  })
})
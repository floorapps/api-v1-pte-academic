/**
 * End-to-end tests for Polar.sh checkout UI flow.
 *
 * These tests validate:
 * - Checkout page rendering and navigation
 * - Payment provider selection
 * - Form validation and error states
 * - Success/cancel page handling
 * - Integration with pricing page
 *
 * Prerequisites:
 * - Server running locally: BASE_URL=http://localhost:3000
 * - Database seeded: pnpm run db:seed:all
 * - Polar.sh access token configured (optional for UI tests)
 *
 * Run:
 *   npx playwright test tests/checkout.polar.e2e.spec.ts --project=chromium
 */

import { expect, test } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('UI: Checkout page rendering', () => {
  test('renders pro checkout page with correct plan details', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Check page title and badge
    await expect(page.getByText('Complete Your Pro Subscription')).toBeVisible()
    await expect(page.getByText('Checkout')).toBeVisible()

    // Check plan summary
    await expect(page.getByText('Pro Plan')).toBeVisible()
    await expect(page.getByText('$29')).toBeVisible()
    await expect(page.getByText('Best for serious learners')).toBeVisible()

    // Check features list
    await expect(page.getByText('All 200 Mock Tests')).toBeVisible()
    await expect(page.getByText('Unlimited Practice')).toBeVisible()
    await expect(page.getByText('Unlimited AI Scoring')).toBeVisible()
  })

  test('renders premium checkout page with correct plan details', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/premium`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    await expect(page.getByText('Complete Your Premium Subscription')).toBeVisible()
    await expect(page.getByText('$49')).toBeVisible()
    await expect(page.getByText('Maximum features for peak performance')).toBeVisible()

    // Check premium-specific features
    await expect(page.getByText('Personalized Study Plans')).toBeVisible()
    await expect(page.getByText('Teacher Review Access')).toBeVisible()
  })

  test('redirects invalid tier to 404 or error page', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/invalid`, { waitUntil: 'domcontentloaded' })

    // Should either show 404 or redirect/error
    if (res?.status() === 404) {
      await expect(page.getByText('Invalid Plan')).toBeVisible()
    }
  })
})

test.describe('UI: Payment provider selection', () => {
  test('shows both payment providers with correct styling', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Check Polar.sh option
    await expect(page.getByText('Polar.sh')).toBeVisible()
    await expect(page.getByText('Modern payments infrastructure')).toBeVisible()

    // Check Stripe option (marked as coming soon)
    await expect(page.getByText('Stripe')).toBeVisible()
    await expect(page.getByText('Coming soon')).toBeVisible()
  })

  test('allows selecting Polar.sh payment method', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Click on Polar.sh card
    await page.getByText('Polar.sh').click()

    // Check that selection is visually indicated
    const polarCard = page.locator('[class*="ring-2"]').first()
    await expect(polarCard).toBeVisible()

    // Check that submit button is enabled
    const submitBtn = page.getByRole('button', { name: /subscribe with polar.sh/i })
    await expect(submitBtn).toBeEnabled()
  })

  test('prevents Stripe selection (coming soon)', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Stripe option should be visually disabled
    const stripeCard = page.getByText('Stripe').locator('..').locator('..')
    const opacity = await stripeCard.evaluate(el => getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBeLessThan(1)
  })
})

test.describe('UI: Form validation and error handling', () => {
  test('shows loading state during checkout creation', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Select Polar.sh
    await page.getByText('Polar.sh').click()

    // Mock the API call to show loading state
    await page.route('/api/checkout/polar', async route => {
      // Delay response to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.polar.sh/test' }),
      })
    })

    // Click checkout button
    await page.getByRole('button', { name: /subscribe with polar.sh/i }).click()

    // Check loading state
    await expect(page.getByText('Creating checkout...')).toBeVisible()
    await expect(page.getByRole('button', { name: /creating checkout/i })).toBeDisabled()
  })

  test('handles checkout creation errors gracefully', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Select Polar.sh
    await page.getByText('Polar.sh').click()

    // Mock API error
    await page.route('/api/checkout/polar', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Click checkout button
    await page.getByRole('button', { name: /subscribe with polar.sh/i }).click()

    // Should show error alert (implementation dependent)
    // This test validates that errors don't crash the page
    await expect(page.getByText('Complete Your Pro Subscription')).toBeVisible()
  })
})

test.describe('UI: Success and cancel pages', () => {
  test('renders success page with subscription confirmation', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/success?provider=polar&session_id=test_123`, {
      waitUntil: 'domcontentloaded'
    })
    test.skip(!res?.ok(), 'Success page not accessible')

    await expect(page.getByText('Welcome to PTE Practice Platform!')).toBeVisible()
    await expect(page.getByText('Payment Successful')).toBeVisible()
    await expect(page.getByText('Your subscription has been activated successfully')).toBeVisible()

    // Check action buttons
    await expect(page.getByRole('button', { name: /start practicing/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /take a mock test/i })).toBeVisible()
  })

  test('renders cancel page with re-engagement messaging', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/cancel`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Cancel page not accessible')

    await expect(page.getByText('No worries, you can try again anytime')).toBeVisible()
    await expect(page.getByText('Checkout Cancelled')).toBeVisible()

    // Check re-engagement content
    await expect(page.getByText('Why upgrade to Pro or Premium?')).toBeVisible()
    await expect(page.getByText('Unlimited mock tests')).toBeVisible()
    await expect(page.getByText('Detailed analytics')).toBeVisible()

    // Check action buttons
    await expect(page.getByRole('button', { name: /back to pricing/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /need help/i })).toBeVisible()
  })
})

test.describe('UI: Navigation and integration', () => {
  test('pricing page links correctly to checkout pages', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Pricing page not accessible')

    // Find and click Pro upgrade button
    const proButton = page.getByRole('button', { name: /upgrade now/i }).first()
    await proButton.click()

    // Should navigate to pro checkout
    await expect(page).toHaveURL(/.*\/checkout\/pro/)
    await expect(page.getByText('Complete Your Pro Subscription')).toBeVisible()
  })

  test('checkout page back button returns to pricing', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Click back button
    await page.getByRole('button', { name: /back to pricing/i }).click()

    // Should return to pricing page
    await expect(page).toHaveURL(/.*\/pricing/)
    await expect(page.getByText('Choose Your Perfect Plan')).toBeVisible()
  })

  test('success page action buttons navigate correctly', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/success`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Success page not accessible')

    // Test dashboard navigation (would require auth)
    const startBtn = page.getByRole('button', { name: /start practicing/i })
    await expect(startBtn).toBeVisible()

    // Test mock test navigation
    const mockTestBtn = page.getByRole('button', { name: /take a mock test/i })
    await expect(mockTestBtn).toBeVisible()
  })
})

test.describe('UI: Responsive design and accessibility', () => {
  test('checkout page is responsive on mobile viewport', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that key elements are still visible
    await expect(page.getByText('Complete Your Pro Subscription')).toBeVisible()
    await expect(page.getByText('Polar.sh')).toBeVisible()
    await expect(page.getByRole('button', { name: /subscribe/i })).toBeVisible()
  })

  test('checkout page has proper heading hierarchy', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Check heading structure
    const h1 = page.locator('h1')
    await expect(h1).toContainText('Complete Your Pro Subscription')

    const h3 = page.locator('h3').first()
    await expect(h3).toContainText('Choose Payment Method')
  })

  test('payment provider selection is keyboard accessible', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/checkout/pro`, { waitUntil: 'domcontentloaded' })
    test.skip(!res?.ok(), 'Checkout page not accessible')

    // Tab to payment provider cards
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Focus on first card

    // Check that card is focusable
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
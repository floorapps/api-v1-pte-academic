'use server'

import { setCookieConsent, type CookieConsent } from '@/lib/cookies'

export async function acceptAllCookies() {
  const consent: CookieConsent = {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  }
  await setCookieConsent(consent)
}

export async function rejectAllCookies() {
  const consent: CookieConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  }
  await setCookieConsent(consent)
}

export async function saveCookiePreferences(consent: CookieConsent) {
  const normalized: CookieConsent = {
    necessary: true,
    analytics: !!consent.analytics,
    marketing: !!consent.marketing,
    preferences: !!consent.preferences,
  }
  await setCookieConsent(normalized)
}
export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const COOKIE_CONSENT_NAME = 'cookie-consent'
const COOKIE_CONSENT_EXPIRY = 365

export const clientCookies = {
  getConsent(): CookieConsent | null {
    if (typeof window === 'undefined') return null
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_CONSENT_NAME}=`))
    if (!cookie) return null
    try {
      const value = cookie.split('=')[1]
      return JSON.parse(decodeURIComponent(value))
    } catch {
      return null
    }
  },
  setConsent(consent: CookieConsent): void {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + COOKIE_CONSENT_EXPIRY)
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
      JSON.stringify(consent)
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  },
  hasConsent(category: keyof CookieConsent): boolean {
    const consent = this.getConsent()
    return consent?.[category] ?? false
  },
}
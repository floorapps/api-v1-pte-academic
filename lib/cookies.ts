import { cookies } from 'next/headers'

export interface CookieConsent {
    necessary: boolean
    analytics: boolean
    marketing: boolean
    preferences: boolean
}

const COOKIE_CONSENT_NAME = 'cookie-consent'
const COOKIE_CONSENT_EXPIRY = 365 // days

/**
 * Get current cookie consent preferences
 */
export async function getCookieConsent(): Promise<CookieConsent | null> {
    const cookieStore = await cookies()
    const consentCookie = cookieStore.get(COOKIE_CONSENT_NAME)

    if (!consentCookie) return null

    try {
        return JSON.parse(consentCookie.value) as CookieConsent
    } catch {
        return null
    }
}

/**
 * Set cookie consent preferences
 */
export async function setCookieConsent(consent: CookieConsent): Promise<void> {
    const cookieStore = await cookies()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + COOKIE_CONSENT_EXPIRY)

    cookieStore.set(COOKIE_CONSENT_NAME, JSON.stringify(consent), {
        expires: expiryDate,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })
}

/**
 * Check if user has given consent for a specific category
 */
export async function hasConsent(category: keyof CookieConsent): Promise<boolean> {
    const consent = await getCookieConsent()
    return consent?.[category] ?? false
}

/**
 * Client-side cookie consent utilities
 */
export const clientCookies = {
    getConsent(): CookieConsent | null {
        if (typeof window === 'undefined') return null

        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${COOKIE_CONSENT_NAME}=`))

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

        document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    },

    hasConsent(category: keyof CookieConsent): boolean {
        const consent = this.getConsent()
        return consent?.[category] ?? false
    }
}

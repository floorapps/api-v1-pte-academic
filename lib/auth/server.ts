import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { auth } from './auth'

// Re-export auth for convenience
export { auth }

/**
 * Get the current session (cached per request)
 * Compatible with Next.js 16 async Request APIs
 */
export const getSession = cache(async () => {
  try {
    // Try to read request headers when available (runtime request)
    let hdrs: Headers | undefined
    try {
      hdrs = await headers()
    } catch {
      // During prerender or non-request contexts, headers() rejects. We ignore and fallback.
      hdrs = undefined
    }

    const session = await auth.api.getSession({
      headers: hdrs ?? new Headers(),
    })

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
})

/**
 * Get the current user (cached per request)
 */
export const getCurrentUser = cache(async () => {
  try {
    const session = await getSession()
    return session?.user ?? null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
})

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

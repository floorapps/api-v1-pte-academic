import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy to protect sensitive routes in production
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl


  // Disable seed routes in production
  if (process.env.NODE_ENV === 'production' && pathname.includes('/seed')) {
    console.warn(`[Security] Blocked access to seed route: ${pathname}`)
    return new NextResponse(
      JSON.stringify({
        error: 'Not Found',
        message: 'This endpoint is not available in production',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Add security headers
  const response = NextResponse.next()

  // Only set headers if not already set by vercel.json
  if (!response.headers.has('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  if (!response.headers.has('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }
  if (!response.headers.has('X-XSS-Protection')) {
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }
  if (!response.headers.has('Referrer-Policy')) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  return response
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
}

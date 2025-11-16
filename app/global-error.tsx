'use client'

import { useEffect } from 'react'
import Rollbar from 'rollbar'
import { rollbarConfig } from '@/lib/rollbar'

const rollbar = new Rollbar(rollbarConfig)

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Rollbar
    if (process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN) {
      rollbar.error(error, {
        digest: error.digest,
        source: 'global-error',
      })
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
            <p className="mb-6 text-muted-foreground">
              We've been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

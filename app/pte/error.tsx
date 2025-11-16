'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PteErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PteErrorBoundary({ error, reset }: PteErrorProps) {
  useEffect(() => {
    console.error('PTE route error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-3xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border-red-100 bg-red-50/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-red-900">
                Something went wrong in the PTE area
              </CardTitle>
              <p className="text-sm text-red-700">
                This looks like an internal error. You can try again or go back to
                your dashboard.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={() => reset()}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/pte/dashboard">Go to PTE dashboard</Link>
              </Button>
            </div>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-4 max-h-48 overflow-auto rounded bg-red-100 p-3 text-xs text-red-900">
                {error.message}
                {error.digest ? `\n\nDigest: ${error.digest}` : null}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
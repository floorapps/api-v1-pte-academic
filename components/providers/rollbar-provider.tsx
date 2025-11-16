'use client'

import { Provider, ErrorBoundary, LEVEL_WARN } from '@rollbar/react'
import Rollbar from 'rollbar'
import { ReactNode } from 'react'
import { rollbarConfig } from '@/lib/rollbar'

const rollbarClient = new Rollbar(rollbarConfig)

interface RollbarProviderProps {
  children: ReactNode
}

export function RollbarProvider({ children }: RollbarProviderProps) {
  // Only enable Rollbar if token is configured
  if (!process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN) {
    return <>{children}</>
  }

  return (
    <Provider instance={rollbarClient}>
      <ErrorBoundary level={LEVEL_WARN}>
        {children}
      </ErrorBoundary>
    </Provider>
  )
}

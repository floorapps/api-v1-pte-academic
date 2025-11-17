import { headers } from 'next/headers'
import { NonceProvider } from './nonce-provider'
import { RollbarProvider } from './providers/rollbar-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ThemeProvider } from './theme-provider'

export async function NonceWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <NonceProvider nonce={nonce}>
      <RollbarProvider>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </RollbarProvider>
    </NonceProvider>
  )
}
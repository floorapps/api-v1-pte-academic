import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { Suspense } from 'react'
import { NonceWrapper } from '@/components/nonce-wrapper'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Pedagogists PTE',
  description:
    'PTE Academic preparation platform with AI-powered practice and scoring.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable}`} suppressHydrationWarning>
      <body className={`min-h-[100dvh] ${manrope.className} antialiased`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <NonceWrapper>
            {children}
            <Toaster />
          </NonceWrapper>
        </Suspense>
      </body>
    </html>
  )
}

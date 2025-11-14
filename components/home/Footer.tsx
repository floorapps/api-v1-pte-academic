import React from 'react'
import Link from 'next/link'
import CurrentYear from '@/components/current-year'

export default function Footer() {
  return (
    <footer className="bg-background text-foreground border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold">Pedagogist's PTE</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm">
              AI-powered PTE Academic practice with mock tests and instant feedback.
            </p>
          </div>

          <nav aria-label="Product">
            <h3 className="mb-3 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pte/academic/practice" className="text-muted-foreground hover:text-foreground">
                  Practice
                </Link>
              </li>
              <li>
                <Link href="/pte/mock-tests" className="text-muted-foreground hover:text-foreground">
                  Mock Tests
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Resources">
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="mb-3 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-muted-foreground hover:text-foreground">
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/gdpr" className="text-muted-foreground hover:text-foreground">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="/legal/accessibility" className="text-muted-foreground hover:text-foreground">
                  Accessibility
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs sm:text-sm">
            © <CurrentYear /> Pedagogist's PTE. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" aria-label="Twitter" className="hover:text-foreground text-xs sm:text-sm">
              Twitter
            </Link>
            <Link href="#" aria-label="YouTube" className="hover:text-foreground text-xs sm:text-sm">
              YouTube
            </Link>
            <Link href="#" aria-label="LinkedIn" className="hover:text-foreground text-xs sm:text-sm">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Legal - Pedagogist's PTE",
  description: "Legal information, policies, and terms",
}

const legalPages = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/refund", label: "Refund Policy" },
  { href: "/legal/gdpr", label: "GDPR Compliance" },
  { href: "/legal/accessibility", label: "Accessibility" },
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="font-bold">Pedagogist's PTE</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <nav className="sticky top-20 space-y-1">
              <h3 className="mb-4 text-lg font-semibold">Legal Information</h3>
              {legalPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {page.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Page Content */}
          <main className="flex-1">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Pedagogist's PTE. All rights reserved.
          </p>
          <p className="mt-2">
            Questions? <Link href="/contact" className="underline">Contact us</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

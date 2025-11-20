'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserNav } from '@/components/user-nav'

export function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [resultsOpen, setResultsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const debouncedQuery = query
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([])
      setResultsOpen(false)
      return
    }
    if (controllerRef.current) controllerRef.current.abort()
    const c = new AbortController()
    controllerRef.current = c
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`, {
          signal: c.signal,
        })
        const data = await res.json()
        setSearchResults(Array.isArray(data.results) ? data.results.slice(0, 6) : [])
        setResultsOpen(true)
      } catch {}
    }, 250)
    return () => clearTimeout(t)
  }, [debouncedQuery])

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 transition-transform group-hover:scale-105">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="text-foreground hidden text-lg font-bold sm:inline-block">
              Pedagogist&apos;s PTE
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Popover>
              <PopoverTrigger className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors inline-flex items-center gap-1">
                Explore
                <ChevronDown className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[660px] p-0">
                <div className="grid grid-cols-3 gap-0">
                  <Link href="#features" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Features</span>
                    <span className="text-muted-foreground text-xs">Practice, scoring, analytics</span>
                  </Link>
                  <Link href="#question-types" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Question Types</span>
                    <span className="text-muted-foreground text-xs">Speaking, Writing, Reading</span>
                  </Link>
                  <Link href="/pricing" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Pricing</span>
                    <span className="text-muted-foreground text-xs">Plans that fit you</span>
                  </Link>
                  <Link href="/blog" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Blog</span>
                    <span className="text-muted-foreground text-xs">Guides and updates</span>
                  </Link>
                  <Link href="/contact" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Contact</span>
                    <span className="text-muted-foreground text-xs">Get help fast</span>
                  </Link>
                  <Link href="/pte/dashboard" className="hover:bg-accent flex flex-col gap-1 p-4">
                    <span className="text-sm font-semibold">Dashboard</span>
                    <span className="text-muted-foreground text-xs">Start practicing</span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative w-[340px]">
                <Input
                  placeholder="Search blog and practice"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query && setResultsOpen(true)}
                  onBlur={() => setTimeout(() => setResultsOpen(false), 200)}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {resultsOpen && searchResults.length > 0 && (
                  <div className="border bg-popover text-popover-foreground absolute left-0 right-0 top-10 z-50 rounded-md shadow-md">
                    <div className="flex flex-col p-2">
                      {searchResults.map((r, i) => (
                        <Link key={i} href={r.url || '/blog'} className="hover:bg-accent rounded-sm px-2 py-2 text-sm">
                          {r.title || r.name || 'Result'}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <UserNav />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-border/40 border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground px-2 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#question-types"
                className="text-muted-foreground hover:text-foreground px-2 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Question Types
              </Link>
              <Link
                href="/pte/dashboard"
                className="text-muted-foreground hover:text-foreground px-2 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="border-border/40 flex gap-2 border-t px-2 pt-2">
                <Button asChild variant="ghost" size="sm" className="flex-1">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

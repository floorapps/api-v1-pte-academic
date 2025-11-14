'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { signOutAction } from '@/lib/auth/actions'
import { User } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function UserMenu() {
  const { data: user, error } = useSWR<User>('/api/user', fetcher, {
    onError: (err) => {
      console.error('SWR Error:', err)
    },
    // Don't retry on error to prevent infinite loops
    errorRetryCount: 0,
  })

  // If there's an error, show login options
  if (error) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    )
  }

  // If no user, show login options
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="size-9 cursor-pointer">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {(user.email || user.name || 'U')
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <span className="ml-2 text-xl font-bold">
            Pedagogist&apos;s PTE
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <ThemeSwitcher />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-screen flex-col">
      <Header />
      {children}
    </section>
  )
}

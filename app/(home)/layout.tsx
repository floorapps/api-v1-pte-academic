'use client'

import { Suspense, memo, useMemo } from 'react'
import Link from 'next/link'
import { LogOut, Menu, BookOpen, BarChart3, LayoutGrid, FileText, Layers, Sparkles, User as UserIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CookieConsentBanner } from '@/components/cookie-consent'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const UserMenu = memo(function UserMenu() {
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
    <Link href="/pte/dashboard">Go to Dashboard</Link>
   </Button>
   <DropdownMenu>
    <DropdownMenuTrigger aria-haspopup="menu" aria-label="Open user menu" className="inline-flex items-center justify-center rounded-full outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors hover:bg-accent hover:text-accent-foreground">
     <Avatar className="size-9 md:size-10">
      <AvatarImage alt={user.name || ''} src={(user as any).image || ''} />
      <AvatarFallback>
       {(user.email || user.name || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')}
      </AvatarFallback>
     </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-48 p-2">
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
})

const Header = memo(function Header() {
 const pathname = usePathname()
 const baseLinkClass = 'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
 const activeClass = 'text-foreground font-medium'
 const linkClass = (href: string) =>
  `${baseLinkClass} ${pathname === href ? activeClass : ''}`
 const menu = useMemo(
  () => [
   {
    title: 'Practice',
    items: [
     { href: '/pte/academic/practice', label: 'Academic Practice', icon: BookOpen },
     { href: '/pte/templates', label: 'Templates', icon: FileText },
     { href: '/pte/vocab-books', label: 'Vocab Books', icon: Layers },
     { href: '/pte/shadowing', label: 'Shadowing', icon: LayoutGrid },
    ],
   },
   {
    title: 'Tests',
    items: [
     { href: '/pte/mock-tests', label: 'Mock Tests', icon: Sparkles },
     { href: '/pte/mock-tests/sectional', label: 'Sectional Tests', icon: Sparkles },
    ],
   },
   {
    title: 'Insights',
    items: [
     { href: '/pte/analytics', label: 'Analytics', icon: BarChart3 },
     { href: '/pte/profile', label: 'Profile', icon: UserIcon },
    ],
   },
   {
    title: 'Resources',
    items: [
     { href: '/blog', label: 'Blog', icon: FileText },
     { href: '/contact', label: 'Contact', icon: FileText },
    ],
   },
  ],
  []
 )
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
     <nav className="hidden md:flex items-center gap-6 mr-4" role="navigation" aria-label="Primary">
      <Popover>
       <PopoverTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
        Explore
       </PopoverTrigger>
       <PopoverContent align="start" className="w-[min(90vw,52rem)] p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
         {menu.slice(0, 3).map((section) => (
          <div key={section.title}>
           <div className="text-xs uppercase text-muted-foreground mb-2">{section.title}</div>
           <div className="flex flex-col gap-2">
            {section.items.map(({ href, label, icon: Icon }) => (
             <Link key={href} href={href} className="hover:text-foreground inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
             </Link>
            ))}
           </div>
          </div>
         ))}
         <div className="md:block hidden">
          <div className="text-xs uppercase text-muted-foreground mb-2">{menu[3].title}</div>
          <div className="flex flex-col gap-2">
           {menu[3].items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="hover:text-foreground inline-flex items-center gap-2">
             <Icon className="h-4 w-4 text-muted-foreground" />
             {label}
            </Link>
           ))}
          </div>
         </div>
        </div>
       </PopoverContent>
      </Popover>
      <Link href="/blog" className={linkClass('/blog')} aria-current={pathname === '/blog' ? 'page' : undefined}>
       Blog
      </Link>
      <Link href="/pricing" className={linkClass('/pricing')} aria-current={pathname === '/pricing' ? 'page' : undefined}>
       Pricing
      </Link>
      <Link href="/contact" className={linkClass('/contact')} aria-current={pathname === '/contact' ? 'page' : undefined}>
       Contact
      </Link>
     </nav>
     <ThemeSwitcher />
     <Suspense fallback={<div className="h-9" />}>
      <UserMenu />
     </Suspense>
     <Sheet>
      <SheetTrigger aria-label="Open menu" className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none">
       <Menu className="size-5" />
       <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
       <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
       </SheetHeader>
       <div className="flex flex-col py-2">
        <Link href="/blog" className="px-4 py-3 text-base hover:bg-accent hover:text-accent-foreground" aria-label="Go to Blog">
         Blog
        </Link>
        <Link href="/pricing" className="px-4 py-3 text-base hover:bg-accent hover:text-accent-foreground" aria-label="Go to Pricing">
         Pricing
        </Link>
        <Link href="/contact" className="px-4 py-3 text-base hover:bg-accent hover:text-accent-foreground" aria-label="Go to Contact">
         Contact
        </Link>
        <div className="mt-2 border-t" />
        <Link href="/pte/dashboard" className="px-4 py-3 text-base hover:bg-accent hover:text-accent-foreground" aria-label="Go to Dashboard">
         Go to Dashboard
        </Link>
       </div>
      </SheetContent>
     </Sheet>
    </div>
   </div>
  </header>
 )
})

export default function HomeLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <section className="flex min-h-screen flex-col">
   <Header />
   {children}
   <CookieConsentBanner />
  </section>
 )
}

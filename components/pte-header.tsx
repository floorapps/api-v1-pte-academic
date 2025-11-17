'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Brain,
  GraduationCap,
  Menu,
  MessageCircle,
  Settings,
  Target,
  User,
  Users,
} from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { UserNav } from '@/components/user-nav'

export function PTEHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { title: 'Dashboard', href: '/pte/dashboard', icon: BarChart3 },
    { title: 'Practice', href: '/pte/academic/practice', icon: BookOpen },
    { title: 'Mock Tests', href: '/pte/mock-tests', icon: GraduationCap },
    { title: 'Analytics', href: '/pte/analytics', icon: BarChart3 },
    { title: 'AI Coach', href: '/pte/ai-coach', icon: Brain },
    { title: 'Study Center', href: '/pte/study-center', icon: GraduationCap },
    { title: 'Community', href: '/pte/community', icon: Users },
    { title: 'Profile', href: '/pte/profile', icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/pte/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">PTE Prep</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-4 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-1 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            <ModeToggle />
            <UserNav />

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4">
                  <Link
                    href="/pte/dashboard"
                    className="mb-4 flex items-center space-x-2"
                  >
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-bold">PTE Prep</span>
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                            pathname === item.href ||
                            pathname.startsWith(item.href + '/')
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

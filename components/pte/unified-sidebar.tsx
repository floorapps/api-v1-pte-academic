'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  FileCheck,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Mic,
  PenSquare,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: ReactNode
  children?: NavItem[]
  badge?: string
}

const navigationSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: '/pte/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        title: 'Practice',
        href: '/pte/academic/practice',
        icon: <BookOpen className="h-5 w-5" />,
        children: [
          {
            title: 'Speaking',
            href: '/pte/academic/practice/speaking',
            icon: <Mic className="h-4 w-4" />,
          },
          {
            title: 'Writing',
            href: '/pte/academic/practice/writing',
            icon: <PenSquare className="h-4 w-4" />,
          },
          {
            title: 'Reading',
            href: '/pte/academic/practice/reading',
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            title: 'Listening',
            href: '/pte/academic/practice/listening',
            icon: <Headphones className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Section Tests',
        href: '/pte/academic/practice/section-tests',
        icon: <FileCheck className="h-5 w-5" />,
        children: [
          {
            title: 'Speaking Tests',
            href: '/pte/academic/practice/section-tests/speaking',
            icon: <Mic className="h-4 w-4" />,
          },
          {
            title: 'Writing Tests',
            href: '/pte/academic/practice/section-tests/writing',
            icon: <PenSquare className="h-4 w-4" />,
          },
          {
            title: 'Reading Tests',
            href: '/pte/academic/practice/section-tests/reading',
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            title: 'Listening Tests',
            href: '/pte/academic/practice/section-tests/listening',
            icon: <Headphones className="h-4 w-4" />,
          },
        ],
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Mock Tests',
        href: '/pte/mock-tests',
        icon: <GraduationCap className="h-5 w-5" />,
        badge: '200+',
      },
      {
        title: 'Templates',
        href: '/pte/templates',
        icon: <FileCheck className="h-5 w-5" />,
      },
      {
        title: 'Study Center',
        href: '/pte/study-center',
        icon: <GraduationCap className="h-5 w-5" />,
      },
      {
        title: 'Analytics',
        href: '/pte/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Community & Support',
    items: [
      {
        title: 'Community',
        href: '/pte/community',
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: 'AI Coach',
        href: '/pte/ai-coach',
        icon: <Bot className="h-5 w-5" />,
      },
      {
        title: 'Support',
        href: '/pte/support',
        icon: <MessageCircle className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Settings',
        href: '/pte/academic/settings',
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
]

interface SidebarMenuItemProps {
  item: NavItem
  isMobile?: boolean
  onNavigate?: () => void
}

function SidebarMenuItem({ item, isMobile = false, onNavigate }: SidebarMenuItemProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

  const handleToggle = () => {
    if (item.children) {
      setIsExpanded(!isExpanded)
    }
  }

  const linkClasses = cn(
    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    isActive
      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
      : 'text-sidebar-foreground',
    'w-full'
  )

  const buttonClasses = cn(
    'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    isActive
      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
      : 'text-sidebar-foreground',
    'w-full'
  )

  return (
    <div>
      {item.children ? (
        <button
          onClick={handleToggle}
          className={buttonClasses}
          aria-expanded={isExpanded}
          aria-label={`${item.title} menu${isExpanded ? ', expanded' : ', collapsed'}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center">
              {item.icon}
            </span>
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {item.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      ) : (
        <Link
          href={item.href}
          onClick={onNavigate}
          className={linkClasses}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="flex h-5 w-5 items-center justify-center">
            {item.icon}
          </span>
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              {item.badge}
            </span>
          )}
        </Link>
      )}

      {item.children && isExpanded && (
        <div className="mt-1 space-y-1 pl-6">
          {item.children.map((child) => (
            <SidebarMenuItem
              key={child.href}
              item={child}
              isMobile={isMobile}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DesktopSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function DesktopSidebar({ isCollapsed, onToggleCollapse }: DesktopSidebarProps) {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-40 h-screen border-r bg-sidebar transition-all duration-300 ease-out',
        'flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href="/pte/dashboard"
          className="flex items-center gap-2 transition-all duration-200"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="font-bold">P</span>
          </div>
          {!isCollapsed && (
            <span className="text-sidebar-foreground text-sm font-semibold">
              PTE Academy
            </span>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            aria-label="Collapse sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarMenuItem
                    key={item.href}
                    item={item}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <p className="text-sidebar-accent-foreground text-xs font-medium">
              PTE Academic Platform
            </p>
            <p className="text-sidebar-accent-foreground/70 text-xs">v1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface MobileSidebarContentProps {
  onNavigate?: () => void
}

function MobileSidebarContent({ onNavigate }: MobileSidebarContentProps) {
  return (
    <nav className="space-y-6 px-3 py-4">
      {navigationSections.map((section) => (
        <div key={section.title} className="space-y-1">
          <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
            {section.title}
          </h3>
          {section.items.map((item) => (
            <SidebarMenuItem
              key={item.href}
              item={item}
              isMobile={true}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

export function UnifiedSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleMobileNavigate = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DesktopSidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="bg-sidebar w-64 p-0 lg:hidden">
          <SheetHeader className="border-sidebar-border border-b px-4 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="font-bold">P</span>
                </div>
                <span className="text-sidebar-foreground">PTE Academy</span>
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobile}
                className="h-8 w-8 p-0"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <MobileSidebarContent onNavigate={handleMobileNavigate} />
        </SheetContent>
      </Sheet>

      {/* Mobile toggle function - to be called by parent */}
      <div className="hidden">
        <button
          onClick={toggleMobile}
          className="mobile-sidebar-toggle"
          aria-label="Toggle mobile sidebar"
        />
      </div>
    </>
  )
}

// Export utilities for parent components
export const useSidebarToggle = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  return {
    isMobileOpen,
    toggleMobile: () => setIsMobileOpen(!isMobileOpen),
  }
}

export default UnifiedSidebar
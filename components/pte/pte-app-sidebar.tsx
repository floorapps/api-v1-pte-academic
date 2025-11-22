"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  FileText,
  Headphones,
  ClipboardList,
  History,
  Users,
  Bot,
  Video,
  BookMarked,
  TestTube2,
  ListChecks,
} from "lucide-react"

import { NavMainPTE } from "@/components/pte/nav-main-pte"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const navMain = [
  {
    title: "Overview",
    url: "/pte/dashboard",
    icon: LayoutDashboard,
    isActive: false,
  },
  {
    title: "Practice",
    url: "/pte/academic/practice",
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: "Speaking",
        url: "/pte/academic/practice/speaking",
      },
      {
        title: "Writing",
        url: "/pte/academic/practice/writing",
      },
      {
        title: "Reading",
        url: "/pte/academic/practice/reading",
      },
      {
        title: "Listening",
        url: "/pte/academic/practice/listening",
      },
    ],
  },
  {
    title: "Mock Tests",
    url: "/pte/mock-tests",
    icon: TestTube2,
    items: [
      {
        title: "Full Mock Tests",
        url: "/pte/mock-tests",
      },
      {
        title: "Sectional Tests",
        url: "/pte/mock-tests/sectional",
      },
    ],
  },
  {
    title: "Test History",
    url: "/pte/academic/practice-attempts",
    icon: History,
  },
  {
    title: "Community",
    url: "/pte/community",
    icon: Users,
  },
  {
    title: "AI Agents",
    url: "/pte/ai-coach",
    icon: Bot,
  },
  {
    title: "Live Class",
    url: "/pte/study-center",
    icon: Video,
  },
  {
    title: "Resources",
    url: "/pte/templates",
    icon: BookMarked,
    items: [
      {
        title: "Templates",
        url: "/pte/templates",
      },
      {
        title: "Vocabulary",
        url: "/pte/vocab-books",
      },
      {
        title: "Shadowing",
        url: "/pte/shadowing",
      },
    ],
  },
]

export function PTEAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/pte/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/assets/pedagogist-logo.png" alt="Pedagogist" className="size-8 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Pedagogist</span>
                  <span className="truncate text-xs">AI Learning Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainPTE items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

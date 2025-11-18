'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  IconBook,
  IconBulb,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconEar,
  IconFileCheck,
  IconPlayerPlay,
  IconStar,
  IconTemplate,
  IconVocabulary,
  IconWaveSine,
} from '@tabler/icons-react'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User as UserType } from '@/lib/db/schema'

// Dynamic imports for heavy components (code splitting)
// These components load only when needed, reducing initial bundle size
const ExamDateScheduler = dynamic(
  () =>
    import('@/components/pte/dashboard/exam-date-scheduler').then(
      (mod) => mod.ExamDateScheduler
    ),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Exam Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    ),
  }
)

const PracticeProgressWidget = dynamic(
  () =>
    import('@/components/pte/dashboard/practice-progress-widget').then(
      (mod) => mod.PracticeProgressWidget
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
    ),
  }
)

const TargetScoreWidget = dynamic(
  () =>
    import('@/components/pte/dashboard/target-score-widget').then(
      (mod) => mod.TargetScoreWidget
    ),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Target Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    ),
  }
)

type UIUser = UserType & {
  examDate?: string | Date | null
  targetScore?: number | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: featureStats } = useSWR('/api/dashboard/feature-stats', fetcher)
  const { data: studyToolsProgress } = useSWR('/api/dashboard/study-tools-progress', fetcher)
  const { data: user, error: userError } = useSWR<UIUser>('/api/user', fetcher)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('loggedin')) {
      toast.success('Logged in successfully!')
      // Remove the query param to avoid showing the toast on refresh.
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [searchParams])

  if (userError) return <div>Failed to load dashboard data.</div>
  if (!user) return <div>Loading...</div>

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="flex flex-col items-center justify-between p-6 md:flex-row">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">
              Welcome to your PTE Practice Hub
            </h2>
            <p className="text-gray-300">
              Get full access to all features and tools to help you prepare for
              the PTE exam.
            </p>
          </div>
          <Button variant="secondary" size="lg">
            Get VIP Now
          </Button>
        </div>
      </Card>

      {/* Practice Progress Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Your Practice Progress
        </h2>
        <PracticeProgressWidget />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <IconBook className="mb-2 h-8 w-8 text-blue-500" />
                <CardTitle>PTE Practice</CardTitle>
                <CardDescription>5000+ Questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Practice questions for PTE exam by question type
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <IconFileCheck className="mb-2 h-8 w-8 text-green-500" />
                <CardTitle>Mock Tests</CardTitle>
                <CardDescription>200+ Tests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Simulate real exam conditions with mock tests
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <IconTemplate className="mb-2 h-8 w-8 text-purple-500" />
                <CardTitle>Templates</CardTitle>
                <CardDescription>20+ Templates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get access to pre-written templates
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconStar className="h-6 w-6 text-yellow-500" />
                  Take free Mock Test with AI scoring
                </CardTitle>
              </div>
              <Button variant="default" size="sm">
                Try Mini Mock Test <IconChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500" /> AI score +
                  personalized feedback
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500" /> Total 19-21
                  questions
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500" /> Estimated
                  time 30+ minutes
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Study Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                <div className="space-y-2">
                  <IconBulb className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-gray-600">
                    Buy VIP to see question types you should focus on.
                  </p>
                  <Button variant="outline">Buy VIP</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Guide</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Study Guide */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    New PTE Academic Summarize Group Discussion Guide
                  </h3>
                  <p className="text-sm text-gray-500">July 20, 2025</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">
                    How to Improve Your Listening Skills
                  </h3>
                  <p className="text-sm text-gray-500">July 27, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Dashboard Widgets */}
        <div className="space-y-6">
          <TargetScoreWidget />
          <ExamDateScheduler />

          <Card>
            <CardHeader>
              <CardTitle>Study Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <IconVocabulary className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium">Vocab Books</p>
              </div>
              <div className="text-center">
                <IconWaveSine className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p className="text-sm font-medium">Shadowing</p>
              </div>
              <div className="text-center">
                <IconEar className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <p className="text-sm font-medium">OnePTE MP3</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

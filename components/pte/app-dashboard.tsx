'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  BookOpen,
  FileText,
  Layout,
  Mic,
  Play,
  Trophy,
  Zap,
  CheckCircle2,
  Target,
  Headphones,
  BookMarked,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExamDateScheduler } from '@/components/pte/dashboard/exam-date-scheduler'
import { cn } from '@/lib/utils'

const studyGuides = [
  {
    id: 1,
    title: 'Using Podcasts to Improve Your PTE Listening Score',
    date: 'October 26, 2025',
    image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 2,
    title: 'How to Use Note-taking Techniques for PTE Success',
    date: 'October 26, 2025',
    image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'A Practical Guide to Using the Official PTE Collocation List',
    date: 'October 26, 2025',
    image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 4,
    title: 'New PTE Academic Summarize Group Discussion Guide',
    date: 'July 20, 2025',
    image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function PTEDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [examDate, setExamDate] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    try {
      const [userRes, examRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/user/exam-dates'),
      ])

      const userData = await userRes.json()
      if (userData && !userData.error) {
        setUser(userData)
      }

      const examData = await examRes.json()
      if (examData.examDates && examData.examDates.length > 0) {
        const primary =
          examData.examDates.find((d: any) => d.isPrimary) ||
          examData.examDates[0]
        if (primary) {
          setExamDate(new Date(primary.examDate))
        }
      } else {
        setExamDate(null)
      }
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!examDate) return

    const timer = setInterval(() => {
      const now = new Date()
      const diff = examDate.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setCountdown({ days, hours, minutes })
    }, 1000)

    return () => clearInterval(timer)
  }, [examDate])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen space-y-8 bg-background p-6 pb-20 text-foreground"
    >
      {/* Header Section */}
      <motion.div
        variants={item}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {user?.name || 'Student'}
            </span>
            !
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your PTE preparation journey?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Set Goal
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all hover:shadow-blue-500/25">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to VIP
          </Button>
        </div>
      </motion.div>

      {/* VIP Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Premium Access</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Pedagogist VIP Access
              </h2>
              <p className="max-w-xl text-blue-100/80">
                Get full access to all features, AI scoring, and personalized
                feedback to help you prepare for the PTE exam effectively.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                'Full Access',
                'AI Support',
                'Study Tools',
                'Study Report',
                'Personalized Feedback',
              ].map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {feature}
                </Badge>
              ))}
            </div>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 border-0">
              Get VIP Now
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
        <Link href="/pte/academic/practice">
          <Card className="group relative overflow-hidden border-0 bg-card shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-2xl bg-green-100 p-4 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white dark:bg-green-900/20">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">PTE Practice</h3>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  5000+ Questions
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Practice questions for PTE exam by question type
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pte/mock-tests">
          <Card className="group relative overflow-hidden border-0 bg-card shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Mock Tests</h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">200+ Tests</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Simulate real exam conditions with mock tests
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pte/templates">
          <Card className="group relative overflow-hidden border-0 bg-card shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-2xl bg-purple-100 p-4 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-900/20">
                <Layout className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Templates</h3>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  20+ Templates
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get access to pre-written templates
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* AI Mock Test Banner */}
      <motion.div variants={item}>
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/30 dark:to-background dark:border-orange-900/50">
          <CardContent className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <Trophy className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Take free Mock Test with AI scoring
                </h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    AI score + personalized feedback
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Total 19-21 questions
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Estimated time 30+ minutes
                  </span>
                </div>
              </div>
            </div>
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Try Mini Mock Test
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Study Report */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Study Report</CardTitle>
              <Button variant="outline" size="sm">
                Set New Target
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {mounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/20">
                    <div className="rounded-full bg-muted p-4">
                      <BarChart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                      No study data available yet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Complete practice tests to see your progress
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Target Score</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Exam Countdown & Summary */}
        <motion.div variants={item} className="space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Exam In</CardTitle>
              <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Set New Date
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule Exam</DialogTitle>
                    <DialogDescription>
                      Set your target exam date to track your progress.
                    </DialogDescription>
                  </DialogHeader>
                  <ExamDateScheduler
                    onUpdate={() => {
                      fetchData()
                      setIsExamDialogOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {examDate ? (
                <div className="flex justify-between gap-4 text-center">
                  <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {countdown.days}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Days</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {countdown.hours}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Hours</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {countdown.minutes}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Mins</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    No exam scheduled yet
                  </p>
                  <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        Schedule Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Schedule Exam</DialogTitle>
                        <DialogDescription>
                          Set your target exam date to track your progress.
                        </DialogDescription>
                      </DialogHeader>
                      <ExamDateScheduler
                        onUpdate={() => {
                          fetchData()
                          setIsExamDialogOpen(false)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-foreground">Practice Summary</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border bg-card p-3 shadow-sm">
                    <div className="text-xl font-bold text-foreground">0</div>
                    <div className="text-[10px] text-muted-foreground">
                      Today
                    </div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 shadow-sm">
                    <div className="text-xl font-bold text-foreground">1</div>
                    <div className="text-[10px] text-muted-foreground">
                      Total
                    </div>
                  </div>
                  <div className="rounded-xl border bg-card p-3 shadow-sm">
                    <div className="text-xl font-bold text-foreground">1</div>
                    <div className="text-[10px] text-muted-foreground">
                      Days
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Tools */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Study Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                href="/pte/vocab-books"
                className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-green-200 hover:bg-green-50 dark:hover:border-green-900 dark:hover:bg-green-950/30"
              >
                <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">Vocab Books</div>
                  <div className="text-xs text-muted-foreground">
                    Boost your vocabulary skills
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/pte/shadowing"
                className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-blue-200 hover:bg-blue-50 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"
              >
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Mic className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">Shadowing</div>
                  <div className="text-xs text-muted-foreground">
                    Improve pronunciation accuracy
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/pte/mp3"
                className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-purple-200 hover:bg-purple-50 dark:hover:border-purple-900 dark:hover:bg-purple-950/30"
              >
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">Audio Resources</div>
                  <div className="text-xs text-muted-foreground">
                    Practice listening with audio
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Study Guide Section */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Study Guide</h2>
          <div className="flex gap-2">
            {['Pearson PTE', 'Speaking', 'Writing', 'Reading', 'Listening'].map(
              (tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full text-xs",
                    tab === 'Pearson PTE'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </Button>
              )
            )}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {studyGuides.map((guide) => (
            <Card
              key={guide.id}
              className="group overflow-hidden border-0 shadow-md transition-all hover:shadow-xl"
            >
              <div className="flex h-full flex-col md:flex-row">
                <div className="relative h-48 w-full overflow-hidden md:h-auto md:w-48">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                      <Play className="h-8 w-8 text-white" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      {guide.date}
                    </div>
                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h3>
                  </div>
                  <Button
                    variant="link"
                    className="w-fit px-0 text-blue-600 dark:text-blue-400"
                    asChild
                  >
                    <a
                      href={guide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-1"
                    >
                      Watch Video
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
        <div className="space-y-6">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

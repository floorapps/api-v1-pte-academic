'use client'

import { useEffect, useMemo, useState, useOptimistic, useCallback, useActionState } from 'react'
import { format } from 'date-fns'
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { AttemptsChart } from './attempts-chart'
import { ScoreProgressChart } from './score-progress-chart'

interface Attempt {
  id: string
  questionId: string
  questionType: string
  section: string
  userResponse: any
  scores: any
  timeTaken: number
  createdAt: string
  questionTitle?: string
}

interface Stats {
  total: number
  speaking: number
  writing: number
  reading: number
  listening: number
  avgScore: number
  topScore: number
}

export function PracticeAttemptsClient() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [examDate, setExamDate] = useState<Date | undefined>()
  const [targetScore, setTargetScore] = useState<number>(65)
  const [displayExamDate, addOptimisticExamDate] = useOptimistic(examDate)
  const [displayTargetScore, addOptimisticTargetScore] = useOptimistic(targetScore)
  const [filters, setFilters] = useState({
    section: 'all',
    questionType: 'all',
    dateRange: 'all', // all, week, month
    search: '',
  })

  // Fetch user profile for exam date and target score
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.examDate) {
            setExamDate(new Date(data.examDate))
          }
          if (data.targetScore) {
            setTargetScore(data.targetScore)
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [])

  const [saveState, saveAction, isPending] = useActionState(async (prevState: { error: string | null }, data: { questionId: string, questionType: string, bookmarked: boolean }) => {
    const oldExamDate = examDate
    const oldTargetScore = targetScore
    addOptimisticExamDate(examDate)
    addOptimisticTargetScore(targetScore)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: examDate?.toISOString(),
          targetScore,
        }),
      })
      return { ...prevState, error: null }
    } catch (error) {
      console.error('Failed to save profile:', error)
      addOptimisticExamDate(oldExamDate)
      addOptimisticTargetScore(oldTargetScore)
      return { ...prevState, error: 'Failed to save profile' }
    }
  }, { error: null })

  // Fetch all attempts
  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true)
      try {
        // Fetch from all sections
        const [speaking, writing, reading, listening] = await Promise.all([
          fetch('/api/speaking/attempts').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/writing/attempts').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/reading/attempts').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/listening/attempts').then((r) => (r.ok ? r.json() : [])),
        ])

        const allAttempts = [
          ...(speaking.attempts || []).map((a: any) => ({
            ...a,
            section: 'speaking',
          })),
          ...(writing.attempts || []).map((a: any) => ({
            ...a,
            section: 'writing',
          })),
          ...(reading.attempts || []).map((a: any) => ({
            ...a,
            section: 'reading',
          })),
          ...(listening.attempts || []).map((a: any) => ({
            ...a,
            section: 'listening',
          })),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setAttempts(allAttempts)
      } catch (error) {
        console.error('Failed to fetch attempts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [])

  const saveProfile = useCallback(() => saveAction({ questionId: '', questionType: '', bookmarked: false }), [saveAction])

  // Filter attempts
  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      // Section filter
      if (filters.section !== 'all' && attempt.section !== filters.section) {
        return false
      }

      // Question type filter
      if (
        filters.questionType !== 'all' &&
        attempt.questionType !== filters.questionType
      ) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const attemptDate = new Date(attempt.createdAt)
        const now = new Date()
        const diff = now.getTime() - attemptDate.getTime()
        const days = diff / (1000 * 60 * 60 * 24)

        if (filters.dateRange === 'week' && days > 7) return false
        if (filters.dateRange === 'month' && days > 30) return false
      }

      // Search filter
      if (filters.search && attempt.questionTitle) {
        return attempt.questionTitle
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      }

      return true
    })
  }, [attempts, filters])

  // Calculate stats
  const stats: Stats = useMemo(() => {
    const sectionAttempts = {
      speaking: attempts.filter((a) => a.section === 'speaking'),
      writing: attempts.filter((a) => a.section === 'writing'),
      reading: attempts.filter((a) => a.section === 'reading'),
      listening: attempts.filter((a) => a.section === 'listening'),
    }

    const scores = attempts
      .map((a) => {
        if (a.scores?.total) return a.scores.total
        if (a.scores?.score) return a.scores.score
        if (a.scores?.accuracy) return a.scores.accuracy * 90
        return 0
      })
      .filter((s) => s > 0)

    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0

    const topScore = scores.length > 0 ? Math.max(...scores) : 0

    return {
      total: attempts.length,
      speaking: sectionAttempts.speaking.length,
      writing: sectionAttempts.writing.length,
      reading: sectionAttempts.reading.length,
      listening: sectionAttempts.listening.length,
      avgScore,
      topScore,
    }
  }, [attempts])

  const daysUntilExam = displayExamDate
    ? Math.ceil(
        (displayExamDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attempts
            </CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">All sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/90</div>
            <p className="text-muted-foreground text-xs">Across all attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Score</CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.topScore)}/90
            </div>
            <p className="text-muted-foreground text-xs">Personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exam Date</CardTitle>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilExam !== null ? daysUntilExam : '--'}
            </div>
            <p className="text-muted-foreground text-xs">
              {daysUntilExam !== null ? 'days remaining' : 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Section Breakdown</CardTitle>
          <CardDescription>
            Your attempts across all four sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.speaking}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Speaking</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.writing}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Writing</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.reading}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Reading</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.listening}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Listening</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Progress</CardTitle>
            <CardDescription>Your score trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreProgressChart attempts={attempts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Practice attempts per day</CardDescription>
          </CardHeader>
          <CardContent>
            <AttemptsChart attempts={attempts} />
          </CardContent>
        </Card>
      </div>

      {/* Exam Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Goals</CardTitle>
          <CardDescription>Set your target score and exam date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-score">Target Score</Label>
              <div className="flex items-center gap-2">
                <Target className="text-muted-foreground h-4 w-4" />
                <Input
                  id="target-score"
                  type="number"
                  min="10"
                  max="90"
                  value={displayTargetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="max-w-[200px]"
                />
                <span className="text-muted-foreground text-sm">/ 90</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !displayExamDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayExamDate ? format(displayExamDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={displayExamDate}
                    onSelect={setExamDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={saveProfile} disabled={isPending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Goals'}
          </Button>

          {saveState.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <p className="text-sm text-red-800 dark:text-red-400">
                {saveState.error}
              </p>
            </div>
          )}

          {displayTargetScore > stats.avgScore && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
              <p className="text-sm text-orange-800 dark:text-orange-400">
                <strong>Gap to target:</strong> You need{' '}
                {displayTargetScore - stats.avgScore} more points to reach your target
                score of {displayTargetScore}.
              </p>
            </div>
          )}

          {displayTargetScore <= stats.avgScore && stats.avgScore > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <p className="text-sm text-green-800 dark:text-green-400">
                <strong>Great progress!</strong> You've reached your target
                score. Consider increasing your goal!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Attempts</CardTitle>
              <CardDescription>
                Detailed view of all your practice attempts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <Select
              value={filters.section}
              onValueChange={(value) =>
                setFilters({ ...filters, section: value })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="speaking">Speaking</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="listening">Listening</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters({ ...filters, dateRange: value })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1"
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Question Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      Loading attempts...
                    </TableCell>
                  </TableRow>
                ) : filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No attempts found. Start practicing to see your progress
                      here!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.slice(0, 50).map((attempt) => {
                    const score =
                      attempt.scores?.total ||
                      attempt.scores?.score ||
                      attempt.scores?.accuracy * 90 ||
                      0
                    const scoreColor =
                      score >= 79
                        ? 'text-green-600'
                        : score >= 65
                          ? 'text-blue-600'
                          : score >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'

                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          {format(new Date(attempt.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {attempt.section}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {attempt.questionType.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <span className={cn('font-semibold', scoreColor)}>
                            {Math.round(score)}
                          </span>
                          <span className="text-muted-foreground">/90</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {attempt.timeTaken ? `${attempt.timeTaken}s` : '--'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {attempt.scores ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Scored
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredAttempts.length > 50 && (
            <p className="text-muted-foreground text-center text-sm">
              Showing 50 of {filteredAttempts.length} attempts
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

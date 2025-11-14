'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  Circle,
  Eye,
  Flame,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface QuestionRow {
  id: string
  title?: string | null
  difficulty?: string | null
  practicedCount?: number
  tags?: string[] | null
  estimatedTime?: number
}

interface FilteredQuestionsTableProps {
  rows: QuestionRow[]
  section: 'speaking' | 'reading' | 'writing' | 'listening'
  questionType: string
  examDate?: Date | null
  targetScore?: number | null
}

function capitalize(s?: string | null): string {
  if (!s) return 'Medium'
  const lower = String(s).toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function difficultyVariant(d: string): 'default' | 'secondary' | 'destructive' {
  const v = d.toLowerCase()
  if (v === 'hard') return 'destructive'
  if (v === 'easy') return 'secondary'
  return 'default'
}

function getDifficultyValue(difficulty: string): number {
  const d = difficulty.toLowerCase()
  if (d === 'easy') return 1
  if (d === 'hard') return 3
  return 2
}

// Map target score to recommended difficulty
function getRecommendedDifficulty(targetScore?: number): string {
  if (!targetScore) return 'medium'
  if (targetScore >= 75) return 'hard'
  if (targetScore >= 55) return 'medium'
  return 'easy'
}

// Determine priority label
function getPriorityLabel(
  difficulty: string,
  targetScore?: number,
  daysUntilExam?: number
): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  const recommendedDifficulty = getRecommendedDifficulty(targetScore ?? undefined)
  const diffValue = getDifficultyValue(difficulty)
  const recValue = getDifficultyValue(recommendedDifficulty)

  // High priority: matching or slightly below target difficulty, and close to exam
  if (Math.abs(diffValue - recValue) <= 1) {
    if (daysUntilExam && daysUntilExam <= 7) {
      return { label: '🔥 Urgent', variant: 'destructive' }
    }
    return { label: '✓ Recommended', variant: 'default' }
  }

  return { label: 'Review', variant: 'secondary' }
}

export function FilteredQuestionsTable({
  rows,
  section,
  questionType,
  examDate,
  targetScore,
}: FilteredQuestionsTableProps) {
  const isDev = process.env.NODE_ENV !== 'production'
  const isEmpty = rows.length === 0
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null)

  useEffect(() => {
    if (examDate) {
      const today = new Date()
      const diffTime = new Date(examDate).getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntilExam(diffDays)
    }
  }, [examDate])

  // Filter and sort rows based on exam date and target score
  const filteredRows = rows
    .map((row) => {
      const priority = getPriorityLabel(
        row.difficulty || 'Medium',
        targetScore ?? undefined,
        daysUntilExam || undefined
      )
      return { ...row, priority }
    })
    .sort((a, b) => {
      // Priority order: Urgent -> Recommended -> Review
      const priorityOrder = { destructive: 0, default: 1, secondary: 2 }
      const aPriority = priorityOrder[a.priority.variant]
      const bPriority = priorityOrder[b.priority.variant]
      return aPriority - bPriority
    })

  const handleSeedClick = async () => {
    try {
      const response = await fetch(`/api/${section}/seed`, { method: 'POST' })
      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to seed questions. Check console for details.')
      }
    } catch (error) {
      console.error('Error seeding questions:', error)
      alert('Error seeding questions. Check console.')
    }
  }

  const recommendedDifficulty = getRecommendedDifficulty(targetScore ?? undefined)

  return (
    <div className="space-y-4 rounded-md border bg-white">
      {/* Filter Info Banner */}
      {(examDate || targetScore) && !isEmpty && (
        <div className="space-y-2 border-b bg-blue-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {examDate && (
              <div className="flex items-center gap-1 text-sm text-blue-700">
                <AlertCircle className="h-4 w-4" />
                <span>{daysUntilExam} days until exam</span>
              </div>
            )}
            {targetScore && (
              <div className="flex items-center gap-1 text-sm text-blue-700">
                <Target className="h-4 w-4" />
                <span>
                  Focus on{' '}
                  <Badge variant="outline" className="ml-1 text-xs">
                    {capitalize(recommendedDifficulty)}
                  </Badge>{' '}
                  difficulty
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600">
            Questions are sorted by priority based on your exam date and target
            score.
          </p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-40">Difficulty</TableHead>
            <TableHead className="w-40">Status</TableHead>
            <TableHead className="w-48">Priority</TableHead>
            <TableHead className="w-40 text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      No questions available
                    </p>
                    <p className="text-sm text-gray-500">
                      Questions haven't been seeded yet for this section.
                    </p>
                  </div>
                  {isDev && (
                    <div className="mt-4 max-w-md space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <p className="text-sm font-medium text-orange-900">
                        Developer Mode
                      </p>
                      <p className="text-xs text-orange-700">
                        Click the button below to seed questions, or use:
                      </p>
                      <code className="block rounded bg-orange-100 p-2 text-xs text-orange-900">
                        POST /api/{section}/seed
                      </code>
                      <Button
                        onClick={handleSeedClick}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        Seed{' '}
                        {section.charAt(0).toUpperCase() + section.slice(1)}{' '}
                        Questions
                      </Button>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredRows.map((row) => {
              const id = row.id
              const title = row.title || 'Question'
              const diff = capitalize(row.difficulty ?? 'medium')
              const practiced = (row.practicedCount ?? 0) > 0
              const estimatedTime = row.estimatedTime || 3 // Default 3 minutes

              return (
                <TableRow
                  key={id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <TableCell className="font-mono text-xs text-gray-600">
                    {id.length > 10 ? `${id.slice(0, 8)}...` : id}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/pte/academic/practice/${section}/${questionType}/question/${id}`}
                      className="line-clamp-2 text-blue-600 hover:underline"
                    >
                      {title.length > 120 ? `${title.slice(0, 120)}...` : title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={difficultyVariant(diff)}>{diff}</Badge>
                  </TableCell>
                  <TableCell>
                    {practiced ? (
                      <span className="inline-flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Practiced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Circle className="h-4 w-4" /> New
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.priority.variant}
                      className={
                        row.priority.variant === 'destructive'
                          ? 'bg-red-600 text-white'
                          : row.priority.variant === 'default'
                            ? 'bg-green-600 text-white'
                            : ''
                      }
                    >
                      {row.priority.variant === 'destructive' && (
                        <Flame className="mr-1 h-3 w-3" />
                      )}
                      {row.priority.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-3 text-sm text-gray-600">
                      <span
                        className="inline-flex items-center gap-1"
                        title="Times viewed"
                      >
                        <Eye className="h-4 w-4" /> {row.practicedCount ?? 0}
                      </span>
                      <span
                        className="inline-flex items-center gap-1"
                        title={`Estimated time: ${estimatedTime} minutes`}
                      >
                        ⏱️ {estimatedTime}m
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

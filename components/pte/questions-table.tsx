'use client'

import Link from 'next/link'
import { AlertCircle, Bookmark, CheckCircle2, Circle, Eye } from 'lucide-react'
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
}

interface QuestionsTableProps {
  rows: QuestionRow[]
  section?: 'speaking' | 'reading' | 'writing' | 'listening'
  questionType?: string
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

export default function QuestionsTable({
  rows,
  section,
  questionType,
}: QuestionsTableProps) {
  const isDev = process.env.NODE_ENV !== 'production'
  const isEmpty = rows.length === 0

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

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-40">Difficulty</TableHead>
            <TableHead className="w-40">Practiced</TableHead>
            <TableHead className="w-40 text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center">
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
                      {section && (
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
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const id = row.id
              const title = row.title || 'Question'
              const diff = capitalize(row.difficulty ?? 'medium')
              const practiced = (row.practicedCount ?? 0) > 0

              return (
                <TableRow key={id}>
                  <TableCell className="font-mono text-xs text-gray-600">
                    {id.length > 10 ? `${id.slice(0, 8)}...` : id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {section && questionType ? (
                      <Link
                        href={`/pte/academic/practice/${section}/${questionType}/question/${id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {title.length > 120 ? `${title.slice(0, 120)}...` : title}
                      </Link>
                    ) : (
                      <span>{title.length > 120 ? `${title.slice(0, 120)}...` : title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={difficultyVariant(diff)}>{diff}</Badge>
                  </TableCell>
                  <TableCell>
                    {practiced ? (
                      <span className="inline-flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Practiced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-500">
                        <Circle className="h-4 w-4" /> Not Practiced
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-4 text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {row.practicedCount ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bookmark className="h-4 w-4" /> 0
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

// Loading skeleton component
export function QuestionsTableSkeleton() {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-40">Difficulty</TableHead>
            <TableHead className="w-40">Practiced</TableHead>
            <TableHead className="w-40 text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </TableCell>
              <TableCell>
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

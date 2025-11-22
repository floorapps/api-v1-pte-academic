'use client'

import { useEffect, useState, useOptimistic, useCallback, useTransition } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ExamDate {
  id: string
  examDate: string
  examName: string
  isPrimary: boolean
  createdAt: string
}

interface ExamDateSchedulerProps {
  onUpdate?: () => void
}

export function ExamDateScheduler({ onUpdate }: ExamDateSchedulerProps) {
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [isPending, startTransition] = useTransition()
  const [displayExamDates, addOptimisticExamDates] = useOptimistic(examDates)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [examName, setExamName] = useState('Pedagogist Exam')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchExamDates()
  }, [])

  const fetchExamDates = async () => {
    try {
      const response = await fetch('/api/user/exam-dates')
      if (response.status === 401) {
        setError('Please sign in to schedule exam dates')
        setIsLoading(false)
        return
      }
      const data = await response.json()
      if (data.examDates) {
        setExamDates(data.examDates)
      }
    } catch (error) {
      console.error('Error fetching exam dates:', error)
      setError('Failed to fetch exam dates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExamDate = useCallback(async () => {
    setError('')

    if (!newDate) {
      setError('Please select a date')
      return
    }

    const selectedDate = new Date(newDate)
    if (selectedDate < new Date()) {
      setError('Exam date cannot be in the past')
      return
    }

    const newExamDateObj = {
      id: 'temp-' + Date.now(),
      examDate: newDate,
      examName: examName || 'Pedagogist Exam',
      isPrimary: examDates.length === 0 || !examDates.some((d) => d.isPrimary),
      createdAt: new Date().toISOString(),
    }

    const oldExamDates = examDates
    startTransition(() => {
      addOptimisticExamDates([...examDates, newExamDateObj])
    })

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/exam-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: newDate,
          examName: examName || 'Pedagogist Exam',
          isPrimary: examDates.length === 0 || !examDates.some((d) => d.isPrimary),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add exam date')
      }

      setNewDate('')
      setExamName('Pedagogist Exam')
      setIsAdding(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchExamDates()
      onUpdate?.()
    } catch (error) {
      startTransition(() => {
        addOptimisticExamDates(oldExamDates)
      })
      setError(
        error instanceof Error ? error.message : 'Failed to add exam date'
      )
      console.error('Error adding exam date:', error)
    } finally {
      setIsLoading(false)
    }
  }, [newDate, examName, examDates, onUpdate])

  const handleDeleteExamDate = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam date?')) return

    const oldExamDates = examDates
    startTransition(() => {
      addOptimisticExamDates(examDates.filter(d => d.id !== id))
    })

    try {
      const response = await fetch(`/api/user/exam-dates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete exam date')
      }

      fetchExamDates()
      onUpdate?.()
    } catch (error) {
      startTransition(() => {
        addOptimisticExamDates(oldExamDates)
      })
      console.error('Error deleting exam date:', error)
      setError('Failed to delete exam date')
    }
  }, [examDates, onUpdate])

  const getPrimaryExam = () => {
    return displayExamDates.find((d) => d.isPrimary) || displayExamDates[0]
  }

  const getDaysUntilExam = (examDate: string): number => {
    const date = new Date(examDate)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDateString = (dateStr: string): string => {
    const date = new Date(dateStr)
    return format(date, 'MMM dd, yyyy')
  }

  const getMinDate = (): string => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const primaryExam = getPrimaryExam()
  const daysUntilExam = primaryExam
    ? getDaysUntilExam(primaryExam.examDate)
    : null

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <CardTitle>Exam Schedule</CardTitle>
          </div>
          {success && (
            <Badge variant="default" className="bg-green-600">
              Updated
            </Badge>
          )}
        </div>
        <CardDescription>
          Schedule and manage your PTE exam dates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded bg-gray-100" />
        ) : (
          <>
            {/* Primary Exam Display */}
            {primaryExam && !isAdding && (
              <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-600">
                      Next Exam
                    </p>
                    <h3 className="text-lg font-bold text-green-900">
                      {getDateString(primaryExam.examDate)}
                    </h3>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Primary
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">
                    {daysUntilExam !== null
                      ? `${daysUntilExam} days away`
                      : 'Today'}
                  </span>
                </div>
              </div>
            )}

            {/* Exam Dates List */}
            {displayExamDates.length > 0 && !isAdding && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  All Scheduled Exams ({displayExamDates.length})
                </h4>
                <div className="space-y-2">
                  {displayExamDates.map((date) => {
                    const daysUntil = getDaysUntilExam(date.examDate)
                    return (
                      <div
                        key={date.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {date.examName}
                            </p>
                            {date.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {getDateString(date.examDate)} · {daysUntil} days
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeleteExamDate(date.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete exam date ${getDateString(date.examDate)}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="rounded bg-red-50 p-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Add New Exam Date Form */}
            {isAdding ? (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="exam-name">Exam Name</Label>
                  <Input
                    id="exam-name"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g., Pedagogist Exam"
                    className="mt-1"
                    aria-label="Exam name"
                  />
                </div>
                <div>
                  <Label htmlFor="exam-date">Exam Date</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={getMinDate()}
                    className="mt-1"
                    aria-label="Select exam date"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddExamDate}
                    disabled={isLoading || !newDate}
                    className="flex-1"
                  >
                    Schedule Exam
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false)
                      setNewDate('')
                      setError('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="w-full"
              >
                + Add New Exam Date
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Calendar, Target } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ExamCountdownMini() {
  const [mounted, setMounted] = useState(false)
  const { data: examDatesResponse } = useSWR('/api/user/exam-dates', fetcher)
  const { data: targetScoreData } = useSWR('/api/user/target-score', fetcher)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Handle different response structures - API returns { examDates: [...] }
  const examDates = Array.isArray(examDatesResponse)
    ? examDatesResponse
    : examDatesResponse?.examDates || []

  const primaryExam = examDates.find((d: any) => d.isPrimary) || examDates[0]
  const targetScore = targetScoreData?.targetScore

  if (!primaryExam && !targetScore) return null

  const daysUntilExam = primaryExam
    ? Math.ceil(
      (new Date(primaryExam.examDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : null

  return (
    <div className="flex items-center gap-4 text-sm">
      {daysUntilExam !== null && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 dark:bg-blue-950">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {daysUntilExam > 0
              ? `${daysUntilExam} days until exam`
              : daysUntilExam === 0
                ? 'Exam today!'
                : 'Exam passed'}
          </span>
        </div>
      )}
      {targetScore && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 dark:bg-green-950">
          <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-900 dark:text-green-100">
            Target: {targetScore}
          </span>
        </div>
      )}
    </div>
  )
}
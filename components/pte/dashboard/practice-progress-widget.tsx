'use client'

import { useEffect, useState } from 'react'
import { BookOpen, TrendingUp, Zap } from 'lucide-react'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProgressData {
  overallScore: number
  speakingScore: number
  writingScore: number
  readingScore: number
  listeningScore: number
  testsCompleted: number
  questionsAnswered: number
  studyStreak: number
  totalStudyTime: number
}

interface SkillBreakdown {
  skill: string
  score: number
  icon: React.ReactNode
  color: string
}

export function PracticeProgressWidget() {
  const { data: progress, isLoading, error } = useSWR<ProgressData>(
    '/api/user',
    fetcher
  )

  // Mock data - In production, this would come from the API
  const mockProgress: ProgressData = {
    overallScore: 68,
    speakingScore: 72,
    writingScore: 65,
    readingScore: 68,
    listeningScore: 64,
    testsCompleted: 5,
    questionsAnswered: 127,
    studyStreak: 12,
    totalStudyTime: 34, // hours
  }

  const data = progress || mockProgress

  // Helper to safely handle numbers and prevent NaN
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value)
    return isNaN(num) || !isFinite(num) ? fallback : num
  }

  const getSkillBreakdown = (): SkillBreakdown[] => [
    {
      skill: 'Speaking',
      score: data.speakingScore,
      icon: '🎤',
      color: 'bg-blue-100',
    },
    {
      skill: 'Writing',
      score: data.writingScore,
      icon: '✍️',
      color: 'bg-purple-100',
    },
    {
      skill: 'Reading',
      score: data.readingScore,
      icon: '📖',
      color: 'bg-green-100',
    },
    {
      skill: 'Listening',
      score: data.listeningScore,
      icon: '👂',
      color: 'bg-amber-100',
    },
  ]

  const getScoreBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' => {
    if (score >= 70) return 'default'
    if (score >= 50) return 'secondary'
    return 'destructive'
  }

  const questionsThisMonth = Math.floor(
    safeNumber(data.questionsAnswered) * 0.3 // Approximate for demo
  )

  const practiceHours = Math.floor(safeNumber(data.totalStudyTime))

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Stats Overview */}
      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            This Month
          </CardTitle>
          <CardDescription>Your practice activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-600">Questions</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {safeNumber(questionsThisMonth)}
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  {safeNumber(Math.floor(questionsThisMonth / 4))} days active
                </p>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                <p className="text-sm font-semibold text-green-600">
                  Study Time
                </p>
                <p className="mt-1 text-2xl font-bold text-green-900">
                  {safeNumber(practiceHours)}h
                </p>
                <p className="mt-1 text-xs text-green-600">
                  ~{safeNumber(Math.floor(practiceHours / 4))}h per week
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-orange-600">
                  Study Streak
                </p>
                <Badge variant="default" className="bg-orange-600">
                  🔥 {safeNumber(data.studyStreak)} days
                </Badge>
              </div>
              <div className="h-2 w-full rounded-full bg-orange-200">
                <div
                  className="h-2 rounded-full bg-orange-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(safeNumber((safeNumber(data.studyStreak) / 30) * 100), 100)}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={safeNumber(data.studyStreak)}
                  aria-valuemin={0}
                  aria-valuemax={30}
                />
              </div>
            </div>

            <div className="rounded-lg border border-purple-100 bg-purple-50 p-3">
              <p className="mb-2 text-sm font-semibold text-purple-600">
                Tests Completed
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {safeNumber(data.testsCompleted)}
              </p>
              <p className="mt-1 text-xs text-purple-600">
                Average {Math.floor(safeNumber(data.overallScore))} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Breakdown */}
      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Skills Breakdown
          </CardTitle>
          <CardDescription>Performance by section</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {getSkillBreakdown().map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{skill.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {skill.skill}
                      </span>
                    </div>
                    <Badge variant={getScoreBadgeVariant(safeNumber(skill.score))}>
                      {safeNumber(skill.score)}
                    </Badge>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.min(safeNumber((safeNumber(skill.score) / 90) * 100), 100)}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={safeNumber(skill.score)}
                      aria-valuemin={0}
                      aria-valuemax={90}
                      aria-label={`${skill.skill} score: ${safeNumber(skill.score)} out of 90`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overall Score Summary */}
          <div className="mt-4 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1 text-sm font-semibold text-indigo-900">
                <TrendingUp className="h-4 w-4" />
                Overall Score
              </p>
              <Badge
                variant="default"
                className="bg-indigo-600 px-3 py-1 text-lg text-white"
              >
                {safeNumber(data.overallScore)}
              </Badge>
            </div>
            <div className="h-2.5 w-full rounded-full bg-indigo-200">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                style={{
                  width: `${Math.min(safeNumber((safeNumber(data.overallScore) / 90) * 100), 100)}%`,
                }}
                role="progressbar"
                aria-valuenow={safeNumber(data.overallScore)}
                aria-valuemin={0}
                aria-valuemax={90}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

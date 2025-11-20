'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useAuth } from '@/lib/auth/auth-client'
import { updateProfile } from '@/lib/auth/profile-actions'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

// Simple toast implementation
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
}

interface AcademicProfileProps {
  initialTargetScore?: number
  initialExamDate?: string
}

export function AcademicProfile({
  initialTargetScore = 65,
  initialExamDate,
}: AcademicProfileProps) {
  const { user } = useAuth()
  const [targetScore, setTargetScore] = useState(
    initialTargetScore?.toString() || '65'
  )
  const [examDate, setExamDate] = useState(initialExamDate || '')
  const [displayTargetScore, addOptimisticTargetScore] = useOptimistic(targetScore)
  const [displayExamDate, addOptimisticExamDate] = useOptimistic(examDate)

  const [isPending, startTransition] = useTransition()

  const updateProfileAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(null, new FormData())
      if (result?.error) {
        // handle error
      }
    })
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Profile</CardTitle>
        <CardDescription>
          Set your target score and exam date to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetScore">Target Score</Label>
            <Input
              id="targetScore"
              name="targetScore"
              type="number"
              min="10"
              max="90"
              value={displayTargetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="Enter your target score (10-90)"
            />
            <p className="text-muted-foreground text-sm">
              Your target PTE score
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date</Label>
            <Input
              id="examDate"
              name="examDate"
              type="date"
              value={displayExamDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <p className="text-muted-foreground text-sm">
              Your scheduled exam date
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

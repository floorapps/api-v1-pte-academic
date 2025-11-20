'use client'

import { useEffect, useState, useOptimistic, useActionState, useCallback, useEffectEvent } from 'react'
import {
  BookOpen,
  Calendar,
  Edit,
  GraduationCap,
  Settings,
  Target,
  Trophy,
  Upload,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User as UserType } from '@/lib/db/schema'

type UIUser = UserType & {
  targetScore?: number | null
  examDate?: string | Date | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getLevel = (score: number) => {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export default function ProfilePage() {
  const { data: user, error, mutate } = useSWR<UIUser>('/api/user', fetcher)
  const { data: progress } = useSWR('/api/user/progress', fetcher)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<Partial<UIUser>>({})
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (state, update: Partial<UIUser>) => ({ ...state, ...update } as UIUser)
  )

  const saveProfile = async (prevState: any, newData: Partial<UIUser>) => {
    setOptimisticUser(newData)
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      const updatedUser = await response.json()
      mutate(updatedUser)
      return { success: true }
    } catch (error) {
      console.error('Failed to save profile:', error)
      if (user) {
        if (user) {
        setOptimisticUser(user)
      }
      }
      return { success: false, error }
    }
  }

  const [saveState, saveAction, isPending] = useActionState(saveProfile, { success: true })

  const handleSave = useCallback(() => {
    setIsEditing(false)
    saveAction(profileData)
  }, [profileData, saveAction])

  const handleInputChange = useCallback((field: keyof UIUser, value: unknown) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  if (error) return <div>Failed to load user data.</div>
  if (!user) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and track your progress
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  {optimisticUser?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <label className="bg-primary absolute right-0 bottom-0 cursor-pointer rounded-full p-2">
                  <Upload className="h-4 w-4 text-white" />
                  <Input type="file" className="hidden" />
                </label>
              </div>
              <CardTitle className="mt-4 text-xl">{optimisticUser?.name}</CardTitle>
              <CardDescription>{optimisticUser?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <GraduationCap className="h-4 w-4" />
                <span>{optimisticUser?.role || 'PTE Student'}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {optimisticUser?.createdAt ? new Date(optimisticUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" className="flex-1">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
              <CardDescription>Your PTE preparation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-primary text-2xl font-bold">{progress?.testsCompleted || 0}</div>
                  <div className="text-sm text-gray-500">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{progress?.practiceTime || 0}h</div>
                  <div className="text-sm text-gray-500">Practice Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress?.dayStreak || 0}</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{progress?.overallScore ? getLevel(progress.overallScore) : 'N/A'}</div>
                  <div className="text-sm text-gray-500">Current Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Score
              </CardTitle>
              <CardDescription>
                Track your progress toward your goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{progress?.overallScore || 0}/{optimisticUser?.targetScore || 90}</div>
                    <div className="text-gray-500">Current Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">+{Math.max(0, (optimisticUser?.targetScore || 90) - (progress?.overallScore || 0))}</div>
                    <div className="text-gray-500">To Target</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress?.overallScore || 0}/{optimisticUser?.targetScore || 90}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${((progress?.overallScore || 0) / (optimisticUser?.targetScore || 90)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={profileData.targetScore || optimisticUser?.targetScore || 90}
                    onChange={(e) =>
                      handleInputChange('targetScore', e.target.value)
                    }
                    disabled={!isEditing}
                    type="number"
                    min="10"
                    max="90"
                    className="w-32"
                  />
                  <Button disabled={!isEditing || isPending} onClick={handleSave}>
                    Update Target
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={optimisticUser?.role || 'PTE Student'} disabled={true} />
              </div>

              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input id="joinDate" value={optimisticUser?.createdAt ? new Date(optimisticUser.createdAt).toLocaleDateString() : ''} disabled={true} />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

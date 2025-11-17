'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  CheckCircle,
  Clock,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PTEScoreBreakdown } from '@/lib/pte/pte-scoring'

// Mock test result data with real PTE scoring structure
const mockTestResult = {
  id: 'mock-1',
  title: 'PTE Mock Test #1',
  duration: 180,
  date: new Date().toISOString().split('T')[0],
  status: 'completed',
  score: 78,
  scoreBreakdown: {
    overall: 78,
    speaking: 75,
    writing: 82,
    reading: 85,
    listening: 80,
    enablingSkills: {
      grammar: 78,
      oralFluency: 72,
      pronunciation: 76,
      spelling: 85,
      vocabulary: 80,
      writtenDiscourse: 79,
    },
  },
  sections: [
    {
      id: 'section-speaking',
      name: 'Speaking',
      duration: 30,
      score: 75,
      timeSpent: 1720, // 28:40
      modules: [
        {
          id: 'q1',
          module: 'RA',
          name: 'Read Aloud',
          title: 'RA Sample 1',
          description: 'Read aloud task',
          duration: 40,
          status: 'completed',
          score: 78,
          contributingSkills: ['Speaking', 'Enabling Skills'],
        },
        {
          id: 'q2',
          module: 'RS',
          name: 'Repeat Sentence',
          title: 'RS Sample 1',
          description: 'Repeat the sentence exactly',
          duration: 15,
          status: 'completed',
          score: 82,
          contributingSkills: ['Speaking', 'Listening'],
        },
        {
          id: 'q3',
          module: 'DI',
          name: 'Describe Image',
          title: 'DI Sample 1',
          description: 'Describe the image',
          duration: 65,
          status: 'completed',
          score: 72,
          contributingSkills: ['Speaking'],
        },
        {
          id: 'q4',
          module: 'RL',
          name: 'Retell Lecture',
          title: 'RL Sample 1',
          description: 'Retell lecture in own words',
          duration: 40,
          status: 'completed',
          score: 70,
          contributingSkills: ['Speaking', 'Listening'],
        },
        {
          id: 'q5',
          module: 'ASQ',
          name: 'Answer Short Question',
          title: 'ASQ Sample 1',
          description: 'Answer a short question',
          duration: 10,
          status: 'completed',
          score: 85,
          contributingSkills: ['Speaking', 'Listening'],
        },
      ],
    },
    {
      id: 'section-writing',
      name: 'Writing',
      duration: 50,
      score: 82,
      timeSpent: 2850, // 47:30
      modules: [
        {
          id: 'q6',
          module: 'SWT',
          name: 'Summarize Written Text',
          title: 'SWT Sample 1',
          description: 'Summarize the passage',
          duration: 600,
          status: 'completed',
          score: 76,
          contributingSkills: ['Writing', 'Reading', 'Enabling Skills'],
        },
        {
          id: 'q7',
          module: 'WE',
          name: 'Write Essay',
          title: 'WE Sample 1',
          description: 'Write an essay',
          duration: 1200,
          status: 'completed',
          score: 88,
          contributingSkills: ['Writing', 'Enabling Skills'],
        },
      ],
    },
    {
      id: 'section-reading',
      name: 'Reading',
      duration: 32,
      score: 85,
      timeSpent: 1850, // 30:50
      modules: [
        {
          id: 'q8',
          module: 'FIB_RW',
          name: 'Reading & Writing: Fill in the Blanks',
          title: 'FIB_RW Sample 1',
          description: 'Fill in blanks in a text',
          duration: 90,
          status: 'completed',
          score: 88,
          contributingSkills: ['Reading', 'Writing', 'Enabling Skills'],
        },
        {
          id: 'q9',
          module: 'MCS',
          name: 'Multiple Choice, Single Answer',
          title: 'MCS Sample 1',
          description: 'Choose one correct answer',
          duration: 90,
          status: 'completed',
          score: 85,
          contributingSkills: ['Reading'],
        },
        {
          id: 'q10',
          module: 'RO',
          name: 'Re-order Paragraphs',
          title: 'RO Sample 1',
          description: 'Re-order paragraphs',
          duration: 180,
          status: 'completed',
          score: 82,
          contributingSkills: ['Reading'],
        },
        {
          id: 'q11',
          module: 'FIB_R',
          name: 'Reading: Fill in the Blanks',
          title: 'FIB_R Sample 1',
          description: 'Fill in blanks in a text',
          duration: 90,
          status: 'completed',
          score: 80,
          contributingSkills: ['Reading', 'Enabling Skills'],
        },
      ],
    },
    {
      id: 'section-listening',
      name: 'Listening',
      duration: 40,
      score: 80,
      timeSpent: 2200, // 36:40
      modules: [
        {
          id: 'q12',
          module: 'SST',
          name: 'Summarize Spoken Text',
          title: 'SST Sample 1',
          description: 'Summarize spoken text',
          duration: 600,
          status: 'completed',
          score: 75,
          contributingSkills: ['Listening', 'Writing', 'Enabling Skills'],
        },
        {
          id: 'q13',
          module: 'MCS_L',
          name: 'Multiple Choice, Single Answer',
          title: 'MCS_L Sample 1',
          description: 'Choose one correct answer from audio',
          duration: 90,
          status: 'completed',
          score: 82,
          contributingSkills: ['Listening'],
        },
        {
          id: 'q14',
          module: 'FIB_L',
          name: 'Fill in the Blanks',
          title: 'FIB_L Sample 1',
          description: 'Fill in blanks from audio',
          duration: 150,
          status: 'completed',
          score: 78,
          contributingSkills: ['Listening', 'Enabling Skills'],
        },
        {
          id: 'q15',
          module: 'WFD',
          name: 'Write from Dictation',
          title: 'WFD Sample 1',
          description: 'Write sentence as you hear it',
          duration: 90,
          status: 'completed',
          score: 85,
          contributingSkills: ['Listening', 'Writing', 'Enabling Skills'],
        },
      ],
    },
  ],
}

export default function MockTestResultPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate overall stats
  const totalModules = mockTestResult.sections.reduce(
    (acc, section) => acc + section.modules.length,
    0
  )
  const completedModules = mockTestResult.sections.reduce(
    (acc, section) =>
      acc + section.modules.filter((q) => q.status === 'completed').length,
    0
  )
  const correctModules = mockTestResult.sections.reduce(
    (acc, section) =>
      acc + section.modules.filter((q) => q.score && q.score >= 75).length,
    0
  )

  const accuracy = Math.round((correctModules / totalModules) * 100)

  // Get score breakdown
  const scoreBreakdown: PTEScoreBreakdown = mockTestResult.scoreBreakdown

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Test Results</h1>
          <p className="text-muted-foreground">
            Review your performance on the completed test
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/pte/mock-tests">
              <RotateCcw className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pte/academic/practice">
              <TrendingUp className="mr-2 h-4 w-4" />
              Practice Again
            </Link>
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-primary text-4xl font-bold">
                {mockTestResult.score}/90
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
              <div className="mt-2">
                <Badge variant="secondary">PTE Academic</Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {accuracy}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="mt-2">
                <Badge variant="outline">
                  {correctModules}/{totalModules} completed
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {completedModules}
              </div>
              <div className="text-sm text-gray-500">Modules Attempted</div>
              <div className="mt-2">
                <Badge variant="outline">{totalModules} total</Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(
                  mockTestResult.sections.reduce(
                    (acc, s) => acc + (s.timeSpent || 0),
                    0
                  ) / 60
                )}
                m
              </div>
              <div className="text-sm text-gray-500">Time Taken</div>
              <div className="mt-2">
                <Badge variant="outline">
                  {mockTestResult.duration}m allocated
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PTE Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            PTE Score Breakdown
          </CardTitle>
          <CardDescription>
            Detailed performance across all PTE skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Main Skills Breakdown */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scoreBreakdown.speaking}/90
              </div>
              <div className="text-sm">Speaking</div>
              <Progress value={scoreBreakdown.speaking} className="mt-2 h-2" />
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {scoreBreakdown.writing}/90
              </div>
              <div className="text-sm">Writing</div>
              <Progress value={scoreBreakdown.writing} className="mt-2 h-2" />
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {scoreBreakdown.reading}/90
              </div>
              <div className="text-sm">Reading</div>
              <Progress value={scoreBreakdown.reading} className="mt-2 h-2" />
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {scoreBreakdown.listening}/90
              </div>
              <div className="text-sm">Listening</div>
              <Progress value={scoreBreakdown.listening} className="mt-2 h-2" />
            </div>
          </div>

          {/* Enabling Skills Breakdown */}
          {scoreBreakdown.enablingSkills && (
            <div className="border-t pt-6">
              <h3 className="mb-4 font-semibold">Enabling Skills</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.grammar}/90
                  </div>
                  <div className="text-xs">Grammar</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.grammar}
                    className="mt-1 h-1"
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.oralFluency}/90
                  </div>
                  <div className="text-xs">Oral Fluency</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.oralFluency}
                    className="mt-1 h-1"
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.pronunciation}/90
                  </div>
                  <div className="text-xs">Pronunciation</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.pronunciation}
                    className="mt-1 h-1"
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.spelling}/90
                  </div>
                  <div className="text-xs">Spelling</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.spelling}
                    className="mt-1 h-1"
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.vocabulary}/90
                  </div>
                  <div className="text-xs">Vocabulary</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.vocabulary}
                    className="mt-1 h-1"
                  />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {scoreBreakdown.enablingSkills.writtenDiscourse}/90
                  </div>
                  <div className="text-xs">Written Discourse</div>
                  <Progress
                    value={scoreBreakdown.enablingSkills.writtenDiscourse}
                    className="mt-1 h-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
          <CardDescription>Performance in each PTE module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockTestResult.sections.map((section, idx) => (
              <Card key={idx} className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{section.name}</CardTitle>
                    <div className="text-primary text-2xl font-bold">
                      {section.score}/90
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span>Section Score</span>
                        <span>{section.score}/90</span>
                      </div>
                      <Progress value={section.score} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Modules in this section:</h4>
                      {section.modules.map((module, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-gray-500">
                              {module.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              {module.contributingSkills.join(', ')}
                            </div>
                            <div className="w-16 text-center font-bold">
                              {module.score}/90
                            </div>
                            <Progress
                              value={module.score}
                              className="h-2 w-24"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
          <CardDescription>
            Focus areas based on your test performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speaking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Oral Fluency: {scoreBreakdown.enablingSkills?.oralFluency}
                      /90
                    </span>
                    <span className="text-red-500">Needs improvement</span>
                  </div>
                  <Progress
                    value={scoreBreakdown.enablingSkills?.oralFluency || 0}
                    className="h-2"
                  />
                  <div className="text-sm text-gray-600">
                    Practice speaking more naturally without long pauses
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Written Discourse:{' '}
                      {scoreBreakdown.enablingSkills?.writtenDiscourse}/90
                    </span>
                    <span className="text-red-500">Needs improvement</span>
                  </div>
                  <Progress
                    value={scoreBreakdown.enablingSkills?.writtenDiscourse || 0}
                    className="h-2"
                  />
                  <div className="text-sm text-gray-600">
                    Focus on organizing ideas coherently
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended Next Steps
          </CardTitle>
          <CardDescription>Based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Focus on Speaking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm">
                  Your speaking score was lower than other sections
                </p>
                <Button asChild className="w-full">
                  <Link href="/pte/academic/practice/speaking">
                    Practice Speaking
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Take Another Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm">Practice makes perfect</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pte/mock-tests">Schedule New Test</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Review Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm">Look at your incorrect answers</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pte/analytics">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

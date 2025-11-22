'use client'

import React from 'react'
import AttemptsList from '@/components/pte/speaking/AttemptsList'
import PublicAnswersList from '@/components/pte/speaking/PublicAnswersList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  questionId: string
  questionType: string
}

export default function SpeakingBoards({ questionId, questionType }: Props) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discussion Boards</h2>
      </div>
      <Tabs defaultValue="discussion">
        <TabsList>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="me">Me</TabsTrigger>
        </TabsList>

        <TabsContent value="discussion" className="mt-4">
          <PublicAnswersList questionId={questionId} sortBy="recent" />
        </TabsContent>

        <TabsContent value="board" className="mt-4">
          <PublicAnswersList questionId={questionId} sortBy="score" minScore={60} />
        </TabsContent>

        <TabsContent value="me" className="mt-4">
          <AttemptsList questionId={questionId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
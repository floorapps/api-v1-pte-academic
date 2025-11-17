import * as React from 'react'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import QuestionsTable, {

  QuestionsTableSkeleton,
} from '@/components/pte/questions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  categorizeQuestions,
  fetchListingQuestions,
  getCurrentMonthName,
} from '@/lib/pte/listing-helpers'

async function QuestionsSections({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.pageSize) || 20
  const difficulty = (searchParams.difficulty as string) || 'All'

  const data = await fetchListingQuestions(
    'listening',
    'multiple_choice_multiple',
    { page: page?.toString(), pageSize: pageSize?.toString(), difficulty }
  )
  const { all, weekly, monthly } = categorizeQuestions(data.items)
  const currentMonth = getCurrentMonthName()

  return (
    <div className="mt-6">
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Prediction</TabsTrigger>
            <TabsTrigger value="monthly">{currentMonth} Prediction</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          <QuestionsTable
            rows={all}
            section="listening"
            questionType="multiple-choice-multiple"
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <QuestionsTable
            rows={weekly}
            section="listening"
            questionType="multiple-choice-multiple"
          />
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <QuestionsTable
            rows={monthly}
            section="listening"
            questionType="multiple-choice-multiple"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function MultipleChoiceMultiplePracticePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  return (
    <>
      <AcademicPracticeHeader section="listening" showFilters={true} />
      <React.Suspense fallback={<QuestionsTableSkeleton />}>
        <QuestionsSections searchParams={params} />
      </React.Suspense>
    </>
  )
}

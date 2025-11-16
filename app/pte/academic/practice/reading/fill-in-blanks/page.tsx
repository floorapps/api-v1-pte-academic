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
import { questionListingCache } from '@/lib/parsers'

async function QuestionsSections() {
  const { page, pageSize, difficulty } = questionListingCache.all()

  const data = await fetchListingQuestions(
    'reading',
    'fill_in_blanks',
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
            section="reading"
            questionType="fill-in-blanks"
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <QuestionsTable
            rows={weekly}
            section="reading"
            questionType="fill-in-blanks"
          />
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <QuestionsTable
            rows={monthly}
            section="reading"
            questionType="fill-in-blanks"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function FillInBlanksPracticePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  questionListingCache.parse(await searchParams)

  return (
    <>
      <AcademicPracticeHeader section="reading" showFilters={true} />
      <React.Suspense fallback={<QuestionsTableSkeleton />}>
        <QuestionsSections />
      </React.Suspense>
    </>
  )
}

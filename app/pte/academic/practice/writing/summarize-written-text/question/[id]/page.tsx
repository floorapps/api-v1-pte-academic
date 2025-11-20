import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="writing" showFilters={false} />
        <div className="mt-8">
          <WritingQuestionClient
            questionId={id}
            questionType="summarize_written_text"
          />
        </div>
      </div>
    </div>
  )
}

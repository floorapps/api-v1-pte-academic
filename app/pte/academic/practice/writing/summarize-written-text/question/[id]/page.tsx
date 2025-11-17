import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import WritingQuestionClient from '@/components/pte/writing/WritingQuestionClient'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Props = {
  params: Promise<{ id: string }>
}

// Generate static params for all summarize_written_text questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: writingQuestions.id })
      .from(writingQuestions)
      .where(eq(writingQuestions.type, 'summarize_written_text'))

    return questions.map((q) => ({ id: q.id }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function SummarizeWrittenTextQuestionPage({
  params,
}: Props) {
  const { id } = await params

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

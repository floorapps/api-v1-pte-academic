import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
import { db } from '@/lib/db/drizzle'
import { readingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Props = {
  params: Promise<{ id: string }>
}

// Generate static params for all reading_writing_fill_blanks questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: readingQuestions.id })
      .from(readingQuestions)
      .where(eq(readingQuestions.type, 'reading_writing_fill_blanks'))

    return questions.map((q) => ({ id: q.id }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="reading" showFilters={false} />
        <div className="mt-8">
          <ReadingQuestionClient
            questionId={id}
            questionType="reading_writing_fill_blanks"
          />
        </div>
      </div>
    </div>
  )
}

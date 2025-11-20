import ListeningAttempt from '@/components/pte/attempt/ListeningAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { db } from '@/lib/db/drizzle'
import { listeningQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Props = { params: Promise<{ id: string }> }

// Generate static params for all write_from_dictation questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: listeningQuestions.id })
      .from(listeningQuestions)
      .where(eq(listeningQuestions.type, 'write_from_dictation'))

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
        <AcademicPracticeHeader section="listening" showFilters={false} />
        <div className="mt-8">
          <ListeningAttempt
            questionId={id}
            questionType="write_from_dictation"
          />
        </div>
      </div>
    </div>
  )
}

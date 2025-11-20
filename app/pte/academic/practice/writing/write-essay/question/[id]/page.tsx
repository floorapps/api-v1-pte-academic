import WritingAttempt from '@/components/pte/attempt/WritingAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { db } from '@/lib/db/drizzle'
import { writingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Props = {
  params: Promise<{ id: string }>
}

// Generate static params for all write_essay questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: writingQuestions.id })
      .from(writingQuestions)
      .where(eq(writingQuestions.type, 'write_essay'))

    return questions.map((q) => ({ id: q.id }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

async function fetchWritingQuestion(id: string) {
  try {
    const result = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.id, id))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const q = await fetchWritingQuestion(id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="writing" showFilters={false} />
        <div className="mt-8">
          <WritingAttempt
            questionId={id}
            questionType="write_essay"
            prompt={
              q
                ? {
                    title: q.title ?? undefined,
                    promptText: q.promptText ?? undefined,
                    difficulty: q.difficulty ?? undefined,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}

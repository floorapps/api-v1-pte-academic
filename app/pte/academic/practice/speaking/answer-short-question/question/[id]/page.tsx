import type { Metadata } from 'next'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import SpeakingQuestionClient from '@/components/pte/speaking/SpeakingQuestionClient'
import { getSpeakingQuestionById } from '@/lib/pte/queries'
import { db } from '@/lib/db/drizzle'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Props = {
  params: Promise<{ id: string }>
}

// Generate static params for all answer_short_question questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: speakingQuestions.id })
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'answer_short_question'))

    return questions.map((q) => ({ id: q.id }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await getSpeakingQuestionById(id)

  if (!question) {
    return {
      title: 'Answer Short Question Practice | PTE Academic',
    }
  }

  const label = (question as any).questionNumber ?? id

  return {
    title: `Answer Short Question Practice - Question ${label} | PTE Academic`,
    description: `Practice Answer Short Question question ${label} for PTE Academic Speaking section`,
  }
}

export default async function AnswerShortQuestionQuestionPage({
  params,
}: Props) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <AcademicPracticeHeader section="speaking" showFilters={false} />
      <SpeakingQuestionClient
        questionId={id}
        questionType="answer_short_question"
      />
    </div>
  )
}

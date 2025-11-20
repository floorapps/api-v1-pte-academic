import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import ReadingQuestionClient from '@/components/pte/reading/ReadingQuestionClient'
import { db } from '@/lib/db/drizzle'
import { readingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function QuestionPage({ params }: { params: { id: string } }) {

  const { id } = params



  return (

    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <AcademicPracticeHeader section="reading" showFilters={false} />

        <div className="mt-8">

          <p>Question {id}</p>

        </div>

      </div>

    </div>

  )

}


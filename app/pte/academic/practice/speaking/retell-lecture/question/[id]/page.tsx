import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SpeakingQuestionClient from '@/components/pte/speaking/SpeakingQuestionClient'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from "@/components/ui/skeleton";
import { db } from '@/lib/db/drizzle'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type Params = {
  params: Promise<{ id: string }>;
};

type SpeakingQuestion = {
  id: string
  type: string
  title: string
  promptText?: string | null
  promptMediaUrl?: string | null
  difficulty?: string
  tags?: any
  isActive: boolean
  createdAt: Date
}

async function fetchQuestion(id: string): Promise<SpeakingQuestion | null> {
  try {
    console.log(`[Page] Fetching question with ID: ${id}`)
    const rows = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.id, id))
      .limit(1)
    const question = rows[0]
    if (!question) {
      console.log(`[Page] Question not found in DB`)
      return null
    }
    console.log(`[Page] Question found: ${question.id}, type: ${question.type}, isActive: ${question.isActive}`)
    return question
  } catch (error) {
    console.error('Error fetching question:', error)
    return null // Return null to trigger notFound()
  }
}

async function QuestionContent({ id }: { id: string }) {
  const question = await fetchQuestion(id)

  if (!question || !question.isActive || question.type !== 'retell_lecture') {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Question title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Retell Lecture Practice — Question {id?.slice(0, 8) || 'Unknown'}
        </h1>
        {question.difficulty && (
          <p className="text-muted-foreground mt-1 text-sm">
            Difficulty:{' '}
            <span className="font-medium capitalize">
              {question.difficulty}
            </span>
          </p>
        )}
      </div>

      <SpeakingQuestionClient questionId={id} questionType="retell_lecture" />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 border-t pt-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/pte/academic/practice/speaking/retell-lecture">
              ← Back to List
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link
              href={`/pte/academic/practice/speaking/retell-lecture/question/${id}`}
            >
              Redo
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export async function generateMetadata(props: Params) {
  const params = await props.params
  const id = params.id
  return {
    title: `Retell Lecture Practice — Question ${id?.slice(0, 8) || 'Unknown'}`,
    description: 'Practice PTE Academic Retell Lecture with AI scoring',
  }
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with breadcrumbs */}
        <AcademicPracticeHeader section="speaking" showFilters={false} />

        {/* Breadcrumbs */}
        <nav className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <Link href="/pte" className="hover:text-primary">
            PTE
          </Link>
          <span>/</span>
          <Link href="/pte/academic/practice" className="hover:text-primary">
            Practice
          </Link>
          <span>/</span>
          <Link
            href="/pte/academic/practice/speaking"
            className="hover:text-primary"
          >
            Speaking
          </Link>
          <span>/</span>
          <Link
            href="/pte/academic/practice/speaking/retell-lecture"
            className="hover:text-primary"
          >
            Retell Lecture
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            Question {id?.slice(0, 8) || 'Unknown'}
          </span>
        </nav>

        {/* Main content with Suspense */}
        <div className="mt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <QuestionContent id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

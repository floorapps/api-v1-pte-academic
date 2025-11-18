import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import SpeakingAttempt from '@/components/pte/attempt/SpeakingAttempt'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/lib/db/drizzle'
import { speakingQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{ id: string }>
}

// Generate static params for all repeat_sentence questions at build time
export async function generateStaticParams() {
  try {
    const questions = await db
      .select({ id: speakingQuestions.id })
      .from(speakingQuestions)
      .where(eq(speakingQuestions.type, 'repeat_sentence'))

    return questions.map((q) => ({ id: q.id }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

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
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const res = await fetch(`${protocol}://${host}/api/speaking/questions/${id}`)
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to fetch question: ${res.status}`)
    }
    const data = await res.json()
    return data.question
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

async function QuestionContent({ id }: { id: string }) {
  const question = await fetchQuestion(id)

  if (!question) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Question title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Repeat Sentence Practice — Question {id.slice(0, 8)}
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

      {/* Attempt interface */}
      <SpeakingAttempt
        questionId={id}
        questionType="repeat_sentence"
        prompt={{
          title: question.title,
          promptText: question.promptText ?? undefined,
          promptMediaUrl: question.promptMediaUrl ?? undefined,
          difficulty: question.difficulty ?? undefined,
        }}
      />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 border-t pt-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/pte/academic/practice/speaking/repeat-sentence">
              ← Back to List
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link
              href={`/pte/academic/practice/speaking/repeat-sentence/question/${id}`}
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
    title: `Repeat Sentence Practice — Question ${id.slice(0, 8)}`,
    description: 'Practice PTE Academic Repeat Sentence with AI scoring',
  }
}

export default async function RepeatSentenceQuestionPage(props: Params) {
  const params = await props.params
  const id = params.id

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
            href="/pte/academic/practice/speaking/repeat-sentence"
            className="hover:text-primary"
          >
            Repeat Sentence
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            Question {id.slice(0, 8)}
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

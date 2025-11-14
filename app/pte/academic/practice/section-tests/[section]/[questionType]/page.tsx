import { notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import QuestionsTable from '@/components/pte/questions-table'
import { db } from '@/lib/db/drizzle'
import { pteQuestions } from '@/lib/db/schema'
import { initialCategories } from '@/lib/pte/data'

function capitalize(s?: string | null) {
  if (!s) return 'Medium'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default async function QuestionTypePage(props: {
  params: Promise<{ section: string; questionType: string }>
}) {
  const params = await props.params
  const { section, questionType } = params

  // Validate section and type via initialCategories (source of truth for codes)
  const typeCat = initialCategories.find((cat) => cat.code === questionType)
  if (!typeCat) notFound()

  const parentCat = initialCategories.find((cat) => cat.id === typeCat.parent)
  if (!parentCat || parentCat.code !== section) notFound()

  // SSR fetch from DB for this section+type
  const rows = await db
    .select({
      id: pteQuestions.id,
      question: pteQuestions.question,
      questionType: pteQuestions.questionType,
      section: pteQuestions.section,
      difficulty: pteQuestions.difficulty,
      createdAt: pteQuestions.createdAt,
    })
    .from(pteQuestions)
    .where(
      and(
        eq(pteQuestions.section, section.toLowerCase()),
        eq(pteQuestions.questionType, questionType)
      )
    )
    .limit(50)

  // Map to QuestionsTable shape
  const questions = rows.map((r) => ({
    id: r.id,
    title: r.question || 'Question',
    category: capitalize(r.section),
    subcategory: r.questionType,
    difficulty: capitalize(r.difficulty),
    status: 'not-started' as const,
    attempts: 0,
    score: undefined as number | undefined,
    lastAttempted: undefined as string | undefined,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section={section} showFilters={true} />

        <div className="mt-6">
          <QuestionsTable rows={questions} section={section as 'speaking' | 'writing' | 'reading' | 'listening'} questionType={questionType} />
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const childCategories = initialCategories.filter((cat) => cat.parent !== null)

  return childCategories.map((category) => {
    const parentCategory = initialCategories.find(
      (cat) => cat.id === category.parent
    )
    return {
      section: parentCategory?.code || '',
      questionType: category.code,
    }
  })
}

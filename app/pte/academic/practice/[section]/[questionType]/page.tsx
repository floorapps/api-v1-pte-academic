import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import QuestionsTable from '@/components/pte/questions-table'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { initialCategories } from '@/lib/pte/data'

function capitalize(s?: string | null) {
  if (!s) return 'Medium'
  const t = String(s)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

type Params = { params: Promise<{ section: string; questionType: string }> }

const S_CODE_TO_SPEAKING: Record<string, string> = {
  // speaking codes -> API SpeakingType
  s_read_aloud: 'read_aloud',
  s_repeat_sentence: 'repeat_sentence',
  s_describe_image: 'describe_image',
  s_retell_lecture: 'retell_lecture',
  s_short_question: 'answer_short_question',
  s_summarize_group_discussion: 'summarize_group_discussion',
  s_respond_situation_academic: 'respond_to_a_situation',
}

function toKebab(v: string) {
  return v.replace(/_/g, '-')
}

export default async function PracticeListPage({ params }: Params) {
  const { section: rawSection, questionType } = await params
  const section = (rawSection ?? '').toLowerCase()

  // Validate questionType exists in known categories
  const typeCat = initialCategories.find((cat) => cat.code === questionType)
  if (!typeCat) notFound()

  // Validate parent mapping to section
  const parentCat = initialCategories.find((cat) => cat.id === typeCat.parent)
  if (!parentCat || parentCat.code !== section) notFound()

  // Speaking branch: use /api/speaking/questions
  if (section === 'speaking') {
    const speakingType = S_CODE_TO_SPEAKING[questionType]
    if (!speakingType) {
      notFound()
    }

    // Build absolute API URL for server-side fetch using request headers
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'http'
    const host =
      h.get('x-forwarded-host') ??
      h.get('host') ??
      `localhost:${process.env.PORT || 3000}`
    const base = `${proto}://${host}`

    const url = new URL(`/api/speaking/questions`, base)
    url.searchParams.set('type', speakingType)
    url.searchParams.set('page', '1')
    url.searchParams.set('pageSize', '50')
    // Optionally support filters later: difficulty/search

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      notFound()
    }
    const payload = (await res.json()) as {
      page: number
      pageSize: number
      total: number
      items: Array<{
        id: string
        title?: string | null
        promptText?: string | null
        difficulty?: 'Easy' | 'Medium' | 'Hard' | null
        createdAt?: string | null
      }>
    }

    const rows = Array.isArray(payload?.items) ? payload.items : []
    const kebabType = toKebab(speakingType)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6 rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">Difficulty</TableHead>
                  <TableHead className="w-40">Created</TableHead>
                  <TableHead className="w-40 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-gray-500"
                    >
                      No questions available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const id = r.id
                    const title = r.title || r.promptText || 'Question'
                    const diff = r.difficulty || 'Medium'
                    const created = r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : '—'
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs text-gray-600">
                          {id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/academic/pte-practice-test/speaking/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              diff === 'Hard'
                                ? 'destructive'
                                : diff === 'Easy'
                                  ? 'secondary'
                                  : 'default'
                            }
                          >
                            {diff}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {created}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/academic/pte-practice-test/speaking/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Practice
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  // Default (non-speaking) branch: keep existing behavior using /api/pte-practice/questions
  // Build absolute API URL for server-side fetch using request headers (Next 15/16 async APIs)
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host =
    h.get('x-forwarded-host') ??
    h.get('host') ??
    `localhost:${process.env.PORT || 3000}`
  const base = `${proto}://${host}`

  const url = new URL(
    `/api/pte-practice/questions?section=${encodeURIComponent(
      section
    )}&type=${encodeURIComponent(questionType)}&limit=50`,
    base
  )

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    // In case of API failure, surface 404 to keep UX simple for now
    notFound()
  }

  type ApiRow = {
    id: string
    question?: string | null
    questionType: string
    section: string | null
    difficulty?: string | null
  }
  const payload = (await res.json()) as { data: ApiRow[] }
  const rows = Array.isArray(payload?.data) ? payload.data : []

  const questions = rows.map((r) => ({
    id: r.id,
    title: r.question ?? 'Question',
    category: capitalize(r.section),
    subcategory: r.questionType,
    difficulty: capitalize(r.difficulty ?? 'medium'),
    status: 'not-started' as const,
    attempts: 0,
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

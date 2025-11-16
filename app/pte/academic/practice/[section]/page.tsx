import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { initialCategories } from '@/lib/pte/data'

type SectionKey = 'speaking' | 'writing' | 'reading' | 'listening'

const SECTION_META: Record<SectionKey, { id: number; label: string }> = {
  speaking: { id: 1, label: 'Speaking' },
  writing: { id: 7, label: 'Writing' },
  reading: { id: 10, label: 'Reading' },
  listening: { id: 16, label: 'Listening' },
}

export default async function SectionLandingPage(props: {
  params: Promise<{ section: string }>
}) {
  const params = await props.params
  const sectionParam = (params.section ?? '').toLowerCase() as SectionKey

  if (!['speaking', 'writing', 'reading', 'listening'].includes(sectionParam)) {
    notFound()
  }

  const parentId = SECTION_META[sectionParam].id

  const items = initialCategories.filter((c) => c.parent === parentId)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section={sectionParam} showFilters={false} />

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((q) => {
            const href =
              sectionParam === 'speaking' && q.code === 's_read_aloud'
                ? '/pte/academic/practice/speaking/read-aloud'
                : `/pte/academic/practice/${sectionParam}/${q.code}`
            return (
              <Link key={q.id} href={href} className="block">
                <Card className="cursor-pointer transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                        <Image
                          src={q.icon}
                          alt={q.title}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold dark:text-gray-100">{q.title}</h3>
                          {q.scoring_type === 'ai' && (
                            <Badge className="bg-yellow-500 text-xs text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100">
                              AI
                            </Badge>
                          )}
                          {q.short_name && (
                            <Badge variant="secondary" className="text-xs">
                              {q.short_name}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {q.description}
                        </p>
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                          {q.question_count} questions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

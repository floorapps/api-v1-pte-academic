import Image from 'next/image'
import Link from 'next/link'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { initialCategories } from '@/lib/pte/data'

export default function SectionTestsIndexPage() {
  const parentCategories = initialCategories.filter((c) => c.parent === null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader />

        {/* Top-level section tabs: Speaking, Writing, Reading, Listening */}
        <div className="mt-4">
          <div className="grid w-full grid-cols-4 gap-2">
            <Button asChild variant="outline">
              <Link href="/pte/academic/practice/section-tests/speaking">
                Speaking
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pte/academic/practice/section-tests/writing">
                Writing
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pte/academic/practice/section-tests/reading">
                Reading
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pte/academic/practice/section-tests/listening">
                Listening
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold dark:text-gray-100">
              Start Your PTE Academic Practice Test Online
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Prepare with targeted online PTE practice tests across all
              sections.
            </p>
          </div>

          {parentCategories.map((parent) => {
            const childCategories = initialCategories.filter(
              (c) => c.parent === parent.id
            )

            return (
              <section key={parent.id} className="mb-8">
                <div className="mb-4 flex items-center gap-4">
                  <Image
                    src={parent.icon}
                    alt={parent.title}
                    width={40}
                    height={40}
                  />
                  <h2 className="text-xl font-semibold dark:text-gray-100">{parent.title}</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {childCategories.map((child) => (
                    <Card key={child.id}>
                      <CardContent className="flex h-full flex-col p-4">
                        <div className="mb-4 flex items-center gap-4">
                          <Image
                            src={child.icon}
                            alt={child.title}
                            width={32}
                            height={32}
                          />
                          <div>
                            <p className="font-medium dark:text-gray-100">{child.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {child.question_count} questions available
                            </p>
                          </div>
                        </div>

                        <p className="flex-grow text-sm text-gray-600 dark:text-gray-400">
                          {child.description}
                        </p>

                        <div className="mt-4 flex justify-end">
                          <Button asChild variant="outline">
                            <Link
                              href={`/pte/academic/practice/section-tests/${parent.code}`}
                            >
                              View Question Types
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

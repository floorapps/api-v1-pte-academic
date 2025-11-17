import { QuestionsTableSkeleton } from '@/components/pte/questions-table'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-28 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Questions table skeleton */}
        <QuestionsTableSkeleton />
      </div>
    </div>
  )
}
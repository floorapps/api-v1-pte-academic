export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted"></div>
        </div>

        {/* Main content skeleton */}
        <div className="space-y-6">
          <div className="h-64 w-full animate-pulse rounded bg-muted"></div>
          <div className="flex justify-between">
            <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
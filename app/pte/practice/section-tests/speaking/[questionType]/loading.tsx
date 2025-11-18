import { LoadingSkeleton } from "@/components/pte/loading-skeleton";

export default function Loading() {
  // Next 16: streaming fallback for dynamic segment to enable partial prefetch + instant nav
  return (
    <div className="p-4 md:p-6">
      <LoadingSkeleton height="400px" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-4 rounded-lg border bg-white p-4">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-100" />
            <div className="h-8 w-56 rounded bg-gray-200" />
            <div className="h-2 w-full rounded bg-gray-100" />
            <div className="flex gap-2">
              <div className="h-10 w-28 rounded bg-gray-100" />
              <div className="h-10 w-32 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

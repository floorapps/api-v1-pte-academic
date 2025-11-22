import { cn } from '@/lib/utils'

interface SkeletonCardProps {
    className?: string
    lines?: number
    showImage?: boolean
}

export function SkeletonCard({ className, lines = 3, showImage = false }: SkeletonCardProps) {
    return (
        <div className={cn('animate-pulse rounded-lg border border-gray-200 bg-white p-6', className)}>
            {showImage && (
                <div className="mb-4 h-40 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            )}
            <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className="h-3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
                        style={{ width: `${60 + ((i * 13) % 40)}%` }}
                    />
                ))}
            </div>
        </div>
    )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
                <div className="h-4 w-1/4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-4">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div
                                key={j}
                                className="h-3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                            <div className="h-3 w-1/2 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

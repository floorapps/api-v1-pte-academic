'use client'

import { useQueryStates } from 'nuqs'
import { cn } from '@/lib/utils'
import {
  pteCategoryParser,
  examTypeParser,
  pteCategories,
  examTypes,
} from '@/lib/parsers'

export function PracticeFilters() {
  const [{ category, type }, setFilters] = useQueryStates(
    {
      category: pteCategoryParser,
      type: examTypeParser,
    },
    {
      history: 'push',
    }
  )

  const currentCategory = category.toLowerCase()
  const currentType = type.toLowerCase()

  return (
    <div className="flex flex-col gap-6">
      {/* Exam Type */}
      <div>
        <h3 className="mb-2 text-sm font-medium">Exam Type</h3>
        <div className="inline-flex overflow-hidden rounded-md border bg-white">
          {examTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ type: t })}
              className={cn(
                'px-4 py-2 text-sm capitalize',
                currentType === t
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-100'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {pteCategories.map((c) => (
          <button
            key={c}
            onClick={() => setFilters({ category: c })}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm capitalize',
              currentCategory === c
                ? 'border border-orange-300 bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

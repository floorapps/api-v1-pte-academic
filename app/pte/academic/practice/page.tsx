import { Suspense } from 'react'
import { PracticeDashboard } from '@/components/pte/practice-dashboard'

export default function AcademicPracticePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-6">Loading Practice...</div>}>
        <PracticeDashboard />
      </Suspense>
    </div>
  )
}

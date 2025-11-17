import { Suspense } from 'react'
import { OnePTEDashboard } from '@/components/pte/app-dashboard'

export default function AcademicPracticePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-6">Loading Practice...</div>}>
        <OnePTEDashboard />
      </Suspense>
    </div>
  )
}

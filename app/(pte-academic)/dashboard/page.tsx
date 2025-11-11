import { Suspense } from 'react';
import { getUserProfile } from '@/lib/db/queries';
import { getAcademicDashboardData } from '@/lib/pte/queries';
import { AcademicDashboardHeader } from '@/components/pte/academic-dashboard-header';
import { AcademicStatsCards } from '@/components/pte/academic-stats-cards';
import { AcademicProgressChart } from '@/components/pte/academic-progress-chart';
import { AcademicPerformanceChart } from '@/components/pte/academic-performance-chart';
import { AcademicGoalsSection } from '@/components/pte/academic-goals-section';
import { LoadingSkeleton } from '@/components/pte/loading-skeleton';

export default async function AcademicDashboardPage() {
  const user = await getUserProfile();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Please login to access the dashboard</h2>
        </div>
      </div>
    );
  }

  // Fetch academic dashboard data with SSR
  const academicData = await getAcademicDashboardData(user.id, user.targetScore ?? 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AcademicDashboardHeader user={user} />
      
      <Suspense fallback={<LoadingSkeleton />}>
        <AcademicStatsCards data={academicData.stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSkeleton height="300px" />}>
          <AcademicProgressChart data={academicData.progress} />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton height="300px" />}>
          <AcademicPerformanceChart data={academicData.performance} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton height="400px" />}>
            <AcademicGoalsSection goals={academicData.goals} userTargetScore={user.targetScore ?? 65} />
          </Suspense>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Academic Resources</h3>
            <div className="space-y-3">
              <a href="/pte-academic/courses" className="block p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">Courses</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access your enrolled courses</p>
              </a>
              <a href="/pte-academic/library" className="block p-3 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                <h4 className="font-medium text-green-700 dark:text-green-300">Library</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study materials and resources</p>
              </a>
              <a href="/pte-academic/schedule" className="block p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                <h4 className="font-medium text-purple-700 dark:text-purple-300">Schedule</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your academic calendar</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
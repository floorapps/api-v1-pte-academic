'use server'

import { getFeatureStats } from '@/lib/pte/queries'

/**
 * A Server Action to fetch dashboard feature statistics.
 * This demonstrates how to use Server Actions for data fetching,
 * potentially replacing the need for API routes.
 */
export async function getDashboardFeatureStatsAction() {
  try {
    const stats = await getFeatureStats()
    return { data: stats }
  } catch (error) {
    console.error('Error in getDashboardFeatureStatsAction:', error)
    return { error: 'Failed to fetch dashboard stats.' }
  }
}

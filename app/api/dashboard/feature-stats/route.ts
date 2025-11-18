import { NextRequest, NextResponse } from 'next/server'
import { getFeatureStats } from '@/lib/pte/queries'

export async function GET(request: NextRequest) {
  try {
    const featureStats = await getFeatureStats()
    return NextResponse.json(featureStats)
  } catch (error) {
    // The query function handles user authentication and will throw an error
    if ((error as Error).message === 'User not authenticated') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Error fetching feature stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature statistics' },
      { status: 500 }
    )
  }
}
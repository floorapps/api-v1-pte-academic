import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import { userProfiles } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (!profile.length) {
      return NextResponse.json({ targetScore: null })
    }

    return NextResponse.json({ targetScore: profile[0].targetScore })
  } catch (error) {
    console.error('Error fetching target score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch target score' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetScore } = await request.json()

    if (
      typeof targetScore !== 'number' ||
      targetScore < 30 ||
      targetScore > 90
    ) {
      return NextResponse.json(
        { error: 'Target score must be between 30 and 90' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (existingProfile.length) {
      await db
        .update(userProfiles)
        .set({ targetScore })
        .where(eq(userProfiles.userId, user.id))
    } else {
      await db.insert(userProfiles).values({
        userId: user.id,
        targetScore,
      })
    }

    return NextResponse.json({ success: true, targetScore })
  } catch (error) {
    console.error('Error updating target score:', error)
    return NextResponse.json(
      { error: 'Failed to update target score' },
      { status: 500 }
    )
  }
}

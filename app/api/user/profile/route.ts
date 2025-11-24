import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db/drizzle'
import { userProfiles, users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    })

    return NextResponse.json(profile || {})
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { examDate, targetScore } = body

    // Check if profile exists
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    })

    if (existing) {
      // Update existing profile
      const updated = await db
        .update(userProfiles)
        .set({
          examDate: examDate ? new Date(examDate) : null,
          targetScore: targetScore || null,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, session.user.id))
        .returning()

      if (!updated || updated.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }

      return NextResponse.json(updated[0])
    } else {
      // Create new profile
      const created = await db
        .insert(userProfiles)
        .values({
          userId: session.user.id,
          examDate: examDate ? new Date(examDate) : null,
          targetScore: targetScore || null,
        })
        .returning()

      if (!created || created.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      return NextResponse.json(created[0])
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

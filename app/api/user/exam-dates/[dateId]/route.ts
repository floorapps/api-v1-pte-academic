import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { userScheduledExamDates } from '@/lib/db/schema'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dateId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dateId } = await params

    // Ensure user can only delete their own exam dates
    const examDate = await db
      .select()
      .from(userScheduledExamDates)
      .where(
        and(
          eq(userScheduledExamDates.id, dateId),
          eq(userScheduledExamDates.userId, session.user.id)
        )
      )
      .limit(1)

    if (!examDate.length) {
      return NextResponse.json(
        { error: 'Exam date not found' },
        { status: 404 }
      )
    }

    await db
      .delete(userScheduledExamDates)
      .where(eq(userScheduledExamDates.id, dateId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exam date:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam date' },
      { status: 500 }
    )
  }
}

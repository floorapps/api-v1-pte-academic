import 'server-only'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getCreditStatus } from '@/lib/subscription/credits'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const status = await getCreditStatus(session.user.id)
    return NextResponse.json(status, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to get credit status' }, { status: 500 })
  }
}
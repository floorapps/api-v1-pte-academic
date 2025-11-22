import 'server-only'
import { NextResponse } from 'next/server'
import { scoreSpeakingAction } from '@/lib/actions/score'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, transcript, promptText, situation } = body || {}
    const result = await scoreSpeakingAction({ type, transcript, promptText, situation })
    return NextResponse.json(result, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to score speaking' }, { status: 500 })
  }
}
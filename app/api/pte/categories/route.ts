import { NextResponse } from 'next/server'
import { initialCategories } from '@/lib/pte/data'

export async function GET() {
  return NextResponse.json(initialCategories)
}

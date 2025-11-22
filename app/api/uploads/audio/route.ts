import { uploadAudio } from '@/lib/actions/upload-actions'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const blob = await uploadAudio(formData)

        return NextResponse.json(blob)
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}

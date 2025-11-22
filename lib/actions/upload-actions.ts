'use server'

import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'
import type { SpeakingType } from '@/lib/pte/types'

const ALLOWED_MIME = new Set([
    'audio/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
])

const MAX_BYTES = 15 * 1024 * 1024 // 15MB

export async function uploadAudio(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    const type = formData.get('type') as SpeakingType
    const questionId = formData.get('questionId') as string
    const ext = formData.get('ext') as string || 'webm'

    if (!file) {
        throw new Error('No file provided')
    }

    if (file.size > MAX_BYTES) {
        throw new Error('File too large (max 15MB)')
    }

    if (!ALLOWED_MIME.has(file.type)) {
        throw new Error('Invalid file type')
    }

    const filename = `pte/speaking/${type}/${questionId}/${randomUUID()}.${ext}`

    const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
    })

    return blob
}

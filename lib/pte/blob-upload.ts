import type { SpeakingType } from '@/lib/pte/types'
import { uploadAudio } from '@/lib/actions/upload-actions'

export type AudioUploadParams = {
  type: SpeakingType
  questionId: string
  ext?: 'webm' | 'mp3' | 'wav' | 'm4a'
}

export async function uploadAudioWithFallback(
  file: Blob,
  params: AudioUploadParams
): Promise<{ blobUrl: string; pathname: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', params.type)
  formData.append('questionId', params.questionId)
  if (params.ext) formData.append('ext', params.ext)

  try {
    const blob = await uploadAudio(formData)
    return { blobUrl: blob.url, pathname: blob.pathname }
  } catch (error: any) {
    throw new Error(error.message || 'Upload failed')
  }
}

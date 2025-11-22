import React from 'react'
import { mediaKindFromUrl } from '@/lib/pte/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AudioPlayer } from '@/components/ui/audio-player'
// import removed: use central schema types if needed from '@/lib/db/schema'
import { getFileUrl } from '@/lib/db/storage'

type Prompt = {
  title?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
}

type Props = {
  question: Prompt | null
}

export default function QuestionPrompt({ question }: Props) {
  if (!question) {
    return (
      <div className="text-muted-foreground rounded-md border p-4 text-sm">
        No question found.
      </div>
    )
  }

  const { title, promptText, promptMediaUrl } = question
  const kind = promptMediaUrl ? mediaKindFromUrl(promptMediaUrl) : 'unknown'

  return (
    <div className="space-y-4">
      {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}

      {/* Text prompt */}
      {promptText ? (
        <div className="bg-muted/30 rounded-md border p-4">
          <p className="whitespace-pre-line">{promptText}</p>
        </div>
      ) : null}

      {/* Media prompt */}
      {promptMediaUrl ? (
        kind === 'audio' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Audio</label>
            <AudioPlayer src={promptMediaUrl} />
          </div>
        ) : kind === 'image' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Image</label>
            <div className="rounded-md border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={promptMediaUrl}
                alt={title ? `Image for "${title}"` : 'Prompt image'}
                className="mx-auto max-h-[360px] w-auto object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Unsupported media type.
          </div>
        )
      ) : null}
    </div>
  )
}

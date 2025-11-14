'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Scores = {
  total?: number | null
  wordCount?: number | null
  sentenceCount?: number | null
  length?: {
    min: number
    max: number
    withinRange: boolean
  }
  metrics?: {
    uniqueWordRatio?: number
    charCount?: number
  }
  grammar?: number | null
  vocabulary?: number | null
  coherence?: number | null
  taskResponse?: number | null
  [k: string]: any
}

type Props = {
  scores: Scores | null
}

function ScoreBox({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  tone?: 'default' | 'ok' | 'warn' | 'bad'
}) {
  const toneClass =
    tone === 'ok'
      ? 'text-green-700'
      : tone === 'warn'
        ? 'text-yellow-700'
        : tone === 'bad'
          ? 'text-red-700'
          : 'text-foreground'
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}

export default function WritingScoreBreakdown({ scores }: Props) {
  if (!scores) {
    return null
  }

  const total = typeof scores.total === 'number' ? scores.total : null
  const wc = typeof scores.wordCount === 'number' ? scores.wordCount : null
  const sc =
    typeof scores.sentenceCount === 'number' ? scores.sentenceCount : null
  const within = scores.length?.withinRange ?? null
  const min = scores.length?.min ?? null
  const max = scores.length?.max ?? null

  const uwr =
    typeof scores.metrics?.uniqueWordRatio === 'number'
      ? scores.metrics.uniqueWordRatio
      : null
  const chars =
    typeof scores.metrics?.charCount === 'number'
      ? scores.metrics.charCount
      : null

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">Score Breakdown</h3>
        <div className="flex items-center gap-2">
          {total !== null ? (
            <Badge
              variant="default"
              className={`text-xs ${total >= 75 ? 'bg-green-600' : total >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
              title="Heuristic total score (0–90). AI scoring to be integrated."
            >
              Total: {total}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Scored
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <ScoreBox
          label="Word Count"
          value={wc ?? '—'}
          tone={wc !== null ? 'default' : 'default'}
        />
        <ScoreBox label="Sentences" value={sc ?? '—'} />
        <ScoreBox
          label="Length Range"
          value={within === null ? '—' : within ? 'Within' : 'Out of range'}
          tone={within === null ? 'default' : within ? 'ok' : 'bad'}
        />
        <ScoreBox
          label="Target (min–max)"
          value={min !== null && max !== null ? `${min}–${max}` : '—'}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">
                Unique Word Ratio
              </div>
              <div className="text-lg font-medium">
                {uwr !== null ? uwr.toFixed(3) : '—'}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">Characters</div>
              <div className="text-lg font-medium">{chars ?? '—'}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">Grammar</div>
              <div className="text-lg font-medium">{scores.grammar ?? '—'}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">Vocabulary</div>
              <div className="text-lg font-medium">
                {scores.vocabulary ?? '—'}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">Coherence</div>
              <div className="text-lg font-medium">
                {scores.coherence ?? '—'}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground text-xs">Task Response</div>
              <div className="text-lg font-medium">
                {typeof scores.taskResponse === 'number'
                  ? scores.taskResponse === 1
                    ? 'Yes'
                    : scores.taskResponse
                  : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw JSON (debug) */}
      <details className="text-xs">
        <summary className="cursor-pointer select-none">Details (JSON)</summary>
        <pre className="bg-muted mt-2 overflow-auto rounded p-3">
          {JSON.stringify(scores, null, 2)}
        </pre>
      </details>
    </div>
  )
}

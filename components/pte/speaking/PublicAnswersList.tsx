'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ScoreDetailsDialog from '@/components/pte/speaking/ScoreDetailsDialog'

type PublicAnswer = {
  id: string
  userName?: string
  audioUrl: string
  transcript?: string | null
  scores?: any
  durationMs?: number | null
  wordsPerMinute?: string | null
  fillerRate?: string | null
  createdAt?: string
}

type Props = {
  questionId: string
  sortBy?: 'score' | 'recent'
  minScore?: number
}

function fmtDate(s?: string) {
  if (!s) return ''
  try {
    const d = new Date(s)
    return d.toLocaleString()
  } catch {
    return s
  }
}

export default function PublicAnswersList({ questionId, sortBy = 'recent', minScore = 0 }: Props) {
  const [items, setItems] = useState<PublicAnswer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const url = new URL(`/api/speaking/questions/${encodeURIComponent(questionId)}/public-answers`, window.location.origin)
        url.searchParams.set('page', '1')
        url.searchParams.set('pageSize', '10')
        url.searchParams.set('minScore', String(minScore))
        url.searchParams.set('sortBy', sortBy)
        const res = await fetch(url.toString(), { cache: 'no-store' })
        if (!res.ok) {
          const msg = (await res.json().catch(() => null))?.error || `Failed to load public answers (${res.status})`
          throw new Error(msg)
        }
        const json = await res.json()
        setItems(Array.isArray(json?.answers) ? json.answers : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load public answers')
      } finally {
        setLoading(false)
      }
    })()
  }, [questionId, sortBy, minScore])

  const content = useMemo(() => {
    if (loading) return <div className="text-muted-foreground text-sm">Loading…</div>
    if (error) return <div role="alert" className="text-sm text-red-600">{error}</div>
    if (!items.length) return <div className="text-muted-foreground text-sm">No public answers yet.</div>

    return (
      <ul className="space-y-4">
        {items.map((a) => {
          const s = (a.scores || {}) as any
          const content = s?.content ?? null
          const pronunciation = s?.pronunciation ?? null
          const fluency = s?.fluency ?? null
          const total = s?.total ?? null
          return (
            <li key={a.id} className="rounded-md border p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs">
                    {a.userName || 'Anonymous'} · {fmtDate(a.createdAt)}
                  </div>
                  <audio className="mt-2 w-full" controls preload="none" src={a.audioUrl} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Total: {total ?? '—'}</Badge>
                  <Badge variant="secondary">Content: {content ?? '—'}</Badge>
                  <Badge variant="secondary">Pronun: {pronunciation ?? '—'}</Badge>
                  <Badge variant="secondary">Fluency: {fluency ?? '—'}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAttempt({ ...a, type: 'read_aloud' })
                      setDialogOpen(true)
                    }}
                  >
                    Score Info {total != null ? `${total}/90` : ''}
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }, [items, loading, error])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Public Answers</h3>
      </div>
      {content}
      <ScoreDetailsDialog open={dialogOpen} onOpenChange={setDialogOpen} attempt={selectedAttempt} />
    </div>
  )
}
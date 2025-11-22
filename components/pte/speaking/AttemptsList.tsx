'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Attempt = {
  id: string
  questionId: string
  type: string
  audioUrl: string
  scores?: {
    content?: number
    pronunciation?: number
    fluency?: number
    total?: number
    [k: string]: any
  }
  createdAt?: string
}

type Props = {
  questionId: string
  onSelectAttempt?: (attempt: Attempt) => void
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

export default function AttemptsList({ questionId, onSelectAttempt }: Props) {
  const [items, setItems] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttempts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/speaking/attempts', window.location.origin)
      url.searchParams.set('questionId', questionId)
      url.searchParams.set('page', '1')
      url.searchParams.set('pageSize', '25')
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (res.status === 401) {
        setError('Login required to view attempts.')
        setItems([])
        return
      }
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Failed to load attempts (${res.status})`
        throw new Error(msg)
      }
      const data = await res.json()
      const attempts: Attempt[] = Array.isArray(data?.items) ? data.items : []
      // latest first (API should already do this)
      attempts.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      setItems(attempts)
    } catch (e: any) {
      setError(e?.message || 'Failed to load attempts.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchAttempts()
  }, [fetchAttempts])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="text-muted-foreground text-sm">Loading attempts...</div>
      )
    }
    if (error) {
      return (
        <div role="alert" className="text-sm text-red-600">
          {error}
          {error.toLowerCase().includes('login') ? (
            <span>
              {' '}
              &middot;{' '}
              <a href="/sign-in" className="underline">
                Sign in
              </a>
            </span>
          ) : null}
        </div>
      )
    }
    if (!items.length) {
      return (
        <div className="text-muted-foreground text-sm">No attempts yet.</div>
      )
    }
    return (
      <ul className="space-y-4">
        {items.map((a) => {
          const s = a.scores || {}
          return (
            <li key={a.id} className="rounded-md border p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs">
                    {fmtDate(a.createdAt)}
                  </div>
                  <audio
                    className="mt-2 w-full"
                    controls
                    preload="none"
                    src={a.audioUrl}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    aria-label={`Content score ${s.content ?? 'NA'}`}
                  >
                    Content: {s.content ?? '—'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    aria-label={`Pronunciation score ${s.pronunciation ?? 'NA'}`}
                  >
                    Pronun: {s.pronunciation ?? '—'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    aria-label={`Fluency score ${s.fluency ?? 'NA'}`}
                  >
                    Fluency: {s.fluency ?? '—'}
                  </Badge>
                  <Badge
                    variant="default"
                    aria-label={`Total score ${s.total ?? 'NA'}`}
                  >
                    Total: {s.total ?? '—'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectAttempt?.(a)}
                    aria-label="Score Info"
                  >
                    <span className="text-primary pe-1">Score Info</span>
                    {s.total ?? '—'}/90
                  </Button>
                  {s?.meta?.wordsPerMinute ? (
                    <Badge variant="outline" aria-label={`WPM ${s.meta.wordsPerMinute}`}>
                      WPM: {s.meta.wordsPerMinute}
                    </Badge>
                  ) : null}
                  {s?.meta?.fillerRate ? (
                    <Badge variant="outline" aria-label={`Filler rate ${s.meta.fillerRate}`}>
                      Fillers: {s.meta.fillerRate}
                    </Badge>
                  ) : null}
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
        <h3 className="text-base font-semibold">Attempts</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchAttempts}
          aria-label="Refresh attempts"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      {content}
    </div>
  )
}

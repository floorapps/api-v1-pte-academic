'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AttemptsList from '@/components/pte/speaking/AttemptsList'
import SpeakingBoards from '@/components/pte/speaking/SpeakingBoards'
import QuestionPrompt from '@/components/pte/speaking/QuestionPrompt'
import ScoreDetailsDialog from '@/components/pte/speaking/ScoreDetailsDialog'
import SpeakingRecorder from '@/components/pte/speaking/SpeakingRecorder'
import { Button } from '@/components/ui/button'
import { uploadAudioWithFallback } from '@/lib/pte/blob-upload'
import {
  SPEAKING_TIMER_MAP,
  type SpeakingTimings,
  type SpeakingType,
} from '@/lib/pte/types'

type Props = {
  questionId: string
  questionType: SpeakingType
}

type QuestionPayload = {
  question: {
    id: string
    type: SpeakingType
    title?: string | null
    promptText?: string | null
    promptMediaUrl?: string | null
    difficulty?: string | null
    createdAt?: string | null
  }
  prevId: string | null
  nextId: string | null
}

export default function SpeakingQuestionClient({
  questionId,
  questionType,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [payload, setPayload] = useState<QuestionPayload | null>(null)

  const [recorded, setRecorded] = useState<{
    blob: Blob
    durationMs: number
    timings: SpeakingTimings
  } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [lastAttempt, setLastAttempt] = useState<any | null>(null)
  const [tick, setTick] = useState<{ state?: string; prepRemainingMs?: number; recordElapsedMs?: number }>({})

  const [attemptsKey, setAttemptsKey] = useState(0)
  const [recorderKey, setRecorderKey] = useState(0)

  const timers = useMemo(() => SPEAKING_TIMER_MAP[questionType], [questionType])

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(
        `/api/speaking/questions/${encodeURIComponent(questionId)}`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Failed to load question (${res.status})`
        throw new Error(msg)
      }
      const data = (await res.json()) as QuestionPayload
      setPayload(data)
    } catch (e: any) {
      setFetchError(e?.message || 'Failed to load question.')
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  const onRecorded = useCallback(
    (data: { blob: Blob; durationMs: number; timings: SpeakingTimings }) => {
      setSubmitError(null)
      setRecorded(data)
    },
    []
  )

  const redoAll = useCallback(() => {
    setRecorded(null)
    setSubmitError(null)
    setRecorderKey((k) => k + 1) // remount recorder to full reset
  }, [])

  const onSubmit = useCallback(async () => {
    if (!recorded) {
      setSubmitError('Please record your answer first.')
      return
    }
    setSubmitError(null)

    // Client-side size guard (15MB)
    const MAX_BYTES = 15 * 1024 * 1024
    if (recorded.blob.size > MAX_BYTES) {
      setSubmitError(
        'Recording exceeds 15MB limit. Please try a shorter response.'
      )
      return
    }

    setSubmitting(true)
    try {
      // Wrap blob as File with correct mime
      const file = new File([recorded.blob], `attempt-${questionId}.webm`, {
        type: 'audio/webm;codecs=opus',
      })

      // Upload to Blob (presign or fallback)
      const { blobUrl } = await uploadAudioWithFallback(file, {
        type: questionType,
        questionId,
      })

      // POST attempt
      const body = {
        questionId,
        type: questionType,
        audioUrl: blobUrl,
        durationMs: recorded.durationMs,
        timings: recorded.timings,
      }
      const res = await fetch('/api/speaking/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        setSubmitError(
          'Login required to submit attempts. Sign in to continue.'
        )
        return
      }
      if (!res.ok) {
        const msg =
          (await res.json().catch(() => null))?.error ||
          `Submission failed (${res.status})`
        throw new Error(msg)
      }

      const json = await res.json()
      const attempt = json?.attempt
      setLastAttempt(attempt || null)
      setDialogOpen(true)
      // Trigger attempts list refresh
      setAttemptsKey((k) => k + 1)
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit attempt.')
    } finally {
      setSubmitting(false)
    }
  }, [recorded, questionId, questionType])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground rounded-md border p-4 text-sm">
          Loading question…
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-red-600"
        >
          {fetchError}
        </div>
      </div>
    )
  }

  const q = payload?.question

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <QuestionPrompt question={q || null} />

      {/* External time label */}
      <p className="text-sm">Time: {(() => {
        const s = tick.state
        if (s === 'prepping') {
          const rem = Math.ceil((tick.prepRemainingMs || 0) / 1000)
          const mm = Math.floor(rem / 60).toString().padStart(2, '0')
          const ss = (rem % 60).toString().padStart(2, '0')
          return `${mm}:${ss}`
        }
        if (s === 'recording') {
          const left = Math.max(0, Math.ceil(((timers.recordMs || 0) - (tick.recordElapsedMs || 0)) / 1000))
          const mm = Math.floor(left / 60).toString().padStart(2, '0')
          const ss = (left % 60).toString().padStart(2, '0')
          return `${mm}:${ss}`
        }
        return '00:00'
      })()}</p>

      {/* Recorder */}
      <div className="space-y-3 rounded-md border p-4">
        <SpeakingRecorder
          key={recorderKey}
          type={questionType}
          timers={timers}
          onRecorded={onRecorded}
          auto={{ active: true }}
          onTick={(t) => setTick(t)}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            aria-label="Submit attempt"
            onClick={onSubmit}
            disabled={!recorded || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
          <Button
            aria-label="Redo recording"
            variant="outline"
            onClick={redoAll}
          >
            Redo
          </Button>
          <a
            aria-label="Help for this task"
            href="/pte/ai-coach"
            className="text-sm underline"
          >
            Help
          </a>
        </div>

        {submitError ? (
          <div role="alert" className="text-sm text-red-600">
            {submitError}
            {submitError.toLowerCase().includes('login') ? (
              <span>
                {' '}
                ·{' '}
                <a href="/sign-in" className="underline">
                  Sign in
                </a>
              </span>
            ) : null}
          </div>
        ) : null}

        {!recorded ? (
          <p className="text-muted-foreground text-xs">
            Record your response, then click Submit to get AI scoring.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Ready to submit. Duration:{' '}
            {Math.round((recorded.durationMs || 0) / 1000)}s
          </p>
        )}
      </div>

      {/* Attempts list */}
      <div className="rounded-md border p-4">
        <AttemptsList
          key={attemptsKey}
          questionId={questionId}
          onSelectAttempt={(a) => {
            setLastAttempt(a)
            setDialogOpen(true)
          }}
        />
      </div>

      {/* Search + Navigation */}
      <div className="flex items-center gap-2">
        <input aria-label="Question" placeholder="Question..." className="border rounded-md h-9 px-2" />
        <Button aria-label="Search">Search</Button>
        {payload?.prevId ? (
          <a href={`/pte/academic/practice/speaking/${questionType.replaceAll('_','-')}/question/${payload.prevId}`}>
            <Button>Previous</Button>
          </a>
        ) : null}
        {payload?.nextId ? (
          <a href={`/pte/academic/practice/speaking/${questionType.replaceAll('_','-')}/question/${payload.nextId}`}>
            <Button>Next</Button>
          </a>
        ) : null}
      </div>

      {/* Discussion Boards */}
      <div className="mt-6">
        <SpeakingBoards questionId={questionId} questionType={questionType} />
      </div>

      {/* Score dialog */}
      <ScoreDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        attempt={lastAttempt}
      />
    </div>
  )
}

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  attempt: any | null
}

function asNumber(n: any): number | null {
  const v =
    typeof n === 'number' ? n : Number.isFinite(Number(n)) ? Number(n) : null
  return Number.isFinite(v as number) ? (v as number) : null
}

export default function ScoreDetailsDialog({
  open,
  onOpenChange,
  attempt,
}: Props) {
  const scores = (attempt?.scores as any) || {}
  const content = asNumber(scores?.content)
  const pronunciation = asNumber(scores?.pronunciation)
  const fluency = asNumber(scores?.fluency)
  const total = asNumber(scores?.total)
  const rubric = scores?.rubric || {}
  const feedback = scores?.feedback || {}
  const audioUrl: string | undefined = attempt?.audioUrl
  const transcript: string | undefined = attempt?.transcript

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiDetails, setAiDetails] = useState<any | null>(null)

  useEffect(() => {
    if (!open || !attempt) return
    setAiError(null)
    setAiLoading(true)
    ;(async () => {
      try {
        const res = await fetch('/api/score/speaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: attempt?.type,
            transcript: transcript || '',
            promptText: attempt?.promptText || undefined,
          }),
        })
        if (!res.ok) {
          const msg = (await res.json().catch(() => null))?.error || 'Failed to fetch AI details'
          throw new Error(msg)
        }
        const result = await res.json()
        setAiDetails({
          overall: result.overall,
          subscores: result.subscores,
          rationale: result.rationale,
          metadata: { provider: 'google-genai', model: 'gemini-1.5-pro-latest' },
        })
      } catch (e: any) {
        setAiError(e?.message || 'Failed to fetch AI details')
        setAiDetails(null)
      } finally {
        setAiLoading(false)
      }
    })()
  }, [open, attempt?.id])

  const aiSubscores = useMemo(() => {
    const s = (aiDetails?.subscores as any) || {}
    return {
      content: asNumber(s?.content),
      pronunciation: asNumber(s?.pronunciation),
      fluency: asNumber(s?.fluency),
      grammar: asNumber(s?.grammar),
      vocabulary: asNumber(s?.vocabulary),
    }
  }, [aiDetails])
  const providerMeta = useMemo(() => {
    const m = (aiDetails?.metadata?.providers?.[0] as any) || (aiDetails?.metadata as any) || {}
    return { provider: m?.provider, model: m?.model, latencyMs: m?.latencyMs }
  }, [aiDetails])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Score details dialog">
        <DialogHeader>
          <DialogTitle>AI Score Details</DialogTitle>
          <DialogDescription>
            Review your speaking attempt scores and suggestions.
          </DialogDescription>
        </DialogHeader>

        {/* Audio preview */}
        {audioUrl ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="attempt-audio">
              Submitted Audio
            </label>
            <audio
              id="attempt-audio"
              className="w-full"
              controls
              preload="none"
              src={audioUrl}
            />
          </div>
        ) : null}

        {/* Summary - 0-5 scale */}
        <div
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="group"
          aria-label="Score summary"
        >
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground text-xs">Content</div>
            <div className="text-xl font-semibold">
              {content !== null ? `${content}/5` : '—'}
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground text-xs">Pronunciation</div>
            <div className="text-xl font-semibold">
              {pronunciation !== null ? `${pronunciation}/5` : '—'}
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground text-xs">Fluency</div>
            <div className="text-xl font-semibold">
              {fluency !== null ? `${fluency}/5` : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-md border p-3">
            <div className="text-muted-foreground text-xs">
              Total Score
            </div>
            <div className="text-xl font-bold">
              {total !== null ? `${total}/90` : '—'}
            </div>
          </div>
        </div>

        {/* Transcript */}
        {transcript ? (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">AI Speech Recognition</div>
            <div className="rounded-md border p-3 text-sm">{transcript}</div>
          </div>
        ) : null}

        {/* Suggestions */}
        <div className="mt-4 space-y-3">
          {rubric?.contentNotes ||
          rubric?.fluencyNotes ||
          rubric?.pronunciationNotes ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Rubric Notes</div>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {rubric?.contentNotes ? <li>{rubric.contentNotes}</li> : null}
                {rubric?.fluencyNotes ? <li>{rubric.fluencyNotes}</li> : null}
                {rubric?.pronunciationNotes ? (
                  <li>{rubric.pronunciationNotes}</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {Array.isArray(feedback?.suggestions) &&
          feedback.suggestions.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {feedback.suggestions.map((s: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* Optional strengths / areas */}
          {(Array.isArray(feedback?.strengths) &&
            feedback.strengths.length > 0) ||
          (Array.isArray(feedback?.areasForImprovement) &&
            feedback.areasForImprovement.length > 0) ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.isArray(feedback?.strengths) &&
              feedback.strengths.length > 0 ? (
                <div className="rounded-md border p-3">
                  <div className="mb-1 text-sm font-medium">Strengths</div>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {feedback.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {Array.isArray(feedback?.areasForImprovement) &&
              feedback.areasForImprovement.length > 0 ? (
                <div className="rounded-md border p-3">
                  <div className="mb-1 text-sm font-medium">
                    Areas for Improvement
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {feedback.areasForImprovement.map(
                      (s: string, i: number) => (
                        <li key={i}>{s}</li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* AI Details (0–90 subscores + rationale) */}
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">AI Details</div>
            {aiLoading ? (
              <div className="text-muted-foreground text-sm">Loading AI details…</div>
            ) : aiError ? (
              <div role="alert" className="text-sm text-red-600">{aiError}</div>
            ) : aiDetails ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs">Content</div>
                    <div className="text-base font-semibold">{aiSubscores.content ?? '—'}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs">Pronunciation</div>
                    <div className="text-base font-semibold">{aiSubscores.pronunciation ?? '—'}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs">Fluency</div>
                    <div className="text-base font-semibold">{aiSubscores.fluency ?? '—'}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs">Grammar</div>
                    <div className="text-base font-semibold">{aiSubscores.grammar ?? '—'}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground text-xs">Vocabulary</div>
                    <div className="text-base font-semibold">{aiSubscores.vocabulary ?? '—'}</div>
                  </div>
                </div>
                {aiDetails?.rationale ? (
                  <div className="rounded-md border p-3 text-sm">{aiDetails.rationale}</div>
                ) : null}
                {(providerMeta.provider || providerMeta.model) ? (
                  <div className="text-muted-foreground text-xs">
                    Provider: {providerMeta.provider || '—'} · Model: {providerMeta.model || '—'} · Latency: {providerMeta.latencyMs ?? '—'}ms
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

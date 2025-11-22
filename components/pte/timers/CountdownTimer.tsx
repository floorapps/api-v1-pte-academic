'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { format as formatMs } from '@/lib/pte/timing'

type Props = {
  // Total duration of this timer window in ms
  durationMs: number
  // Authoritative server start timestamp (epoch ms)
  startTsServer: number
  // Optional server end timestamp (epoch ms). If provided, we trust this over durationMs.
  endTsServer?: number
  // Called roughly every 250ms with remainingMs
  onTick?: (remainingMs: number) => void
  // Called once when timer reaches 0
  onExpire?: () => void
  // Visible label next to timer
  label?: string
  // Screen-reader label for the countdown region
  srLabel?: string
  // Optional className
  className?: string
  // Whether to announce at key thresholds (last 10 seconds)
  announceThresholds?: boolean
}

const TICK_MS = 250

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function CountdownTimer({
  durationMs,
  startTsServer,
  endTsServer,
  onTick,
  onExpire,
  label,
  srLabel = 'Countdown timer',
  className,
  announceThresholds = true,
}: Props) {
  // Compute end time once
  const endTs = useMemo(() => {
    const end =
      endTsServer && Number.isFinite(endTsServer)
        ? endTsServer
        : startTsServer + durationMs
    return Math.max(end, startTsServer) // sanity
  }, [durationMs, endTsServer, startTsServer])

  const [now, setNow] = useState<number>(() => Date.now())

  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)
  const lastAnnouncedSecondRef = useRef<number | null>(null)

  // Derived values
  const remainingMs = Math.max(0, endTs - now)
  const percent = useMemo(() => {
    const total = Math.max(1, endTs - startTsServer)
    const used = clamp(total - remainingMs, 0, total)
    return Math.round((used / total) * 100)
  }, [endTs, startTsServer, remainingMs])

  // Accessibility: live region text
  const a11yText = useMemo(() => {
    const fmt = formatMs(remainingMs)
    return `${srLabel}: ${fmt} remaining`
  }, [remainingMs, srLabel])

  // Start ticking
  useEffect(() => {
    // Initial tick
    onTick?.(remainingMs)

    const id = setInterval(() => {
      setNow(Date.now())
    }, TICK_MS)
    rafRef.current = id

    return () => {
      if (rafRef.current) {
        clearInterval(rafRef.current)
        rafRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTs])

  // Expiry side effect
  useEffect(() => {
    if (!expiredRef.current && remainingMs <= 0) {
      expiredRef.current = true
      try {
        onExpire?.()
      } catch (e) {
         
        console.error('[CountdownTimer] onExpire error', e)
      }
    } else {
      onTick?.(remainingMs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs])

  // Visibility handling (no pause; re-sync on show)
  useEffect(() => {
    const onVis = () => {
      // Re-sync "now" immediately on visibility change
      const newNow = Date.now()
      setNow(newNow)

      // Drift telemetry: positive means client ahead of earlier reading
      const drift = newNow - now
      if (Math.abs(drift) > 1500) {
         
        console.log(
          '[CountdownTimer] visibilitychange re-sync, drift(ms)=',
          drift
        )
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [now])

  // Announcements in last 10s
  const [announcement, setAnnouncement] = useState<string>('')
  useEffect(() => {
    if (!announceThresholds) return
    const secs = Math.ceil(remainingMs / 1000)
    if (secs <= 10 && secs >= 0) {
      if (lastAnnouncedSecondRef.current !== secs) {
        lastAnnouncedSecondRef.current = secs
        const msg = secs === 0 ? 'Time is up.' : `${secs} seconds remaining.`
        setAnnouncement(msg)
      }
    }
  }, [announceThresholds, remainingMs])

  const formatted = useMemo(() => formatMs(remainingMs), [remainingMs])

  return (
    <div className={className} role="group" aria-label={srLabel}>
      {/* Visible row: label + time */}
      <div className="mb-1 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {label || 'Time remaining'}
        </div>
        <div
          className={`font-mono tabular-nums ${remainingMs <= 10_000 ? 'text-red-600' : ''}`}
        >
          {formatted}
        </div>
      </div>

      {/* Progress */}
      <Progress value={percent} aria-label={srLabel} />

      {/* Live region for SR users */}
      <div aria-live="polite" className="sr-only">
        {a11yText}
      </div>
      {announcement ? (
        <div aria-live="assertive" className="sr-only">
          {announcement}
        </div>
      ) : null}
    </div>
  )
}

'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  src: string
  rates?: number[]
}

export function AudioPlayer({ src, rates = [0.8, 1, 1.25, 1.5] }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [rate, setRate] = useState<number>(1)
  const [cur, setCur] = useState<number>(0)
  const [dur, setDur] = useState<number>(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCur(el.currentTime || 0)
    const onLoaded = () => setDur(el.duration || 0)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    try {
      el.playbackRate = rate
    } catch {}
  }, [rate])

  const fmt = useMemo(() => {
    const f = (n: number) => {
      const m = Math.floor(n / 60)
      const s = Math.floor(n % 60)
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return { cur: f(cur), dur: f(dur) }
  }, [cur, dur])

  return (
    <div className="space-y-2">
      <audio ref={audioRef} className="w-full" controls preload="none" src={src} />
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span>Speed</span>
          <div className="flex gap-1">
            {rates.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`rounded border px-2 py-1 ${r === rate ? 'bg-muted' : ''}`}
                aria-label={`Playback speed ${r}x`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>
        <div aria-label="time" className="font-mono">
          {fmt.cur} / {fmt.dur}
        </div>
      </div>
    </div>
  )
}

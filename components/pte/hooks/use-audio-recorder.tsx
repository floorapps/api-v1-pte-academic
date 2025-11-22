'use client'

import { useRef, useState, useEffect } from 'react'

interface UseAudioRecorderOptions {
    maxDuration?: number // in milliseconds
    onRecordingComplete?: (blob: Blob, duration: number) => void
}

export function useAudioRecorder({
    maxDuration = 40000,
    onRecordingComplete,
}: UseAudioRecorderOptions = {}) {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            })

            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                const duration = Date.now() - startTimeRef.current
                onRecordingComplete?.(blob, duration)

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop())
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setIsRecording(true)
            setError(null)
            startTimeRef.current = Date.now()

            // Start timer
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current
                setRecordingTime(elapsed)

                if (elapsed >= maxDuration) {
                    stopRecording()
                }
            }, 100)
        } catch (err) {
            setError('Failed to access microphone. Please grant permission.')
            console.error('Error accessing microphone:', err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.pause()
            setIsPaused(true)
        }
    }

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isPaused) {
            mediaRecorderRef.current.resume()
            setIsPaused(false)
        }
    }

    const resetRecording = () => {
        setAudioBlob(null)
        setRecordingTime(0)
        chunksRef.current = []
    }

    const playBeep = (freq = 880, durationMs = 250) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            oscillator.type = 'sine'
            oscillator.frequency.value = freq
            gain.gain.value = 0.1
            oscillator.connect(gain)
            gain.connect(ctx.destination)
            oscillator.start()
            setTimeout(() => {
                oscillator.stop()
                ctx.close()
            }, durationMs)
        } catch {}
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    return {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        resetRecording,
        playBeep,
    }
}

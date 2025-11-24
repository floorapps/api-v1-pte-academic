'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, RotateCcw, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { submitAttempt } from '@/lib/actions/pte'
import { useToast } from '@/hooks/use-toast'
import { LiveWaveform } from '@/components/ui/live-waveform'
import { MicSelector } from '@/components/ui/mic-selector'
import {
    AudioPlayerProvider,
    AudioPlayerButton,
    AudioPlayerProgress,
    AudioPlayerTime,
    AudioPlayerDuration,
    AudioPlayerSpeed,
} from '@/components/ui/audio-player'

interface ReadAloudPracticeProps {
    question: any
}

type Phase = 'idle' | 'preparing' | 'beep' | 'recording' | 'finished'

export function ReadAloudPractice({ question }: ReadAloudPracticeProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [timeLeft, setTimeLeft] = useState(30) // Preparation time
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const beepAudioRef = useRef<HTMLAudioElement | null>(null)
    const { toast } = useToast()

    // Preparation timer (30 seconds)
    const PREP_TIME = 30
    const RECORDING_TIME = 40

    useEffect(() => {
        // Create beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

        beepAudioRef.current = {
            play: () => {
                const osc = audioContext.createOscillator()
                const gain = audioContext.createGain()
                osc.connect(gain)
                gain.connect(audioContext.destination)
                osc.frequency.value = 800
                osc.type = 'sine'
                gain.gain.value = 0.1
                osc.start()
                osc.stop(audioContext.currentTime + 0.2)
            }
        } as any

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    const startPractice = () => {
        setPhase('preparing')
        setTimeLeft(PREP_TIME)

        // Start preparation countdown
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current)
                    playBeepAndStartRecording()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const playBeepAndStartRecording = () => {
        setPhase('beep')

        // Play beep sound
        if (beepAudioRef.current) {
            beepAudioRef.current.play()
        }

        // Wait for beep to finish, then start recording
        setTimeout(() => {
            startRecording()
        }, 500)
    }

    const startRecording = async () => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                setPhase('finished')
            }

            mediaRecorder.start()
            setPhase('recording')
            setRecordingTime(0)

            // Auto-stop after 40 seconds
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= RECORDING_TIME - 1) {
                        stopRecording()
                        return RECORDING_TIME
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast({
                title: 'Microphone Error',
                description: 'Could not access microphone. Please check permissions.',
                variant: 'destructive',
            })
            setPhase('idle')
        }
    }

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current)

        if (mediaRecorderRef.current && phase === 'recording') {
            // Play ending beep
            if (beepAudioRef.current) {
                beepAudioRef.current.play()
            }

            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const handleSubmit = async () => {
        if (!audioBlob) return

        setIsSubmitting(true)
        try {
            // Upload to Vercel Blob storage
            const formData = new FormData()
            formData.append('file', audioBlob, `recording-${Date.now()}.webm`)

            const uploadRes = await fetch('/api/uploads/audio', {
                method: 'POST',
                body: formData,
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const { url } = await uploadRes.json()

            // Submit attempt
            const res = await submitAttempt({
                questionId: question.id,
                questionType: 'read_aloud',
                audioUrl: url,
                transcript: question.promptText, // Mock transcript for now
                durationMs: recordingTime * 1000,
            })

            setResult(res)
            toast({
                title: 'Success',
                description: 'Your response has been submitted and scored!',
            })
        } catch (error: any) {
            console.error('Submit error:', error)
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }

        setPhase('idle')
        setTimeLeft(PREP_TIME)
        setRecordingTime(0)
        setAudioBlob(null)
        setAudioUrl(null)
        setResult(null)
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Read Aloud</h1>
                        <p className="text-muted-foreground mt-1">
                            Read the text below as naturally and clearly as possible.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm py-1 px-3">
                            Question {question.id.slice(0, 4)}
                        </Badge>
                        {question.difficulty && (
                            <Badge className="capitalize bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                {question.difficulty}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Question Card */}
                    <Card className="h-full border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">1</span>
                                Read the text
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border bg-muted/30 p-6 leading-relaxed text-lg font-medium text-foreground/90">
                                {question.promptText || question.title}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                <span>You have <strong>{PREP_TIME}s</strong> to prepare and <strong>{RECORDING_TIME}s</strong> to record.</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recording Card */}
                    <Card className="h-full border-border/50 shadow-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">2</span>
                                Record Answer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center items-center space-y-8 py-8">
                            {!result ? (
                                <>
                                    {/* Status Display */}
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            {phase === 'idle' && "Ready to Start?"}
                                            {phase === 'preparing' && `Get Ready: ${timeLeft}s`}
                                            {phase === 'beep' && "Begin Speaking!"}
                                            {phase === 'recording' && "Recording..."}
                                            {phase === 'finished' && "Processing..."}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {phase === 'idle' && "Click the microphone to begin preparation"}
                                            {phase === 'preparing' && "Read the text silently to yourself"}
                                            {phase === 'recording' && "Speak clearly into your microphone"}
                                            {phase === 'finished' && "Analyzing your speech..."}
                                        </p>
                                    </div>

                                    {/* Visualizer / Timer */}
                                    <div className="w-full h-32 flex items-center justify-center">
                                        {phase === 'recording' ? (
                                            <div className="w-full max-w-xs">
                                                <LiveWaveform
                                                    isActive={true}
                                                    audioLevel={0.5 + Math.random() * 0.5} // Simulated level
                                                    className="text-primary"
                                                />
                                                <div className="mt-4 text-center font-mono text-sm text-muted-foreground">
                                                    {recordingTime}s / {RECORDING_TIME}s
                                                </div>
                                            </div>
                                        ) : phase === 'preparing' ? (
                                            <div className="relative h-32 w-32 flex items-center justify-center">
                                                <svg className="h-full w-full -rotate-90 transform">
                                                    <circle
                                                        className="text-muted"
                                                        strokeWidth="8"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="58"
                                                        cx="64"
                                                        cy="64"
                                                    />
                                                    <circle
                                                        className="text-primary transition-all duration-1000 ease-linear"
                                                        strokeWidth="8"
                                                        strokeDasharray={365}
                                                        strokeDashoffset={365 - (365 * timeLeft) / PREP_TIME}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="58"
                                                        cx="64"
                                                        cy="64"
                                                    />
                                                </svg>
                                                <span className="absolute text-3xl font-bold">{timeLeft}</span>
                                            </div>
                                        ) : (
                                            <div className={`h-32 w-32 rounded-full bg-muted/30 flex items-center justify-center ${phase === 'finished' ? 'animate-pulse' : ''}`}>
                                                {phase === 'finished' ? (
                                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                                ) : (
                                                    <Mic className="h-12 w-12 text-muted-foreground/50" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
                                        {phase === 'idle' && (
                                            <div className="space-y-4 w-full">
                                                <div className="flex justify-center">
                                                    <MicSelector
                                                        value={selectedDeviceId}
                                                        onValueChange={setSelectedDeviceId}
                                                    />
                                                </div>
                                                <Button
                                                    size="lg"
                                                    onClick={startPractice}
                                                    className="w-full h-14 rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    <Mic className="mr-2 h-5 w-5" />
                                                    Start Recording
                                                </Button>
                                            </div>
                                        )}

                                        {phase === 'recording' && (
                                            <Button
                                                size="lg"
                                                variant="destructive"
                                                onClick={stopRecording}
                                                className="w-full h-14 rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                            >
                                                <Square className="mr-2 h-5 w-5 fill-current" />
                                                Stop
                                            </Button>
                                        )}

                                        {phase === 'finished' && audioUrl && (
                                            <div className="flex flex-col items-center gap-6 w-full">
                                                <Card className="w-full border-border/50 bg-muted/30">
                                                    <CardContent className="p-4">
                                                        <AudioPlayerProvider>
                                                            <div className="flex items-center gap-4">
                                                                <AudioPlayerButton item={{ id: 'recording', src: audioUrl }} />
                                                                <AudioPlayerTime />
                                                                <AudioPlayerProgress className="flex-1" />
                                                                <AudioPlayerDuration />
                                                                <AudioPlayerSpeed />
                                                            </div>
                                                        </AudioPlayerProvider>
                                                    </CardContent>
                                                </Card>

                                                <div className="flex gap-3 w-full">
                                                    <Button variant="outline" onClick={handleReset} className="flex-1 rounded-full h-12">
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        Retry
                                                    </Button>
                                                    <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-full h-12">
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Submit Answer
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping duration-1000" />
                                        <div className="relative h-full w-full rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center border-4 border-green-500/20">
                                            <div className="text-center">
                                                <span className="block text-5xl font-bold text-green-600 dark:text-green-400">
                                                    {result.score?.overall_score || 0}
                                                </span>
                                                <span className="text-xs uppercase tracking-wider font-semibold text-green-600/70 dark:text-green-400/70">Overall</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold">Excellent Job!</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            Your pronunciation and fluency have been analyzed by our AI.
                                        </p>
                                    </div>

                                    <Button className="w-full max-w-xs rounded-full h-12" variant="outline" onClick={handleReset}>
                                        Practice Another Question
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

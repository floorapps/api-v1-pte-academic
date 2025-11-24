'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Play, AlertCircle, ArrowLeft, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { submitAttempt } from '@/lib/actions/pte'
import { ScoreDetailsModal } from './score-details-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'

interface DescribeImageProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function DescribeImage({ question }: DescribeImageProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [stage, setStage] = useState<'idle' | 'preparing' | 'recording' | 'processing' | 'complete'>('idle')
    const [prepTime, setPrepTime] = useState(25)
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        isRecording,
        recordingTime,
        audioBlob,
        error: recorderError,
        startRecording,
        stopRecording,
        resetRecording,
        playBeep,
    } = useAudioRecorder({
        maxDuration: 40000,
        onRecordingComplete: handleRecordingComplete,
    })

    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording(selectedDeviceId)
    }, [startRecording, playBeep, selectedDeviceId])

    // Prep timer
    useEffect(() => {
        if (stage === 'preparing' && prepTime > 0) {
            const timer = setTimeout(() => setPrepTime((t) => t - 1), 1000)
            return () => clearTimeout(timer)
        } else if (stage === 'preparing' && prepTime === 0) {
            handleStartRecording()
        }
    }, [stage, prepTime, handleStartRecording])

    const handleBegin = () => {
        setStage('preparing')
        setPrepTime(25)
        setError(null)
        resetRecording()
    }

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    async function handleRecordingComplete(blob: Blob, duration: number) {
        setStage('processing')

        try {
            const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' })
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

            // Transcribe audio
            const transcribedText = await transcribeAudio(blob)
            setTranscript(transcribedText)

            setStage('complete')
        } catch (err: any) {
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }

    const handleSubmit = async () => {
        if (!audioUrl || !transcript) return

        setIsSubmitting(true)
        try {
            // Submit to server for AI scoring
            const result = await submitAttempt({
                questionId: question.id,
                questionType: 'describe_image',
                audioUrl: audioUrl,
                transcript: transcript,
                durationMs: recordingTime,
            })

            setScore(result.score)
            setIsScoreModalOpen(true)

            toast({
                title: 'Success',
                description: 'Your response has been submitted and scored!',
            })

            // Redirect after a delay or user action? 
            // For now, we keep the modal open, but we could redirect to an attempts page
            // router.push(`/pte/academic/practice/speaking/describe-image/attempts/${result.id}`)
        } catch (err: any) {
            setError(err.message || 'Failed to submit attempt')
            toast({
                title: 'Error',
                description: 'Failed to submit attempt. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Mock transcription
    async function transcribeAudio(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('This is a sample description of the image showing key trends and data points.')
            }, 1000)
        })
    }

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        return `${seconds}s`
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-border/40" />
                            <div>
                                <h1 className="text-lg font-semibold">{question.title}</h1>
                                <p className="text-xs text-muted-foreground">Describe Image</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {question.difficulty}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Image Display */}
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-muted/20 rounded-xl border border-border/40 overflow-hidden">
                            {question.promptMediaUrl ? (
                                <Image
                                    src={question.promptMediaUrl}
                                    alt={question.title}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No image available
                                </div>
                            )}
                        </div>
                        {question.promptText && (
                            <Alert className="border-border/40 bg-muted/20">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    {question.promptText}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Right: Practice Interface */}
                    <div className="space-y-6">
                        {/* Instructions */}
                        <Card className="border-border/40 bg-card/50">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-primary">1</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Study the image</p>
                                            <p className="text-xs text-muted-foreground">You have 25 seconds to prepare</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-primary">2</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Describe in detail</p>
                                            <p className="text-xs text-muted-foreground">Record your response (max 40 seconds)</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Practice Area */}
                        <Card className="border-border/40 bg-card/50">
                            <CardContent className="pt-6">

                                {stage === 'idle' && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-8 space-y-4"
                                    >
                                        <div className="w-full max-w-xs mx-auto mb-6">
                                            <MicSelector
                                                value={selectedDeviceId}
                                                onValueChange={setSelectedDeviceId}
                                            />
                                        </div>

                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <Mic className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Ready to practice?</h3>
                                            <p className="text-sm text-muted-foreground">Click begin when you&apos;re ready to start</p>
                                        </div>
                                        <Button
                                            onClick={handleBegin}
                                            size="lg"
                                            className="mt-4 rounded-full px-8 h-12"
                                        >
                                            <Play className="mr-2 h-5 w-5" />
                                            Begin Practice
                                        </Button>
                                    </motion.div>
                                )}

                                {stage === 'preparing' && (
                                    <motion.div
                                        key="preparing"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}

                                        className="text-center py-8 space-y-6"
                                    >
                                        <div className="relative w-32 h-32 mx-auto">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    className="text-muted/20"
                                                />
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="56"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - prepTime / 25)}`}
                                                    className="text-primary transition-all duration-1000"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-4xl font-bold">{prepTime}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Preparation Time</h3>
                                            <p className="text-sm text-muted-foreground">Study the image carefully</p>
                                        </div>
                                    </motion.div>
                                )}

                                {stage === 'recording' && (
                                    <motion.div
                                        key="recording"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 space-y-6"
                                    >
                                        <div className="w-full max-w-xs mx-auto h-32 flex items-center justify-center">
                                            <LiveWaveform
                                                isActive={true}
                                                deviceId={selectedDeviceId}
                                                className="text-primary w-full h-full"
                                            />
                                        </div>

                                        <div className="text-center">
                                            <div className="text-4xl font-mono font-bold mb-2">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                / 40s
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={handleStopRecording}
                                                variant="destructive"
                                                size="lg"
                                                className="rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                            >
                                                <Square className="mr-2 h-5 w-5 fill-current" />
                                                Stop Recording
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {stage === 'processing' && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}

                                        className="text-center py-12 space-y-4"
                                    >
                                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                        <div>
                                            <h3 className="font-semibold mb-1">Analyzing your response</h3>
                                            <p className="text-sm text-muted-foreground">This will take a few seconds...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {stage === 'complete' && (
                                    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Card className="w-full border-border/50 bg-muted/30">
                                            <CardContent className="p-4">
                                                <AudioPlayerProvider>
                                                    <div className="flex items-center gap-4">
                                                        <AudioPlayerButton item={{ id: 'recording', src: audioUrl || '' }} />
                                                        <AudioPlayerTime />
                                                        <AudioPlayerProgress className="flex-1" />
                                                        <AudioPlayerDuration />
                                                        <AudioPlayerSpeed />
                                                    </div>
                                                </AudioPlayerProvider>
                                            </CardContent>
                                        </Card>

                                        <div className="flex gap-3 w-full">
                                            <Button variant="outline" onClick={() => {
                                                setStage('idle')
                                                resetRecording()
                                                setScore(null)
                                                setTranscript('')
                                                setAudioUrl(null)
                                            }} className="flex-1 rounded-full h-12">
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


                                {/* Error display */}
                                {(error || recorderError) && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error || recorderError}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Score Details Modal */}
            {score && (
                <ScoreDetailsModal
                    open={isScoreModalOpen}
                    onOpenChange={setIsScoreModalOpen}
                    score={score}
                    transcript={transcript}
                    originalText={question.promptText || 'Describe the image'}
                />
            )}
        </div>
    )
}

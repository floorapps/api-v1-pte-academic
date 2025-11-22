'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Volume2, AlertCircle, ArrowLeft, Play } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { submitAttempt } from '@/lib/actions/pte'
import { ScoreDetailsModal } from './score-details-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface RetellLectureProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function RetellLecture({ question }: RetellLectureProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'playing' | 'preparing' | 'recording' | 'processing' | 'complete'>('idle')
    const [prepTime, setPrepTime] = useState(10)
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

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
        await startRecording()
    }, [startRecording, playBeep])

    useEffect(() => {
        if (stage === 'preparing' && prepTime > 0) {
            const timer = setTimeout(() => setPrepTime((t) => t - 1), 1000)
            return () => clearTimeout(timer)
        } else if (stage === 'preparing' && prepTime === 0) {
            handleStartRecording()
        }
    }, [stage, prepTime, handleStartRecording])

    const handleBegin = () => {
        setStage('idle')
        setError(null)
        resetRecording()
    }

    const handlePlayLecture = () => {
        if (!question.promptMediaUrl) return

        setStage('playing')

        if (audioRef.current) {
            audioRef.current.play()
        }
    }

    const handleAudioEnded = () => {
        setStage('preparing')
        setPrepTime(10)
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

            const transcribedText = await transcribeAudio(blob)
            setTranscript(transcribedText)

            const result = await submitAttempt({
                questionId: question.id,
                questionType: 'retell_lecture',
                audioUrl: url,
                transcript: transcribedText,
                durationMs: duration,
            })

            setScore(result.score)
            setStage('complete')
            setIsScoreModalOpen(true)
        } catch (err: any) {
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }

    async function transcribeAudio(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('This is a sample retelling of the lecture covering the main points discussed.')
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
                                <p className="text-xs text-muted-foreground">Retell Lecture</p>
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

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Hidden audio element */}
                {question.promptMediaUrl && (
                    <audio
                        ref={audioRef}
                        src={question.promptMediaUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                    />
                )}

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
                                        <p className="text-sm font-medium">Listen to the lecture</p>
                                        <p className="text-xs text-muted-foreground">Pay attention to key points</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-primary">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Prepare your response</p>
                                        <p className="text-xs text-muted-foreground">10 seconds to organize your thoughts</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-primary">3</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Retell the lecture</p>
                                        <p className="text-xs text-muted-foreground">Record your response (max 40 seconds)</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lecture Player */}
                    {question.promptMediaUrl && (
                        <Card className="border-border/40 bg-card/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Volume2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Lecture Audio</p>
                                            <p className="text-xs text-muted-foreground">
                                                {stage === 'idle' ? 'Ready to play' : stage === 'playing' ? 'Playing...' : 'Completed'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handlePlayLecture}
                                        disabled={stage !== 'idle'}
                                        size="lg"
                                    >
                                        <Play className="mr-2 h-5 w-5" />
                                        Play Lecture
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lecture text reference */}
                    {question.promptText && (
                        <Alert className="border-border/40 bg-muted/20">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                <span className="font-medium">Practice reference:</span> {question.promptText}
                                <p className="text-xs text-muted-foreground mt-1">(Not shown in actual test)</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Practice Area */}
                    <Card className="border-border/40 bg-card/50">
                        <CardContent className="pt-6">
                            
                                {stage === 'idle' && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        
                                        className="text-center py-8"
                                    >
                                        <p className="text-sm text-muted-foreground">Click &quot;Play Lecture&quot; to begin</p>
                                    </motion.div>
                                )}

                                {stage === 'playing' && (
                                    <motion.div
                                        key="playing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        
                                        className="text-center py-12 space-y-4"
                                    >
                                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                        <div>
                                            <h3 className="font-semibold mb-1">Listen carefully</h3>
                                            <p className="text-sm text-muted-foreground">Take mental notes of key points</p>
                                        </div>
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
                                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - prepTime / 10)}`}
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
                                            <p className="text-sm text-muted-foreground">Organize your thoughts</p>
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
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-medium">Recording</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl font-mono font-bold mb-2">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <Progress value={(recordingTime / 40000) * 100} className="h-2 max-w-xs mx-auto" />
                                        </div>
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={handleStopRecording}
                                                variant="outline"
                                                size="lg"
                                                className="border-rose-500/20 hover:bg-rose-500/10"
                                            >
                                                <Square className="mr-2 h-5 w-5" />
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

                                {stage === 'complete' && score && (
                                    <motion.div
                                        key="complete"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-8 space-y-6"
                                    >
                                        <div>
                                            <div className="text-6xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                                                {score.overall_score}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Overall Score</p>
                                        </div>
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            <Button
                                                onClick={() => setIsScoreModalOpen(true)}
                                                variant="outline"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleBegin()
                                                    setScore(null)
                                                    setTranscript('')
                                                }}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                        {audioUrl && (
                                            <div className="pt-4">
                                                <audio src={audioUrl} controls className="w-full max-w-md mx-auto" />
                                            </div>
                                        )}
                                    </motion.div>
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

            {/* Score Details Modal */}
            {score && (
                <ScoreDetailsModal
                    open={isScoreModalOpen}
                    onOpenChange={setIsScoreModalOpen}
                    score={score}
                    transcript={transcript}
                    originalText={question.promptText || 'Lecture content'}
                />
            )}
        </div>
    )
}

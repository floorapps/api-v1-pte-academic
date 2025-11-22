'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { submitAttempt } from '@/lib/actions/pte'
import { ScoreDetailsModal } from './score-details-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface RespondToSituationProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function RespondToSituation({ question }: RespondToSituationProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'reading' | 'recording' | 'processing' | 'complete'>('idle')
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [readingTime, setReadingTime] = useState(0)
    const readingTimerRef = useRef<NodeJS.Timeout | null>(null)

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
        maxDuration: 40000, // 40 seconds max
        onRecordingComplete: handleRecordingComplete,
    })

    const handleBegin = () => {
        setStage('reading')
        setReadingTime(0)

        // Start 40-second reading timer
        readingTimerRef.current = setInterval(() => {
            setReadingTime((prev) => {
                if (prev >= 40000) {
                    if (readingTimerRef.current) {
                        clearInterval(readingTimerRef.current)
                    }
                    return 40000
                }
                return prev + 100
            })
        }, 100)
    }

    const handleStartRecording = async () => {
        if (readingTimerRef.current) {
            clearInterval(readingTimerRef.current)
        }
        playBeep()
        setStage('recording')
        await startRecording()
    }

    const handleStopRecording = () => {
        playBeep(660, 200)
        stopRecording()
    }

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
                questionType: 'respond_to_a_situation',
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
                resolve('Sample response to the situation')
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
                                <p className="text-xs text-muted-foreground">Respond to a Situation</p>
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
                                        <p className="text-sm font-medium">Read the situation carefully</p>
                                        <p className="text-xs text-muted-foreground">You have up to 40 seconds to read</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-primary">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Respond appropriately</p>
                                        <p className="text-xs text-muted-foreground">Record your response (max 40 seconds)</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Situation Card */}
                    <Card className="border-border/40 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Situation</h3>
                                    {stage === 'reading' && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatTime(40000 - readingTime)} remaining</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                                    <p className="text-sm leading-relaxed">{question.promptText}</p>
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
                                        
                                        className="text-center py-8"
                                    >
                                        <Button onClick={handleBegin} size="lg">
                                            <Mic className="mr-2 h-5 w-5" />
                                            Begin
                                        </Button>
                                    </motion.div>
                                )}

                                {stage === 'reading' && (
                                    <motion.div
                                        key="reading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        
                                        className="py-8 space-y-6"
                                    >
                                        <div className="text-center space-y-4">
                                            <p className="text-sm text-muted-foreground">Read the situation and prepare your response</p>
                                            <Progress value={(readingTime / 40000) * 100} className="h-2 max-w-xs mx-auto" />
                                        </div>
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={handleStartRecording}
                                                size="lg"
                                            >
                                                <Mic className="mr-2 h-5 w-5" />
                                                Start Recording
                                            </Button>
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
                                                    setStage('idle')
                                                    setScore(null)
                                                    setTranscript('')
                                                    resetRecording()
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
                    originalText={question.promptText || 'Situation prompt'}
                />
            )}
        </div>
    )
}

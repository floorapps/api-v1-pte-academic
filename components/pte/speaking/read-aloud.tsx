'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Volume2, AlertCircle } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { submitAttempt } from '@/lib/actions/pte'
import { ScoreDetailsModal } from './score-details-modal'
import { ScoringProgressModal } from './scoring-progress-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { useServerAction } from '@/hooks/use-server-action'

interface ReadAloudProps {
    question: {
        id: string
        title: string
        promptText: string
        difficulty: string
    }
}

export function ReadAloud({ question }: ReadAloudProps) {
    const [stage, setStage] = useState<'idle' | 'preparing' | 'recording' | 'processing' | 'complete'>('idle')
    const [prepTime, setPrepTime] = useState(30)
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [totalTime, setTotalTime] = useState(0) // For display timer

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

    const { execute: submit, isPending: isSubmitting, error: submitError, data: scoreData } = useServerAction(submitAttempt)

    useEffect(() => {
        if (scoreData) {
            setIsScoringModalOpen(false)
            setScore(scoreData.score)
            setStage('complete')
            setIsScoreModalOpen(true)
        }
    }, [scoreData])

    useEffect(() => {
        if (submitError) {
            setIsScoringModalOpen(false)
            setError(submitError)
            setStage('idle')
        }
    }, [submitError])

    // Show scoring modal when processing
    useEffect(() => {
        if (stage === 'processing') {
            setIsScoringModalOpen(true)
        }
    }, [stage])

    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording()
    }, [startRecording, playBeep])

    // Prep timer
    useEffect(() => {
        if (stage === 'preparing' && prepTime > 0) {
            const timer = setTimeout(() => setPrepTime((t) => t - 1), 1000)
            return () => clearTimeout(timer)
        } else if (stage === 'preparing' && prepTime === 0) {
            handleStartRecording()
        }
    }, [stage, prepTime, handleStartRecording])

    // Total timer effect
    useEffect(() => {
        if (stage === 'preparing' || stage === 'recording') {
            const timer = setInterval(() => setTotalTime((t) => t + 1), 1000)
            return () => clearInterval(timer)
        }
    }, [stage])

    const handleBegin = () => {
        setStage('preparing')
        setPrepTime(30)
        setTotalTime(0)
        setError(null)
        resetRecording()
    }

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    async function handleRecordingComplete(blob: Blob, duration: number) {
        setStage('processing')
        console.log('[ReadAloud] Recording complete. Duration:', duration)

        try {
            // Create FormData for upload
            const formData = new FormData()
            const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' })
            formData.append('file', audioFile)
            formData.append('type', 'read_aloud')
            formData.append('questionId', question.id)
            formData.append('ext', 'webm')

            console.log('[ReadAloud] Uploading audio to Vercel Blob...')

            // Upload to Vercel Blob using the upload action
            const uploadResponse = await fetch('/api/uploads/audio', {
                method: 'POST',
                body: formData,
            })

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload audio')
            }

            const uploadData = await uploadResponse.json()
            const audioUrl = uploadData.url

            console.log('[ReadAloud] Audio uploaded successfully:', audioUrl)

            // Create local URL for playback
            const localUrl = URL.createObjectURL(blob)
            setAudioUrl(localUrl)

            // Transcribe audio (using browser's SpeechRecognition or external API)
            console.log('[ReadAloud] Starting transcription...')
            const transcribedText = await transcribeAudio(blob)
            setTranscript(transcribedText)
            console.log('[ReadAloud] Transcription complete:', transcribedText)

            // Submit to server for AI scoring with the uploaded URL
            console.log('[ReadAloud] Submitting attempt...')
            await submit({
                questionId: question.id,
                questionType: 'read_aloud',
                audioUrl: audioUrl, // Use the Vercel Blob URL
                transcript: transcribedText,
                durationMs: duration,
            })
        } catch (err: any) {
            console.error('[ReadAloud] Error processing recording:', err)
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }

    // Mock transcription - replace with actual API call
    async function transcribeAudio(blob: Blob): Promise<string> {
        // TODO: Implement actual transcription using Web Speech API or external service
        // For now, return a mock transcript for testing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(question.promptText) // Mock: return the original text
            }, 1000)
        })
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-red-500">
                    Time: {formatTime(totalTime)}
                </div>
            </div>

            {/* Question ID Badge */}
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                #{question.id.slice(0, 8)} {question.difficulty}
            </div>

            {/* Instructions */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please examine the text provided below. You are required to read it out loud as naturally as you can. Remember, you only have 40 seconds to complete this task.
                </AlertDescription>
            </Alert>

            {/* Text to read */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg">
                <p className="text-base leading-relaxed text-gray-900">
                    {question.promptText}
                </p>
            </div>

            {/* Microphone Area */}
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                {stage === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <button
                            onClick={handleBegin}
                            className="flex items-center justify-center w-16 h-16 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                        >
                            <Mic className="h-8 w-8 text-gray-600" />
                        </button>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                            💡 Use a headset with inline microphone to get accurate AI scores
                        </p>
                    </motion.div>
                )}

                {stage === 'preparing' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <div className="text-6xl font-bold text-primary">
                            {prepTime}
                        </div>
                        <p className="text-muted-foreground">Prepare to read aloud...</p>
                    </motion.div>
                )}

                {stage === 'recording' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Recording... {Math.floor(recordingTime / 1000)}s</span>
                        </div>
                        <Button
                            onClick={handleStopRecording}
                            variant="destructive"
                            size="lg"
                        >
                            <Square className="mr-2 h-5 w-5" />
                            Stop Recording
                        </Button>
                    </motion.div>
                )}

                {stage === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Processing your response...</p>
                    </motion.div>
                )}

                {stage === 'complete' && audioUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                            <Volume2 className="h-5 w-5 text-muted-foreground" />
                            <audio src={audioUrl} controls className="flex-1" />
                        </div>
                        {score && (
                            <div className="mt-4 text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    {score.overall_score}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Error display */}
            {(error || recorderError) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || recorderError}</AlertDescription>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <Button
                    onClick={() => {
                        if (stage === 'complete' || stage === 'idle') {
                            window.location.reload()
                        }
                    }}
                    variant="outline"
                    size="lg"
                    className="min-w-[120px]"
                >
                    Redo
                </Button>
                <Button
                    onClick={() => setIsScoreModalOpen(true)}
                    disabled={!score || stage !== 'complete'}
                    size="lg"
                    className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Submit
                </Button>
                <Button
                    onClick={() => {
                        // Demo functionality
                        alert('Demo mode: This would play a sample recording')
                    }}
                    variant="outline"
                    size="lg"
                    className="min-w-[120px]"
                >
                    Demo
                </Button>
            </div>

            {/* Scoring Progress Modal */}
            <ScoringProgressModal
                open={isScoringModalOpen}
                onOpenChange={setIsScoringModalOpen}
            />

            {/* Score Details Modal */}
            {score && (
                <ScoreDetailsModal
                    open={isScoreModalOpen}
                    onOpenChange={setIsScoreModalOpen}
                    score={score}
                    transcript={transcript}
                    originalText={question.promptText}
                />
            )}
        </div>
    )
}

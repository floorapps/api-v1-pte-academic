'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Mic, Square, Play, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'
import { submitAttempt } from '@/lib/actions/pte'
import { useToast } from '@/hooks/use-toast' // Assuming this hook exists or I need to use standard toast

interface SpeakingPracticeProps {
    question: any
    category: 'speaking'
}

export function SpeakingPractice({ question, category }: SpeakingPracticeProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [timeLeft, setTimeLeft] = useState(40) // Default prep time? Or answer time?
    // Real PTE has prep time then record time. Simplified for now.

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    // const { toast } = useToast()

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            alert('Could not access microphone')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const handleSubmit = async () => {
        if (!audioBlob) return

        setIsSubmitting(true)
        try {
            // In a real app, upload blob to storage (S3/R2) and get URL
            // Here we just pass a fake URL
            const fakeAudioUrl = `blob:${Date.now()}`

            const res = await submitAttempt({
                questionId: question.id,
                questionType: question.type,
                audioUrl: fakeAudioUrl,
                transcript: 'Mock transcript for testing',
                durationMs: 10000, // Mock duration
            })

            setResult(res)
        } catch (error) {
            console.error('Submit error:', error)
            alert('Failed to submit')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setAudioBlob(null)
        setAudioUrl(null)
        setResult(null)
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Question Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-lg font-medium leading-relaxed">
                        {question.promptText || "Read the text below aloud as naturally and clearly as possible."}
                    </div>

                    {question.title && (
                        <div className="p-4 bg-muted rounded-lg border">
                            <p className="text-lg">{question.title}</p>
                        </div>
                    )}

                    {question.promptMediaUrl && (
                        <div className="mt-4">
                            {/* Handle image or audio prompt */}
                            {question.promptMediaUrl.endsWith('.mp3') ? (
                                <audio controls src={question.promptMediaUrl} className="w-full" />
                            ) : (
                                <img src={question.promptMediaUrl} alt="Prompt" className="rounded-lg max-h-64 object-contain" />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Your Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!result ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-8">
                            {/* Recording Controls */}
                            {!audioBlob ? (
                                <Button
                                    size="lg"
                                    variant={isRecording ? "destructive" : "default"}
                                    className="h-24 w-24 rounded-full"
                                    onClick={isRecording ? stopRecording : startRecording}
                                >
                                    {isRecording ? (
                                        <Square className="h-10 w-10" />
                                    ) : (
                                        <Mic className="h-10 w-10" />
                                    )}
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <audio controls src={audioUrl!} className="w-full" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleReset}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Retry
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {isRecording ? "Recording..." : audioBlob ? "Recorded" : "Click mic to start"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-green-600">{result.score}</span>
                                </div>
                                <h3 className="text-xl font-bold">Overall Score</h3>
                                <p className="text-muted-foreground">AI Assessment</p>
                            </div>

                            <Button className="w-full" variant="outline" onClick={handleReset}>
                                Practice Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

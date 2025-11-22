'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Share2, Smartphone, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

interface ScoreDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    score: {
        content: number // 0-5
        pronunciation: number // 0-5
        fluency: number // 0-5
        total: number // 0-90
    }
    feedback?: {
        transcript?: string
        suggestion?: string
    }
    audioUrl?: string
}

export function ScoreDetailsModal({
    isOpen,
    onClose,
    score,
    feedback,
    audioUrl,
}: ScoreDetailsModalProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Convert 0-5 scale to 0-90 for display to match OnePTE
    const contentScore = Math.round((score.content / 5) * 90)
    const pronunciationScore = Math.round((score.pronunciation / 5) * 90)
    const fluencyScore = Math.round((score.fluency / 5) * 90)

    useEffect(() => {
        if (isOpen && audioUrl) {
            // Reset audio state when modal opens
            setIsPlaying(false)
            setCurrentTime(0)
        }
    }, [isOpen, audioUrl])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const getScoreColor = (score: number, max: number = 90) => {
        const percentage = (score / max) * 100
        if (percentage >= 80) return 'text-green-600 dark:text-green-400'
        if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open: any) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-semibold">Score Details</DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-2 space-y-6">
                    {/* Score Table */}
                    <div className="rounded-lg border">
                        <div className="grid grid-cols-3 border-b bg-muted/50 p-3 text-sm font-medium">
                            <div>Component</div>
                            <div>Score</div>
                            <div>Suggestion</div>
                        </div>

                        <div className="divide-y">
                            {/* Content */}
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">Content</div>
                                <div className={getScoreColor(contentScore)}>{contentScore}/90</div>
                                <div className="text-muted-foreground text-xs">
                                    {score.content < 3 ? 'Topic relevance needs improvement.' : 'Good coverage of key points.'}
                                </div>
                            </div>

                            {/* Pronunciation */}
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">Pronun</div>
                                <div className={getScoreColor(pronunciationScore)}>{pronunciationScore}/90</div>
                                <div className="text-muted-foreground text-xs">
                                    {score.pronunciation < 3 ? 'Clarity and stress need work.' : 'Clear pronunciation.'}
                                </div>
                            </div>

                            {/* Fluency */}
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">Fluency</div>
                                <div className={getScoreColor(fluencyScore)}>{fluencyScore}/90</div>
                                <div className="text-muted-foreground text-xs">
                                    {score.fluency < 3 ? 'Avoid hesitations and pauses.' : 'Smooth flow of speech.'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/20 p-3 flex items-center gap-4 text-sm border-t">
                            <span className="text-muted-foreground">Max Score: 90</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-semibold">Your Score: <span className={getScoreColor(score.total)}>{score.total}</span></span>
                            <Button variant="link" className="text-blue-500 h-auto p-0 text-xs ml-2">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Score accurate?
                            </Button>
                        </div>
                    </div>

                    {/* Audio Player */}
                    {audioUrl && (
                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={togglePlay}
                            >
                                {isPlaying ? (
                                    <span className="font-bold text-xs">||</span>
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </Button>

                            <div className="flex-1 space-y-1">
                                <Progress value={(currentTime / (duration || 1)) * 100} className="h-1" />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={handleEnded}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* AI Speech Recognition Feedback */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">AI Speech Recognition:</h4>
                            <div className="flex gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Good</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>Average</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span>Poor</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-muted/10 text-sm leading-relaxed">
                            {feedback?.transcript ? (
                                <p>
                                    {feedback.transcript.split(' ').map((word, i) => (
                                        <span key={i} className="text-green-600 dark:text-green-400 mr-1">
                                            {word}
                                        </span>
                                    ))}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">No speech detected.</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-2 rounded">
                            <span className="font-bold">💡</span>
                            Click on the colored text to view detailed score analysis
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => {
                            // Share logic placeholder
                        }}>
                            Share
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

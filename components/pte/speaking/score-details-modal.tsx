'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScoreDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    score: {
        overall_score: number
        breakdown: {
            content?: number
            pronunciation?: number
            fluency?: number
            grammar?: number
            vocabulary?: number
            spelling?: number
            coherence?: number
        }
        feedback: string
        suggestions: string[]
        transcript_analysis?: Array<{
            word: string
            status: 'correct' | 'mispronounced' | 'omitted' | 'inserted'
            confidence?: number
        }>
    }
    transcript: string
    originalText: string
}

export function ScoreDetailsModal({
    open,
    onOpenChange,
    score,
    transcript,
    originalText,
}: ScoreDetailsModalProps) {
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-500'
        if (score >= 50) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getWordColor = (status: string) => {
        switch (status) {
            case 'correct':
                return 'text-green-500 bg-green-500/10'
            case 'mispronounced':
                return 'text-yellow-500 bg-yellow-500/10'
            case 'omitted':
                return 'text-red-500 bg-red-500/10 line-through'
            case 'inserted':
                return 'text-blue-500 bg-blue-500/10'
            default:
                return ''
        }
    }

    const getWordIcon = (status: string) => {
        switch (status) {
            case 'correct':
                return <CheckCircle2 className="h-3 w-3" />
            case 'mispronounced':
                return <AlertCircle className="h-3 w-3" />
            case 'omitted':
                return <XCircle className="h-3 w-3" />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Detailed Score Analysis</DialogTitle>
                    <DialogDescription>
                        AI-powered feedback on your speaking performance
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Overall Score */}
                    <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Overall Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {score.overall_score}
                                <span className="text-2xl text-muted-foreground">/90</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Score Breakdown */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Score Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(score.breakdown).map(([key, value]) => {
                                if (value === undefined) return null
                                return (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                                                {value}/90
                                            </span>
                                        </div>
                                        <Progress value={(value / 90) * 100} className="h-2" />
                                    </motion.div>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* AI Feedback */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                AI Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {score.feedback}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Suggestions */}
                    {score.suggestions && score.suggestions.length > 0 && (
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Improvement Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {score.suggestions.map((suggestion, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-2"
                                        >
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">{suggestion}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transcript Analysis */}
                    {score.transcript_analysis && score.transcript_analysis.length > 0 && (
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Word-by-Word Analysis</CardTitle>
                                <DialogDescription>
                                    Color-coded analysis of your pronunciation
                                </DialogDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Legend */}
                                <div className="flex flex-wrap gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span>Correct</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                                        <span>Mispronounced</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <XCircle className="h-3 w-3 text-red-500" />
                                        <span>Omitted</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                                        <span>Inserted</span>
                                    </div>
                                </div>

                                {/* Word analysis */}
                                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex flex-wrap gap-2">
                                        {score.transcript_analysis.map((word, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className={`${getWordColor(word.status)} flex items-center gap-1 px-2 py-1`}
                                            >
                                                {getWordIcon(word.status)}
                                                <span>{word.word}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Original vs Transcript comparison */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Original Text</h4>
                                        <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg border border-border/30">
                                            {originalText}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Your Transcript</h4>
                                        <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg border border-border/30">
                                            {transcript}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { Loader2, CheckCircle, RotateCcw } from 'lucide-react'

interface WritingPracticeProps {
    question: any
    category: 'writing'
}

export function WritingPractice({ question, category }: WritingPracticeProps) {
    const [response, setResponse] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)

    const wordCount = response.trim().split(/\s+/).filter(w => w.length > 0).length

    const handleSubmit = async () => {
        if (!response.trim()) return

        setIsSubmitting(true)
        try {
            // Mock result for writing questions (since submitAttempt is for speaking only)
            const mockResult = {
                score: {
                    overall: Math.floor(Math.random() * 30) + 70,
                    content: Math.floor(Math.random() * 30) + 70,
                    pronunciation: Math.floor(Math.random() * 30) + 70,
                    fluency: Math.floor(Math.random() * 30) + 70,
                },
                feedback: 'Good writing attempt! Keep practicing to improve your writing skills.',
                attemptId: 'mock-' + Date.now()
            }
            setResult(mockResult)
        } catch (error) {
            console.error('Submit error:', error)
            alert('Failed to submit')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setResponse('')
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
                        {question.promptText}
                    </div>
                    {question.title && (
                        <div className="p-4 bg-muted rounded-lg border">
                            <p className="text-lg">{question.title}</p>
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
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Type your response here..."
                                className="min-h-[300px] resize-none text-lg"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Word Count: {wordCount}
                                </span>
                                <Button onClick={handleSubmit} disabled={isSubmitting || !response.trim()}>
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
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-green-600">{result.score}</span>
                                </div>
                                <h3 className="text-xl font-bold">Overall Score</h3>
                                <p className="text-muted-foreground">AI Assessment</p>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">Your Response:</h4>
                                <p className="text-sm whitespace-pre-wrap">{response}</p>
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

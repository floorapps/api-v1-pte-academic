'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { Loader2, CheckCircle, RotateCcw, PlayCircle } from 'lucide-react'

interface ListeningPracticeProps {
    question: any
    category: 'listening'
}

export function ListeningPractice({ question, category }: ListeningPracticeProps) {
    const [response, setResponse] = useState('')
    const [selectedOption, setSelectedOption] = useState<string>('')
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)

    const isWriting = ['summarize_spoken_text', 'write_from_dictation', 'fill_in_blanks'].includes(question.type)
    const isMultipleChoice = question.type.includes('multiple') || question.type.includes('highlight')

    // Parse options if needed
    const options = Array.isArray(question.options)
        ? question.options
        : typeof question.options === 'string'
            ? JSON.parse(question.options)
            : []

    const handleToggleOption = (opt: string) => {
        if (selectedOptions.includes(opt)) {
            setSelectedOptions(selectedOptions.filter(o => o !== opt))
        } else {
            setSelectedOptions([...selectedOptions, opt])
        }
    }

    const handleSubmit = async () => {
        let answer: any = response
        if (isMultipleChoice) {
            answer = question.type.includes('multiple') ? selectedOptions : selectedOption
        }

        if (!answer || (Array.isArray(answer) && answer.length === 0)) return

        setIsSubmitting(true)
        try {
            // Mock result for listening questions (since submitAttempt is for speaking only)
            const mockResult = {
                score: {
                    overall: Math.floor(Math.random() * 30) + 70,
                    content: Math.floor(Math.random() * 30) + 70,
                    pronunciation: Math.floor(Math.random() * 30) + 70,
                    fluency: Math.floor(Math.random() * 30) + 70,
                },
                feedback: 'Good attempt! Keep practicing to improve your listening skills.',
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
        setSelectedOption('')
        setSelectedOptions([])
        setResult(null)
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Audio Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {question.title && (
                        <div className="p-4 bg-muted rounded-lg border mb-4">
                            <p className="text-lg font-semibold">{question.title}</p>
                        </div>
                    )}

                    {question.promptMediaUrl ? (
                        <div className="p-6 bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
                            <PlayCircle className="h-12 w-12 text-primary" />
                            <audio controls src={question.promptMediaUrl} className="w-full" />
                        </div>
                    ) : (
                        <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
                            No audio available for this question.
                        </div>
                    )}

                    {question.promptText && (
                        <div className="text-lg leading-relaxed mt-4">
                            {question.promptText}
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
                        <div className="space-y-6">
                            {isWriting ? (
                                <Textarea
                                    placeholder="Type your response here..."
                                    className="min-h-[200px] resize-none text-lg"
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                />
                            ) : isMultipleChoice ? (
                                <div className="space-y-4">
                                    {options.map((opt: any, idx: number) => (
                                        <div key={idx} className="flex items-start space-x-2">
                                            <Checkbox
                                                id={`opt-${idx}`}
                                                checked={selectedOptions.includes(opt.text || opt)}
                                                onChange={() => handleToggleOption(opt.text || opt)}
                                            />
                                            <Label htmlFor={`opt-${idx}`} className="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {opt.text || opt}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                                    {options.map((opt: any, idx: number) => (
                                        <div key={idx} className="flex items-center space-x-2 mb-2">
                                            <RadioGroupItem value={opt.text || opt} id={`opt-${idx}`} />
                                            <Label htmlFor={`opt-${idx}`} className="text-base">{opt.text || opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

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
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-green-600">{result.score}</span>
                                </div>
                                <h3 className="text-xl font-bold">Score</h3>
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

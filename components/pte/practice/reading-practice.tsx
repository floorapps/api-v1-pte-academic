'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import { Loader2, CheckCircle, RotateCcw } from 'lucide-react'

interface ReadingPracticeProps {
    question: any
    category: 'reading'
}

export function ReadingPractice({ question, category }: ReadingPracticeProps) {
    const [selectedOption, setSelectedOption] = useState<string>('')
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)

    // Parse options if string (DB might return JSON object or string)
    const options = Array.isArray(question.options)
        ? question.options
        : typeof question.options === 'string'
            ? JSON.parse(question.options)
            : []

    const isMultipleChoice = question.type.includes('multiple')

    const handleToggleOption = (opt: string) => {
        if (selectedOptions.includes(opt)) {
            setSelectedOptions(selectedOptions.filter(o => o !== opt))
        } else {
            setSelectedOptions([...selectedOptions, opt])
        }
    }

    const handleSubmit = async () => {
        const answer = isMultipleChoice ? selectedOptions : selectedOption
        if (!answer || (Array.isArray(answer) && answer.length === 0)) return

        setIsSubmitting(true)
        try {
            // Mock result for reading questions (since submitAttempt is for speaking only)
            const mockResult = {
                score: {
                    overall: Math.floor(Math.random() * 30) + 70,
                    content: Math.floor(Math.random() * 30) + 70,
                    pronunciation: Math.floor(Math.random() * 30) + 70,
                    fluency: Math.floor(Math.random() * 30) + 70,
                },
                feedback: 'Good attempt! Keep practicing to improve your reading comprehension.',
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
        setSelectedOption('')
        setSelectedOptions([])
        setResult(null)
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Question Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {question.title && (
                        <div className="p-4 bg-muted rounded-lg border mb-4">
                            <p className="text-lg font-semibold">{question.title}</p>
                        </div>
                    )}
                    <div className="text-lg leading-relaxed whitespace-pre-wrap">
                        {question.promptText}
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Select Answer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!result ? (
                        <div className="space-y-6">
                            {isMultipleChoice ? (
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

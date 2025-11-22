'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronRight, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Question {
    id: string
    type: string
    title: string
    promptText: string
    difficulty: string
    practiced: boolean
    tags?: string[]
}

interface QuestionListProps {
    questions: Question[]
    onLoadMore?: () => void
    hasMore?: boolean
    isLoading?: boolean
}

export function QuestionList({
    questions,
    onLoadMore,
    hasMore,
    isLoading,
}: QuestionListProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.promptText.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'practiced' && q.practiced) ||
            (statusFilter === 'not_practiced' && !q.practiced)
        return matchesSearch && matchesDifficulty && matchesStatus
    })

    const handleQuestionClick = (questionId: string, type: string) => {
        router.push(`/pte/speaking/${type}/${questionId}`)
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative col-span-full md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Practice Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="practiced">Practiced</SelectItem>
                                <SelectItem value="not_practiced">Not Practiced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Grid */}
            <div className="grid gap-4">
                {filteredQuestions.map((question, index) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card
                            className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all cursor-pointer group"
                            onClick={() => handleQuestionClick(question.id, question.type)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                {question.title}
                                            </h3>
                                            {question.practiced && (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                                    Practiced
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={`${question.difficulty === 'Easy'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : question.difficulty === 'Medium'
                                                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}
                                            >
                                                {question.difficulty}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {question.promptText}
                                        </p>
                                        {question.tags && question.tags.length > 0 && (
                                            <div className="flex gap-1 flex-wrap">
                                                {question.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        onClick={onLoadMore}
                        variant="outline"
                        disabled={isLoading}
                        className="min-w-[200px]"
                    >
                        {isLoading ? 'Loading...' : 'Load More Questions'}
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {filteredQuestions.length === 0 && (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your filters or search query
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

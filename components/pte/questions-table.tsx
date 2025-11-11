'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type Question = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  status: 'completed' | 'in-progress' | 'not-started';
  attempts: number;
  score?: number;
  lastAttempted?: string;
};

type QuestionTableProps = {
  questions: Question[];
  category?: string;
};

export default function QuestionsTable({ questions, category }: QuestionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter questions based on search term, category and status
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || question.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for the filter
  const uniqueCategories = Array.from(new Set(questions.map(q => q.category)));

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Question Bank</CardTitle>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 bg-background"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 bg-background"
          >
            <option value="all">All Statuses</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No questions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.id}</TableCell>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.subcategory}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={question.difficulty === 'Hard' ? 'destructive' : 
                                question.difficulty === 'Medium' ? 'default' : 'secondary'}
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={question.status === 'completed' ? 'default' : 
                                question.status === 'in-progress' ? 'secondary' : 'outline'}
                      >
                        {question.status === 'completed' ? 'Completed' : 
                         question.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.attempts}</TableCell>
                    <TableCell>
                      {question.score ? `${question.score}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/pte-academic/practice/${question.category.toLowerCase()}/${question.subcategory.toLowerCase()}/question/${question.id}`}>
                            <Play className="h-4 w-4 mr-1" />
                            Practice
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredQuestions.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
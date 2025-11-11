"use client";

import React from "react";
import { pteScoreBreakdown, sectionSummaries, QuestionTypeScoreInfo } from "@/lib/pte/score-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic, PenTool, Headphones, Info } from "lucide-react";

export function ScoreBreakdownTable() {
  const sections = ['Speaking & Writing', 'Reading', 'Listening'] as const;
  
  const sectionIcons = {
    'Speaking & Writing': Mic,
    'Reading': BookOpen,
    'Listening': Headphones,
  };

  const sectionColors = {
    'Speaking & Writing': 'bg-blue-50 border-blue-200',
    'Reading': 'bg-green-50 border-green-200',
    'Listening': 'bg-purple-50 border-purple-200',
  };

  const getSectionQuestions = (section: QuestionTypeScoreInfo['section']) => {
    return pteScoreBreakdown.filter(q => q.section === section);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined) return '-';
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          PTE Content Question Types & Score Information Table V4
        </h1>
        <p className="text-sm text-gray-600">
          Effective from 25.08.07
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-md max-w-2xl mx-auto">
          <Info className="h-4 w-4" />
          <span>
            *The score proportion is a conclusion drawn from tests by the Xingji Teaching and Research Group. 
            The proportion in the actual exam will fluctuate slightly based on changes in the number of questions.
          </span>
        </div>
      </div>

      {/* Section Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {sections.map((section) => {
          const summary = sectionSummaries[section];
          const Icon = sectionIcons[section];
          const colorClass = sectionColors[section];
          
          return (
            <Card key={section} className={`${colorClass} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5" />
                  {section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{summary.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Question Types:</span>
                    <span className="font-semibold">{summary.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-semibold">{summary.totalQuestions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center font-bold">Seq</TableHead>
                  <TableHead className="min-w-[200px] font-bold">Question Type</TableHead>
                  <TableHead className="w-24 text-center font-bold">Numbers</TableHead>
                  <TableHead className="min-w-[250px] font-bold">Time for Answering</TableHead>
                  <TableHead className="w-24 text-center font-bold text-blue-600">Speaking</TableHead>
                  <TableHead className="w-24 text-center font-bold text-green-600">Writing</TableHead>
                  <TableHead className="w-24 text-center font-bold text-purple-600">Reading</TableHead>
                  <TableHead className="w-24 text-center font-bold text-orange-600">Listening</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => {
                  const questions = getSectionQuestions(section);
                  const sectionSummary = sectionSummaries[section];
                  
                  return (
                    <React.Fragment key={section}>
                      {/* Section Header Row */}
                      <TableRow className="bg-gray-100 font-bold">
                        <TableCell colSpan={8} className="py-3">
                          <div className="flex items-center justify-between">
                            <span className="text-lg">
                              {section === 'Speaking & Writing' ? 'I. ' : section === 'Reading' ? 'II. ' : 'III. '}
                              {section}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {sectionSummary.duration}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Question Rows */}
                      {questions.map((question) => (
                        <TableRow key={question.sequence} className="hover:bg-gray-50">
                          <TableCell className="text-center font-medium">
                            {question.sequence}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold">{question.questionType}</div>
                              <Badge variant="secondary" className="text-xs">
                                {question.abbreviation}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {question.numbers}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {question.timeForAnswering}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-blue-600">
                            {formatPercentage(question.speaking)}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-green-600">
                            {formatPercentage(question.writing)}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-purple-600">
                            {formatPercentage(question.reading)}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-orange-600">
                            {formatPercentage(question.listening)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Score Totals */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-600">Total Speaking Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pteScoreBreakdown.reduce((sum, q) => sum + (q.speaking || 0), 0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-600">Total Writing Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pteScoreBreakdown.reduce((sum, q) => sum + (q.writing || 0), 0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-600">Total Reading Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {pteScoreBreakdown.reduce((sum, q) => sum + (q.reading || 0), 0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-600">Total Listening Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pteScoreBreakdown.reduce((sum, q) => sum + (q.listening || 0), 0)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


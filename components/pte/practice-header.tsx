"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AcademicPracticeHeaderProps {
  section?: string;
  showFilters?: boolean;
}

export function AcademicPracticeHeader({ section, showFilters = true }: AcademicPracticeHeaderProps) {
  const pathname = usePathname();

  const formatSectionName = (section: string) => {
    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  const formatQuestionTypeName = (code: string) => {
    return code.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const pathSegments = pathname.split('/').filter(Boolean);
  const isQuestionType = pathSegments.includes('[questionType]') || pathSegments.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col space-y-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/pte-academic/practice" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="h-4 w-4" />
            Practice Hub
          </Link>
          {section && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/pte-academic/practice/section-tests/${section}`}
                className="hover:text-blue-600"
              >
                {formatSectionName(section)}
              </Link>
            </>
          )}
          {isQuestionType && section && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium">
                {formatQuestionTypeName(pathSegments[pathSegments.length - 1] || '')}
              </span>
            </>
          )}
        </nav>

        {/* Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {section ? `${formatSectionName(section)} Practice` : 'PTE Academic Practice'}
            </h1>
            <Badge variant="secondary">AI-Powered</Badge>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter:</span>
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="short">Short (≤2 min)</SelectItem>
                  <SelectItem value="medium">Medium (2-5 min)</SelectItem>
                  <SelectItem value="long">Long (≥5 min)</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Practice Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>AI Scoring Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span>Real-time Feedback</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span>Progress Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
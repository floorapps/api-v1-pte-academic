import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Mic, 
  PenTool, 
  Headphones, 
  TrendingUp, 
  Award, 
  Target,
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with real data from database
const stats = {
  overallScore: 68,
  targetScore: 79,
  practiceTests: 24,
  totalHours: 18.5,
};

const sectionScores = [
  { name: 'Speaking', score: 72, target: 79, icon: Mic, color: 'text-blue-600' },
  { name: 'Writing', score: 65, target: 79, icon: PenTool, color: 'text-green-600' },
  { name: 'Reading', score: 70, target: 79, icon: BookOpen, color: 'text-purple-600' },
  { name: 'Listening', score: 66, target: 79, icon: Headphones, color: 'text-orange-600' },
];

const recentActivity = [
  { id: 1, type: 'Speaking', questionType: 'Read Aloud', score: 78, date: '2 hours ago' },
  { id: 2, type: 'Writing', questionType: 'Essay', score: 72, date: '5 hours ago' },
  { id: 3, type: 'Reading', questionType: 'Multiple Choice', score: 85, date: '1 day ago' },
  { id: 4, type: 'Listening', questionType: 'Summarize Spoken Text', score: 68, date: '1 day ago' },
];

const quickActions = [
  {
    title: 'Speaking Practice',
    description: 'Start speaking exercises',
    icon: Mic,
    href: '/academic/pte-practice-test?category=speaking',
    color: 'bg-blue-500',
  },
  {
    title: 'Writing Practice',
    description: 'Practice essays & summaries',
    icon: PenTool,
    href: '/academic/pte-practice-test?category=writing',
    color: 'bg-green-500',
  },
  {
    title: 'Reading Practice',
    description: 'Improve comprehension',
    icon: BookOpen,
    href: '/academic/pte-practice-test?category=reading',
    color: 'bg-purple-500',
  },
  {
    title: 'Listening Practice',
    description: 'Enhance listening skills',
    icon: Headphones,
    href: '/academic/pte-practice-test?category=listening',
    color: 'bg-orange-500',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Track your progress and continue your PTE preparation journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overallScore}</p>
                  <p className="text-xs text-gray-500 mt-1">Target: {stats.targetScore}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Practice Tests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.practiceTests}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3 this week
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Hours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalHours}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">85%</p>
                  <p className="text-xs text-gray-500 mt-1">To target score</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Section Scores */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Section Scores</CardTitle>
                <CardDescription>Your performance across all PTE sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sectionScores.map((section) => {
                  const Icon = section.icon;
                  const progress = (section.score / section.target) * 100;
                  
                  return (
                    <div key={section.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${section.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{section.name}</p>
                            <p className="text-xs text-gray-500">Target: {section.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{section.score}</p>
                          <p className="text-xs text-gray-500">{section.target - section.score} to go</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{activity.questionType}</p>
                        <p className="text-xs text-gray-500">{activity.type}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.score >= 79 ? 'bg-green-100 text-green-800' : 
                          activity.score >= 65 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/activity">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start Practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{action.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Practice
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-4 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Ready for a Full Mock Test?</h3>
                <p className="text-blue-100">Take a complete PTE Academic practice test and get detailed feedback</p>
              </div>
              <Button size="lg" variant="secondary" className="whitespace-nowrap">
                Start Mock Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

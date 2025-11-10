'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  IconChevronRight,
  IconPlus,
  IconBook,
  IconFileCheck,
  IconTemplate,
  IconStar,
  IconCheck,
  IconBulb,
  IconChartBar,
  IconClock,
  IconPlayerPlay,
  IconVocabulary,
  IconEar,
  IconWaveSine,
} from '@tabler/icons-react';
import Link from 'next/link';
import useSWR from 'swr';
import { User as UserType } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: user, error: userError } = useSWR<UserType>('/api/user', fetcher);

  if (userError) return <div>Failed to load dashboard data.</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">Welcome to your PTE Practice Hub</h2>
            <p className="text-gray-300">Get full access to all features and tools to help you prepare for the PTE exam.</p>
          </div>
          <Button variant="secondary" size="lg">Get VIP Now</Button>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <IconBook className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>PTE Practice</CardTitle>
                <CardDescription>5000+ Questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Practice questions for PTE exam by question type</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <IconFileCheck className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Mock Tests</CardTitle>
                <CardDescription>200+ Tests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Simulate real exam conditions with mock tests</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <IconTemplate className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Templates</CardTitle>
                <CardDescription>20+ Templates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Get access to pre-written templates</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconStar className="h-6 w-6 text-yellow-500" />
                  Take free Mock Test with AI scoring
                </CardTitle>
              </div>
              <Button variant="default" size="sm">
                Try Mini Mock Test <IconChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-green-500" /> AI score + personalized feedback</li>
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-green-500" /> Total 19-21 questions</li>
                <li className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-green-500" /> Estimated time 30+ minutes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Study Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <div className="space-y-2">
                  <IconBulb className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-gray-600">Buy VIP to see question types you should focus on.</p>
                  <Button variant="outline">Buy VIP</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Guide</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Study Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">New PTE Academic Summarize Group Discussion Guide</h3>
                  <p className="text-sm text-gray-500">July 20, 2025</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">How to Improve Your Listening Skills</h3>
                  <p className="text-sm text-gray-500">July 27, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Report</CardTitle>
              <Button variant="outline" size="sm">Set New Target</Button>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Chart */}
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <IconChartBar className="h-12 w-12 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam In</CardTitle>
              <Button variant="outline" size="sm">Set New Date</Button>
            </CardHeader>
            <CardContent className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-gray-500">Days</div>
              </div>
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-gray-500">Hours</div>
              </div>
              <div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practice Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-500">Today Practiced</div>
              </div>
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-gray-500">Total Practiced</div>
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-gray-500">Practice Days</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <IconVocabulary className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Vocab Books</p>
              </div>
              <div className="text-center">
                <IconWaveSine className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Shadowing</p>
              </div>
              <div className="text-center">
                <IconEar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium">OnePTE MP3</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

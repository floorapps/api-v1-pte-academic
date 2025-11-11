'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import {
  IconLayoutDashboard,
  IconBook,
  IconFileCheck,
  IconTemplate,
  IconSchool,
  IconSparkles,
  IconRobot,
  IconBook2,
  IconHeadphones,
  IconMessage,
  IconChevronDown,
  IconChartBar,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/pte/dashboard', icon: IconLayoutDashboard },
  { name: 'Practice', href: '/pte/practice', icon: IconBook },
  {
    name: 'Mock Tests',
    href: '/pte/mock-tests',
    icon: IconFileCheck,
    children: [
      { name: 'Full Tests', href: '/pte/mock-tests/full-tests' },
      { name: 'Section Tests', href: '/pte/mock-tests/section-tests' },
      { name: 'Test History', href: '/pte/mock-tests/history' },
    ],
  },
  { name: 'Templates', href: '/pte/templates', icon: IconTemplate },
  { name: 'Study Center', href: '/pte/study-center', icon: IconSchool },
  { name: 'Smart Prep', href: '/pte/smart-prep', icon: IconSparkles },
  { name: 'Score Breakdown', href: '/pte/score-breakdown', icon: IconChartBar },
  { name: 'AI Coach', href: '/pte/ai-coach', icon: IconRobot },
  { name: 'Vocab Books', href: '/pte/vocab-books', icon: IconBook2 },
  { name: 'Shadowing', href: '/pte/shadowing', icon: IconHeadphones },
  { name: 'OnePTE MP3', href: '/pte/mp3', icon: IconHeadphones },
  { name: 'Support', href: '/pte/support', icon: IconMessage },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMockTests, setOpenMockTests] = useState(false);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
        {/* Logo */}
        <div className="mb-6 flex items-center px-3">
          <Link href="/pte/dashboard" className="flex items-center gap-2">
            <Image src="/asset/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-800">OnePTE</span>
          </Link>
        </div>

        {/* Exam Type */}
        <div className="mb-6 px-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Exam Type</h3>
          <ToggleGroup.Root
            type="single"
            defaultValue="academic"
            className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
          >
            <ToggleGroup.Item value="academic" className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 data-[state=on]:bg-white data-[state=on]:shadow">
              Academic
            </ToggleGroup.Item>
            <ToggleGroup.Item value="core" className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 data-[state=on]:bg-white data-[state=on]:shadow">
              Core
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            if (item.children) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenMockTests(!openMockTests)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <IconChevronDown
                      className={cn('h-4 w-4 transition-transform', openMockTests && 'rotate-180')}
                    />
                  </button>
                  {openMockTests && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'text-blue-600 font-medium'
                              : 'text-gray-500 hover:text-gray-800'
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

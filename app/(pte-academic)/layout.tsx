'use client';

import { useState, type ReactNode } from 'react';
import { AcademicSidebar } from '@/components/pte/academic-sidebar';
import { AcademicHeader } from '@/components/pte/academic-header';

export default function AcademicLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AcademicSidebar />
      </div>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="lg:pl-52">
          <AcademicHeader onMenuClick={toggleSidebar} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
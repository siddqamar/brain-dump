'use client';

import { Sidebar, TopBar } from '@/components/layout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="ml-60 pt-14">
        <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
      </main>
    </div>
  );
}

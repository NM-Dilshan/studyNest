'use client';

import { Sidebar } from '@/components/Sidebar';
import AdminHeader from '@/components/AdminHeader';
import { SearchProvider } from '@/contexts/SearchContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <NotificationProvider>
      <SearchProvider>
        <div className="flex h-screen bg-white">
          <Sidebar />
          <main className="flex-1 overflow-auto flex flex-col">
            <AdminHeader />
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </div>
      </SearchProvider>
    </NotificationProvider>
  );
}

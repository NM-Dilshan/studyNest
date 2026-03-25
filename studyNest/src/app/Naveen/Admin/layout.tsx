'use client';

import { Sidebar } from '@/components/Sidebar';
import AdminHeader from '@/components/AdminHeader';
import { SearchProvider } from '@/contexts/SearchContext';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SearchProvider>
      <div className="flex h-screen bg-[#F4F9F8]">
        <Sidebar />
        <main className="flex-1 overflow-auto flex flex-col">
          <AdminHeader />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SearchProvider>
  );
}

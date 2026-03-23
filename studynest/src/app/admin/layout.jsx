'use client'

import { Sidebar } from '@/components/Sidebar'
import AdminHeader from '@/components/AdminHeader'
import { SearchProvider } from '@/contexts/SearchContext'

export default function AdminLayout({ children }) {
  return (
    <SearchProvider>
      <div className="flex h-screen bg-[#F4F9F8]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Header */}
          <AdminHeader />
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SearchProvider>
  )
}

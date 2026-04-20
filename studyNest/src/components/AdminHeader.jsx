'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useSearch } from '@/contexts/SearchContext'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const { searchValue, setSearchValue } = useSearch()

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/admin')
  }

  // Get current date
  const getCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <header className="w-full bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative hidden md:block w-full max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search halls, study areas, buildings..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/30 focus:border-[#2E6F95]"
            />
          </div>

          {/* Right Section - Notifications, Profile & Date */}
          <div className="flex items-center gap-6">
            {/* Date - Hidden on mobile */}
            <div className="hidden lg:flex flex-col items-end">
              <p className="text-xs font-medium text-gray-500">Today</p>
              <p className="text-sm font-semibold text-gray-900">{getCurrentDate().split(', ')[0]}</p>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Profile Section */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                }}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center h-8 w-8 rounded-full text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-blue-700" style={{ backgroundColor: '#2E6F95' }}>
                  A
                </div>

                {/* Name & Role - Hidden on small screens */}
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>

                {/* Dropdown Icon */}
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Profile Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Account Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Help & Support
                  </a>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <a href="/login/admin" onClick={handleLogout} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/30 focus:border-[#2E6F95]"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

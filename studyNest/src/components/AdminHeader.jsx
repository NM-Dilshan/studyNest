'use client'

import { useState } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { Search, Bell, ChevronDown } from 'lucide-react'

export default function AdminHeader() {
  const { searchValue, setSearchValue } = useSearch()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

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

  const notificationCount = 3

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Center Section - Search Bar (Responsive) */}
          <div className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search spaces..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Right Section - Notifications, Profile & Date */}
          <div className="flex items-center gap-6">
            {/* Date - Hidden on mobile */}
            <div className="hidden lg:flex flex-col items-end">
              <p className="text-xs font-medium text-gray-500">Today</p>
              <p className="text-sm font-semibold text-gray-900">{getCurrentDate().split(', ')[0]}</p>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen)
                  setProfileOpen(false)
                }}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[1, 2, 3].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm text-gray-900 font-medium">Notification {item}</p>
                        <p className="text-xs text-gray-500 mt-1">Check your spaces and resources</p>
                      </a>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-center">
                    <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Section */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationOpen(false)
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
                    <a href="/auth/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Visible only on small screens */}
        <div className="md:hidden mt-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search spaces..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

'use client';

import Header from '@/components/Header'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type RecentUpdate = {
  type: 'Hall' | 'Study Area'
  name: string | null | undefined
  building: string | null | undefined
  occupancy: string
  reporter: string | null | undefined
  time: string
}

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Initialize user from localStorage without setState in effect
  const [user] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem('user')
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  })

  // Initialize recent updates without setState in effect
  const [recentUpdates] = useState<RecentUpdate[]>(() => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000).toISOString()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000).toISOString()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000).toISOString()
    
    return [
      {
        type: 'Hall' as const,
        name: 'Lecture Hall A101',
        building: 'Building A',
        occupancy: 'FREE',
        reporter: 'John Doe',
        time: fiveMinutesAgo,
      },
      {
        type: 'Study Area' as const,
        name: 'Main Library',
        building: 'Building B',
        occupancy: 'MEDIUM',
        reporter: 'Jane Smith',
        time: fifteenMinutesAgo,
      },
      {
        type: 'Hall' as const,
        name: 'Lecture Hall B205',
        building: 'Building C',
        occupancy: 'OCCUPIED',
        reporter: 'Mike Johnson',
        time: thirtyMinutesAgo,
      },
    ]
  })

  const [loading] = useState(false)

  useEffect(() => {
    // Mark hydration complete after component mounts
    setIsHydrated(true)
    
    // Handle authentication redirect
    if (!user) {
      router.push('/login/signIN')
    }
  }, [user, router])

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const profile = user ? { name: user.name } : null
  const isVolunteer = user?.role === 'volunteer'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Component */}
      <Header currentPage="home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Welcome, {isHydrated ? (profile?.name?.split(' ')[0] || 'Student') : 'Student'}!
            </h2>
            <span className="text-4xl">👋</span>
          </div>
          <p className="text-lg text-gray-600 mb-6">Find your perfect study space on campus</p>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for lecture halls, study areas..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Free Lecture Hall Finder */}
          <Link href="/student/halls" className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden block">
            <div className="p-6">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Lecture Hall Finder</h3>
              <p className="text-gray-600 mb-4">Find available lecture halls with real-time updates</p>
              <div className="flex items-center text-sm text-indigo-600 font-medium">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.257 19.879A2 2 0 005 21H3a2 2 0 01-2-2v-2c0-.253.045-.506.13-.75L13 7z" />
                </svg>
                Real-time finder
              </div>
            </div>
          </Link>

          {/* Study Area Finder */}
          <a href="/study-areas" className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden block">
            <div className="p-6">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Study Area Finder</h3>
              <p className="text-gray-600 mb-4">Check crowd levels in libraries and study spaces in real-time</p>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Real-time GPS tracking
              </div>
            </div>
          </a>

          {/* Submit Complaint */}
          <Link href="/Naveen/complaints">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer">
              <div className="p-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Complaint</h3>
                <p className="text-gray-600 mb-4">Report issues with facilities or study spaces</p>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                  2-3 days response
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Updates */}
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Updates</h3>
            <p className="text-gray-600 text-sm mt-1">Real-time status changes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {recentUpdates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 font-medium">No recent updates</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for space availability updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUpdates.map((update, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-600 pl-4 py-2 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {update.type === 'Hall' ? (
                            <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{update.name}</p>
                            <p className="text-xs text-gray-500">{update.building} minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        update.occupancy === 'FREE' 
                          ? 'bg-green-100 text-green-800' 
                          : update.occupancy === 'MEDIUM' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {update.occupancy || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
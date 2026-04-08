'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderStudentID from '@/components/HeaderStudentID'
import VolunteerHeaderDashboard from '@/components/VolunteerHeaderDashboard'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useLocationTracking } from '@/hooks/useLocationTracking'
import NotificationBellWrapper from '@/components/notifications/NotificationBellWrapper'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

interface MainHeaderProps {
  showAuthActions?: boolean
  showStudentId?: boolean
}

export default function MainHeader({ showAuthActions = true, showStudentId = true }: MainHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [gpsEnabled, setGpsEnabled] = useState(false)

  // Location tracking for GPS
  const location = useLocationTracking(user?.user_id || null, true)

  useEffect(() => {
    let parsedUser: User | null = null
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        parsedUser = JSON.parse(userData)
      } catch {
        localStorage.removeItem('user')
      }
    }

    const timer = setTimeout(() => {
      setUser(parsedUser)
      // Check if GPS is enabled for this user
      if (parsedUser) {
        const gpsStatus = localStorage.getItem(`gpsEnabled_${parsedUser.user_id}`)
        setGpsEnabled(gpsStatus === 'true')
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  const toggleGPS = async () => {
    if (!user || !location) return

    try {
      if (gpsEnabled) {
        // Disable GPS
        if (location.stopTracking && typeof location.stopTracking === 'function') {
          location.stopTracking()
        }
        if (location.revokePermission && typeof location.revokePermission === 'function') {
          await location.revokePermission()
        }
        localStorage.removeItem(`gpsEnabled_${user.user_id}`)
        setGpsEnabled(false)
      } else {
        // Enable GPS
        if (location.requestPermission && typeof location.requestPermission === 'function') {
          await location.requestPermission()
          if (location.startTracking && typeof location.startTracking === 'function') {
            location.startTracking()
          }
          localStorage.setItem(`gpsEnabled_${user.user_id}`, 'true')
          setGpsEnabled(true)
        }
      }
    } catch (err) {
      console.error('Failed to toggle GPS:', err)
    }
  }

  const isVolunteer = user?.role === 'volunteer'

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <Link href="/home" className="flex items-center space-x-2 flex-shrink-0 hover:opacity-80 transition">
            <Image 
              src="/logo.jpeg" 
              alt="StudyNest Logo" 
              width={40}
              height={40}
              className="rounded-md w-10 h-10"
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">StudyNest</h1>
              <p className="text-xs text-gray-500">Free Space Finder</p>
            </div>
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-0.5 flex-1 justify-center">
            <Link href="/home" className="px-3 py-2 text-sm font-medium text-[#2E6F95] hover:text-[#255B79] hover:bg-blue-50 rounded-md transition">
              Home
            </Link>
            {user && (
              <Link href="/requests" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2E6F95] hover:bg-gray-100 rounded-md transition">
                Requests
              </Link>
            )}
            <Link href="/student/halls" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2E6F95] hover:bg-gray-100 rounded-md transition">
              Halls
            </Link>
            <a href="/study-areas" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2E6F95] hover:bg-gray-100 rounded-md transition">
              Study Areas
            </a>
            <a href="/about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2E6F95] hover:bg-gray-100 rounded-md transition">
              About
            </a>
            <Link href="/Naveen/my-complaints" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2E6F95] hover:bg-gray-100 rounded-md transition">
              Complaints
            </Link>
            
            {/* Volunteer Dashboard - Only for volunteers */}
            {isVolunteer && (
              <div className="ml-2 pl-2 border-l border-gray-200">
                <a href="/volunteer/requests" className="px-4 py-2 ml-2 bg-[#2E6F95] text-white text-sm font-medium rounded-md hover:bg-[#1e4f6f] transition">
                  Dashboard
                </a>
              </div>
            )}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* GPS Toggle Button */}
            {user && (
              <button
                onClick={toggleGPS}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all border ${
                  gpsEnabled
                    ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
                title={gpsEnabled ? 'GPS is active' : 'Enable GPS location'}
              >
                <MapPin className={`w-4 h-4 ${gpsEnabled ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="hidden lg:inline text-xs">{gpsEnabled ? 'GPS On' : 'GPS Off'}</span>
              </button>
            )}

            {/* User Info - Volunteer Dashboard or Student ID */}
            {isVolunteer ? (
              <div className="hidden lg:block border-r border-gray-200 pr-3">
                <VolunteerHeaderDashboard />
              </div>
            ) : (
              <div className="hidden lg:block border-r border-gray-200 pr-3">
                <HeaderStudentID />
              </div>
            )}

            {/* Notification Bell */}
            {user && <NotificationBellWrapper userId={user.user_id} userRole={user.role} />}

            {/* Logout Button */}
            {user ? (
              <form onSubmit={handleLogout}>
                <button 
                  type="submit" 
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link href="/login/signIN" className="px-3 py-1.5 text-sm font-medium text-[#2E6F95] hover:text-[#255B79] hover:bg-blue-50 rounded-md transition">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

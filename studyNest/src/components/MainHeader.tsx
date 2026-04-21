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
import { clearStoredSession, readStoredUser, type ClientUser } from '@/lib/auth/clientUser'

interface MainHeaderProps {
  showAuthActions?: boolean
  showStudentId?: boolean
}

export default function MainHeader({ showAuthActions = true, showStudentId = true }: MainHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<ClientUser | null>(null)
  const [gpsEnabled, setGpsEnabled] = useState(false)

  // Location tracking for GPS
  const location = useLocationTracking(user?.user_id || null, true)

  useEffect(() => {
    const parsedUser = readStoredUser()

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
    clearStoredSession()
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
        <div className="flex min-h-16 items-center justify-between gap-2 py-2">
          {/* Logo & Branding */}
          <Link href="/home" className="flex items-center space-x-2 flex-shrink-0 hover:opacity-80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2 rounded-md">
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
          <nav className="hidden min-w-0 flex-1 items-center justify-center space-x-0.5 overflow-x-auto lg:flex" aria-label="Main navigation">
            <Link href="/home" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-[#2E6F95] transition hover:bg-blue-50 hover:text-[#255B79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
              Home
            </Link>
            {user && (
              <Link href="/requests" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#2E6F95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
                Requests
              </Link>
            )}
            <Link href="/student/halls" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#2E6F95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
              Halls
            </Link>
            <Link href="/study-areas" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#2E6F95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
              Study Areas
            </Link>
            <Link href="/about" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#2E6F95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
              About
            </Link>
            <Link href="/Naveen/my-complaints" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-[#2E6F95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
              Complaints
            </Link>
            
            {/* Volunteer Dashboard - Only for volunteers */}
            {isVolunteer && (
              <div className="ml-2 pl-2 border-l border-gray-200">
                <Link href="/volunteer/requests" className="ml-2 inline-flex min-h-11 items-center rounded-md bg-[#2E6F95] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1e4f6f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
                  Dashboard
                </Link>
              </div>
            )}
          </nav>

          {/* User Info & Actions */}
          <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {/* GPS Toggle Button */}
            {user && (
              <button
                onClick={toggleGPS}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-2.5 py-2 font-medium transition-all sm:px-3 ${
                  gpsEnabled
                    ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2`}
                title={gpsEnabled ? 'GPS is active' : 'Enable GPS location'}
                aria-label={gpsEnabled ? 'Disable GPS location tracking' : 'Enable GPS location tracking'}
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
                  className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link href="/login/signIN" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-[#2E6F95] transition hover:bg-blue-50 hover:text-[#255B79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F95] focus-visible:ring-offset-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

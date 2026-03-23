'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import StudyAreaCard from '@/components/StudyAreaCard'
import StudyAreaMap from '@/components/StudyAreaMap'
import ClientLocationToggle from '@/components/ClientLocationToggle'
import { Bell, LogOut, TrendingUp } from 'lucide-react'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
}

interface StudyArea {
  study_area_id: string
  area_name: string
  description?: string
  capacity?: number
  lat?: number
  lng?: number
  radius_meters?: number
  is_active: boolean
  occupancy?: Array<{
    current_count: number
    updated_at?: string
  }>
}

export default function StudyAreasPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState('')
  const [areas, setAreas] = useState<StudyArea[]>([])
  const [counts, setCounts] = useState({ low: 0, medium: 0, high: 0 })
  const [loading, setLoading] = useState(true)
  const [mapboxToken, setMapboxToken] = useState('')

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login/signIN')
      return
    }

    try {
      const parsedUser: User = JSON.parse(userData)
      setUser(parsedUser)
      setUserId(parsedUser.user_id)
      
      // Fetch study areas
      fetchStudyAreas()
    } catch (error) {
      console.error('Failed to parse user data:', error)
      router.push('/login/signIN')
    }
  }, [router])

  const fetchStudyAreas = async () => {
    try {
      // Call API endpoint that uses Prisma to fetch study areas
      const response = await fetch('/api/study-areas')
      
      if (!response.ok) throw new Error('Failed to fetch study areas')
      
      const data = await response.json()
      const studyAreas = data.areas || []

      if (Array.isArray(studyAreas)) {
        setAreas(studyAreas as StudyArea[])

        // Calculate summary counts
        let lowCount = 0, mediumCount = 0, highCount = 0
        studyAreas.forEach((area: any) => {
          const count = area.occupancy?.[0]?.current_count || 0
          const percent = area.capacity ? (count / area.capacity) * 100 : 0

          if (percent <= 30) lowCount++
          else if (percent <= 70) mediumCount++
          else highCount++
        })
        
        setCounts({ low: lowCount, medium: mediumCount, high: highCount })
      }

      // Get mapbox token from environment
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      setMapboxToken(token)
    } catch (error) {
      console.error('Error fetching study areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study areas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Prepare map data
  const mapAreas = areas
    .filter((a): a is StudyArea & { lat: number; lng: number; radius_meters: number } => 
      a.lat !== undefined && a.lng !== undefined && a.radius_meters !== undefined
    )
    .map((a) => ({
      id: a.study_area_id,
      name: a.area_name,
      lat: a.lat,
      lng: a.lng,
      radius_meters: a.radius_meters,
    }))

  // Current occupancy for map
  const occupancyMap: Record<string, number> = {}
  areas.forEach((area) => {
    occupancyMap[area.study_area_id] = area.occupancy?.[0]?.current_count || 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/home" className="flex items-center space-x-3">
              <Image 
                src="/logo.jpeg" 
                alt="StudyNest Logo" 
                width={40}
                height={40}
                className="rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">StudyNest</h1>
                <p className="text-xs text-gray-500">Campus Free Space Finder</p>
              </div>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Home
              </Link>
              <Link href="/lecture-halls" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Lecture Halls
              </Link>
              <Link href="/study-areas" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-600">
                Study Areas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <form action="/api/auth/signout" method="post">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Area Finder</h1>
          <p className="text-gray-600">Check real-time crowd levels and available seats powered by anonymous location sharing</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Low Crowd</p>
              <p className="text-3xl font-bold text-green-600">{counts.low}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600 rotate-180" />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Medium Crowd</p>
              <p className="text-3xl font-bold text-yellow-600">{counts.medium}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">High Crowd</p>
              <p className="text-3xl font-bold text-red-600">{counts.high}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Map */}
        {mapboxToken && mapAreas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Occupancy Map</h2>
            <StudyAreaMap areas={mapAreas} token={mapboxToken} occupancy={occupancyMap} />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Circles show area boundaries. Hover over circles to see current occupancy.
            </p>
          </div>
        )}

        {/* Study Area Cards Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Areas</h2>
          {areas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">No study areas found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area) => (
                <StudyAreaCard key={area.study_area_id} area={area} />
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">🌙 Least Crowded Times</h3>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm">
              <li>• Early mornings (7AM – 9AM)</li>
              <li>• Late afternoons (4PM – 6PM)</li>
              <li>• Weekends before 10AM</li>
              <li>• Between lectures (unless exam season)</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">⚠️ Peak Hours (Avoid)</h3>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm">
              <li>• Mid-morning (10AM – 12PM)</li>
              <li>• After lunch (1PM – 3PM)</li>
              <li>• Evening study hours (7PM – 10PM)</li>
              <li>• The week before exams</li>
            </ul>
          </div>
        </div>

        {/* Privacy & Location Sharing */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">🔒 Privacy-First Real-Time Tracking</h3>
              <p className="text-sm text-gray-800 mt-2">
                Your exact location is never stored. We only count how many people are in each study area, anonymously.
                Location data expires after 5 minutes. You can stop sharing anytime.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <ClientLocationToggle userId={userId} />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">❓ Frequently Asked Questions</h3>
          <div className="space-y-4">
            <details className="border-b border-gray-200 pb-4">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">
                How is crowd data collected?
              </summary>
              <p className="text-sm text-gray-600 mt-2">
                Mobile devices share their GPS location with our servers. We analyze if the location falls within a study
                area and increment the count. No personal data is stored.
              </p>
            </details>
            <details className="border-b border-gray-200 pb-4">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">
                Is my location data private?
              </summary>
              <p className="text-sm text-gray-600 mt-2">
                Yes. Your exact latitude/longitude is processed instantly and discarded. Only the occupancy count is
                stored, updated every minute. You can revoke permission anytime.
              </p>
            </details>
            <details className="pb-4">
              <summary className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">
                Why do I see "Low" even when it's crowded?
              </summary>
              <p className="text-sm text-gray-600 mt-2">
                Crowd levels depend on actual device locations. If fewer people are sharing their location, the count will
                be lower. The more people opt-in, the more accurate the data.
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  )
}
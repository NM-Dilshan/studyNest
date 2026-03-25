'use client'

import { useState, useEffect } from 'react'
import { StudyAreaCard } from '@/components/StudyAreaCard'
import { StudyAreaSummary } from '@/components/StudyAreaSummary'
import MainHeader from '@/components/MainHeader'
import { LocationPermissionBanner } from '@/components/LocationPermissionBanner'
import { MapPin } from 'lucide-react'

interface StudyArea {
  id: string
  name: string
  building?: string
  floor?: string
  capacity: number
  latitude: number
  longitude: number
  radiusMeters: number
  facilities: {
    wifi: boolean
    chargingPorts: boolean
    silentZone: boolean
    ac: boolean
  }
  currentCount: number
  availableSeats: number
  occupancyPercentage: number
  crowdStatus: 'Low Crowd' | 'Medium Crowd' | 'High Crowd'
  trendStatus: 'Getting crowded' | 'Getting quieter' | 'Stable'
  lastUpdated: Date
}

interface SummaryData {
  lowCrowdCount: number
  mediumCrowdCount: number
  highCrowdCount: number
  totalAreas: number
}

export default function StudyAreasPage() {
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    lowCrowdCount: 0,
    mediumCrowdCount: 0,
    highCrowdCount: 0,
    totalAreas: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'occupancy' | 'name' | 'available'>('occupancy')
  const [filterCrowd, setFilterCrowd] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserId(user.user_id)
        } catch (e) {
          console.error('Failed to parse user data:', e)
        }
      }
    }
  }, [])

  // Fetch study areas
  const fetchStudyAreas = async () => {
    try {
      const response = await fetch('/api/study-areas')
      if (!response.ok) throw new Error('Failed to fetch study areas')
      const data = await response.json()
      
      // Transform API response into StudyArea objects with Date
      const transformed = data.areas.map((area: any) => ({
        ...area,
        lastUpdated: new Date(area.lastUpdated),
      }))
      
      setStudyAreas(transformed)
      setSummary(data.summary)
      setError(null)
    } catch (err) {
      console.error('Error fetching study areas:', err)
      setError('Failed to load study areas. Please try again.')
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchStudyAreas()
    setLoading(false)
  }, [])

  // Real-time polling - fetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchStudyAreas, 10000)
    return () => clearInterval(interval)
  }, [])

  // Filter study areas based on selected crowd level
  const filteredAreas = studyAreas.filter((area) => {
    if (filterCrowd === 'all') return true
    return area.crowdStatus.toLowerCase().includes(filterCrowd)
  })

  // Sort study areas
  const sortedAreas = [...filteredAreas].sort((a, b) => {
    switch (sortBy) {
      case 'occupancy':
        return a.occupancyPercentage - b.occupancyPercentage // Low occupancy first
      case 'name':
        return a.name.localeCompare(b.name)
      case 'available':
        return b.availableSeats - a.availableSeats // More available seats first
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MainHeader />
      {userId && <LocationPermissionBanner userId={userId} />}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
        {/* Summary Section */}
        <StudyAreaSummary {...summary} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Location Permission Notice */}
        {userId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Share your location to see study areas near you
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="occupancy">Least Crowded First</option>
                <option value="available">Most Available Seats</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

            {/* Filter Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Crowd Level
              </label>
              <select
                value={filterCrowd}
                onChange={(e) => setFilterCrowd(e.target.value as typeof filterCrowd)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Areas</option>
                <option value="low">Low Crowd</option>
                <option value="medium">Medium Crowd</option>
                <option value="high">High Crowd</option>
              </select>
            </div>
          </div>
        </div>

        {/* Study Areas Grid */}
        {sortedAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAreas.map((area) => (
              <StudyAreaCard
                key={area.id}
                id={area.id}
                name={area.name}
                building={area.building}
                floor={area.floor}
                capacity={area.capacity}
                currentCount={area.currentCount}
                crowdStatus={area.crowdStatus}
                trendStatus={area.trendStatus}
                lastUpdated={area.lastUpdated}
                facilities={area.facilities}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No study areas found</p>
            {filterCrowd !== 'all' && (
              <button
                onClick={() => setFilterCrowd('all')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Last Update Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Updates automatically every 10 seconds</p>
        </div>
      </div>
    </div>
    </>
  )
}
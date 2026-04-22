'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  ArrowLeft,
  Wifi,
  Zap,
  Volume2,
  Wind,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
} from 'lucide-react'

interface StudyAreaDetail {
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
  activeStudents?: number
}

export default function StudyAreaDetailPage() {
  const params = useParams()
  const areaId = params.id as string
  const [area, setArea] = useState<StudyAreaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAreaDetail = useCallback(async () => {
      if (!areaId) {
        setError('Invalid study area ID')
        setLoading(false)
        return
      }

      if (inFlightRef.current) return
      if (typeof document !== 'undefined' && document.hidden) return
      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      inFlightRef.current = true
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch(`/api/study-areas/${areaId}`, {
          signal: controller.signal,
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch area details`)
        }
        
        const data = await response.json()
        
        if (!data.area) {
          throw new Error('No area data received from server')
        }
        
        setArea({
          ...data.area,
          lastUpdated: new Date(data.area.lastUpdated),
          activeStudents: data.activeStudents || 0,
        })
        setError(null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('Error fetching area details:', errorMessage)
        setError(`Failed to load study area details: ${errorMessage}`)
      } finally {
        inFlightRef.current = false
        setLoading(false)
      }
    }, [areaId])

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) {
        fetchAreaDetail()
      }
    }

    const onOnline = () => {
      fetchAreaDetail()
    }

    fetchAreaDetail()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAreaDetail, 5000)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      abortControllerRef.current?.abort()
    }
  }, [fetchAreaDetail])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-40 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !area) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/study-areas" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Study Areas
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Study area not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const crowdColor =
    area.crowdStatus === 'Low Crowd'
      ? 'bg-green-100 text-green-800'
      : area.crowdStatus === 'Medium Crowd'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'

  const crowdBgColor =
    area.crowdStatus === 'Low Crowd'
      ? 'bg-green-500'
      : area.crowdStatus === 'Medium Crowd'
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const trendIcon =
    area.trendStatus === 'Getting crowded' ? (
      <TrendingUp className="w-5 h-5 text-orange-500" />
    ) : area.trendStatus === 'Getting quieter' ? (
      <TrendingDown className="w-5 h-5 text-blue-500" />
    ) : (
      <div className="w-5 h-5 text-gray-500">—</div>
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Back Link */}
        <Link href="/study-areas" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Study Areas
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{area.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              {area.building && <span>{area.building}</span>}
              {area.floor && <span>• Floor {area.floor}</span>}
            </div>

            {/* Status Badges */}
            <div className="flex gap-3 flex-wrap">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${crowdColor}`}>
                {area.crowdStatus}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {trendIcon}
                {area.trendStatus}
              </span>
            </div>
          </div>

          {/* Occupancy Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Main Occupancy */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Current Occupancy</h2>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {area.occupancyPercentage.toFixed(0)}%
                </div>
                <p className="text-gray-600 mb-4">
                  {area.currentCount} of {area.capacity} seats filled
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${crowdBgColor}`}
                    style={{ width: `${Math.min(area.occupancyPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Available Seats */}
            <div className="bg-blue-50 rounded-lg p-6 flex flex-col justify-center">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900 mb-1">{area.availableSeats}</div>
                <p className="text-blue-700">Seats Available</p>
              </div>
            </div>
          </div>

          {/* Active Students */}
          {area.activeStudents !== undefined && (
            <div className="bg-purple-50 rounded-lg p-4 mb-8 flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Active Students</p>
                <p className="text-xs text-purple-700">
                  {area.activeStudents} student{area.activeStudents !== 1 ? 's' : ''} with location sharing enabled
                </p>
              </div>
            </div>
          )}

          {/* Facilities Section */}
          {(area.facilities.wifi ||
            area.facilities.chargingPorts ||
            area.facilities.silentZone ||
            area.facilities.ac) && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {area.facilities.wifi && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">WiFi</span>
                  </div>
                )}
                {area.facilities.chargingPorts && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">Charging</span>
                  </div>
                )}
                {area.facilities.silentZone && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Volume2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Silent Zone</span>
                  </div>
                )}
                {area.facilities.ac && (
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                    <Wind className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-900">A/C</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Last updated{' '}
              {area.lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">📍 Location Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Latitude:</span> {area.latitude.toFixed(6)}
              </p>
              <p>
                <span className="font-medium text-gray-900">Longitude:</span> {area.longitude.toFixed(6)}
              </p>
              <p>
                <span className="font-medium text-gray-900">Detection Radius:</span> {area.radiusMeters}m
              </p>
              <p>
                <span className="font-medium text-gray-900">Capacity:</span> {area.capacity} seats
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                • Check back in{' '}
                <span className="font-medium text-gray-900">5-10 minutes</span> for live updates
              </li>
              <li>
                • Location data is anonymous and{' '}
                <span className="font-medium text-gray-900">expires after 5 minutes</span>
              </li>
              <li>
                • Crowd levels depend on opt-in location sharing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

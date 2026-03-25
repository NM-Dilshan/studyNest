'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, X } from 'lucide-react'
import { requestLocationPermission, watchLocationUpdates, stopLocationWatch } from '@/lib/location-utils'

interface LocationPermissionBannerProps {
  userId: string
}

export function LocationPermissionBanner({ userId }: LocationPermissionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [status, setStatus] = useState<'idle' | 'requesting' | 'enabled' | 'error'>('idle')
  const watchIdRef = useRef<number | null>(null)

  // Check if location sharing is already enabled
  useEffect(() => {
    const checkStoredPreference = () => {
      const storedPreference = localStorage.getItem(`locationTracking_${userId}`)
      if (storedPreference === 'enabled') {
        setIsEnabled(true)
        startLocationTracking()
      }
    }
    checkStoredPreference()

    return () => {
      if (watchIdRef.current !== null) {
        stopLocationWatch(watchIdRef.current)
      }
    }
  }, [userId])

  const startLocationTracking = async () => {
    setStatus('requesting')
    try {
      // Request permission first
      await requestLocationPermission()

      // Watch location updates
      const watchId = watchLocationUpdates(
        async (location) => {
          try {
            await fetch('/api/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                latitude: location.latitude,
                longitude: location.longitude,
              }),
            })
          } catch (err) {
            console.error('Failed to send location:', err)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setStatus('error')
        }
      )

      watchIdRef.current = watchId
      setIsEnabled(true)
      setStatus('enabled')
      localStorage.setItem(`locationTracking_${userId}`, 'enabled')
    } catch (err) {
      console.error('Failed to start location tracking:', err)
      setStatus('error')
    }
  }

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      stopLocationWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsEnabled(false)
    setStatus('idle')
    localStorage.removeItem(`locationTracking_${userId}`)
  }

  const handleToggle = () => {
    if (isEnabled) {
      stopLocationTracking()
    } else {
      startLocationTracking()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">Location Sharing</h3>
          <p className="text-xs text-gray-500 mt-1">Help others find less crowded study areas</p>
        </div>
      </div>

      {/* Status Message */}
      {status === 'error' && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded">
          Failed to access location. Please check permissions.
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        {isEnabled
          ? '✓ Your anonymous location is being shared. Data expires after 5 minutes.'
          : 'Enable location sharing to contribute to accurate crowd levels in study areas.'}
      </p>

      {/* Privacy Info */}
      <div className="bg-blue-50 text-xs text-blue-700 p-2 rounded mb-4">
        🔒 <span className="font-medium">Privacy Protected:</span> Your exact location is not stored. Only occupancy counts are shown.
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={status === 'requesting'}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          isEnabled
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : status === 'requesting'
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {status === 'requesting'
          ? 'Requesting access...'
          : isEnabled
            ? 'Stop Sharing Location'
            : 'Start Sharing Location'}
      </button>
    </div>
  )
}

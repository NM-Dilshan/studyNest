'use client'

/**
 * useGeolocation — Request browser GPS location with error handling
 */

import { useState, useEffect } from 'react'

interface GeolocationCoords {
  latitude: number
  longitude: number
}

interface UseGeolocationReturn {
  coords: GeolocationCoords | null
  loading: boolean
  error: string | null
  requestLocation: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        let errorMsg = 'Unable to get your location'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Enable it in your browser settings.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable.'
            break
          case err.TIMEOUT:
            errorMsg = 'Location request timed out. Please try again.'
            break
        }

        setError(errorMsg)
        setLoading(false)
      },
      {
        enableHighAccuracy: false, // Use standard accuracy to speed up request
        timeout: 10000,
        maximumAge: 300000, // Cache location for 5 minutes
      }
    )
  }

  return {
    coords,
    loading,
    error,
    requestLocation,
  }
}

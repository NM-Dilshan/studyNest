'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation } from 'lucide-react'
import type { ComponentType } from 'react'

// SLIIT Colombo Campus coordinates
const SLIIT_CAMPUS_CENTER = [6.9147, 79.9729] as [number, number]
const SLIIT_CAMPUS_BOUNDS: [[number, number], [number, number]] = [
  [6.9118, 79.9699],
  [6.9178, 79.9761],
]
const DEFAULT_ZOOM = 18
const RADIUS_METERS = 20

type LocationSource = 'device' | 'manual' | null

interface LocationValue {
  latitude: number | null
  longitude: number | null
  source: LocationSource
  radius: number
}

interface LocationMapContentProps {
  center: [number, number]
  bounds: [[number, number], [number, number]]
  markerPosition: { lat: number; lng: number } | null
  radius?: number
  onMapClick: (lat: number, lng: number) => void
}

interface DeviceLocationPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

// Dynamically import the map component to avoid SSR issues
const MapContent = dynamic(
  () => import('./LocationMapContent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
        Loading map...
      </div>
    ),
  }
) as ComponentType<LocationMapContentProps>

export default function DeviceLocationPicker({
  value,
  onChange,
}: DeviceLocationPickerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(20)

  const handleUseCurrentLocation = async () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onChange({
          latitude,
          longitude,
          source: 'device',
          radius,
        })
        setLoading(false)
      },
      (err) => {
        let errorMsg = 'Unable to get your location'
        if (err.code === 1) {
          errorMsg = 'Location permission denied. Please enable it in settings.'
        } else if (err.code === 2) {
          errorMsg = 'Location unavailable. Please try again.'
        } else if (err.code === 3) {
          errorMsg = 'Location request timed out.'
        }
        setError(errorMsg)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  const handleMapClick = (lat: number, lng: number) => {
    onChange({
      latitude: lat,
      longitude: lng,
      source: 'manual',
      radius,
    })
  }

  const hasLocation = value.latitude !== null && value.longitude !== null

  return (
    <div className="space-y-6">
      {/* Device Location Section - Dark Card */}
      <div className="rounded-2xl bg-slate-800 p-6 border border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-blue-400" />
              Device Location
            </h3>
            
            {hasLocation ? (
              <div className="space-y-1">
                <p className="text-sm text-blue-300 font-medium">
                  Using current coordinates: {value.latitude?.toFixed(6)}, {value.longitude?.toFixed(6)}
                </p>
                <p className="text-xs text-slate-400">
                  Saved source: {value.source === 'device' ? 'Device location' : 'Manual map selection'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No location selected yet
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-slate-600 text-slate-300 text-sm font-medium hover:border-blue-500 hover:text-blue-400 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Navigation size={16} />
            {loading ? 'Getting...' : 'Use Current Location'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
        <MapContent
          center={
            hasLocation
              ? [value.latitude!, value.longitude!]
              : SLIIT_CAMPUS_CENTER
          }
          bounds={SLIIT_CAMPUS_BOUNDS}
          markerPosition={
            hasLocation
              ? { lat: value.latitude!, lng: value.longitude! }
              : null
          }
          radius={radius}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Helper Text */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900">
          <span className="font-medium">💡 Tip:</span> Click on the map to select a location and adjust the radius zone using the slider below.
        </p>
      </div>

      {/* Radius Adjustment Slider */}
      {hasLocation && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                Zone Radius: {radius}m
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5m</span>
                <span>100m</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * NearMeToggle — Toggle GPS-based distance sorting
 */

import { useGeolocation } from '@/hooks/useGeolocation'

interface NearMeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onLocationObtained: (lat: number, lng: number) => void
}

export default function NearMeToggle({ enabled, onToggle, onLocationObtained }: NearMeToggleProps) {
  const { coords, error, loading, requestLocation } = useGeolocation()

  const handleToggle = async () => {
    if (!enabled) {
      // Enable Near Me
      requestLocation()
    } else {
      // Disable
      onToggle(false)
    }
  }

  // If location obtained, notify parent and enable toggle
  if (coords && !enabled) {
    onLocationObtained(coords.latitude, coords.longitude)
    onToggle(true)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          enabled
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{loading ? '⏳' : '📍'}</span>
        <span>{loading ? 'Getting location...' : 'Near Me'}</span>
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

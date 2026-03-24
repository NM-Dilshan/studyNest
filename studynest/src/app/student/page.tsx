'use client'

/**
 * FreeHallFinder — Main student page for discovering free halls
 */

import { useState, useEffect, useMemo } from 'react'
import { useFreeHalls } from '@/hooks/useFreeHalls'
import { useNextFreeSlot } from '@/hooks/useNextFreeSlot'
import { useSuitabilityScores } from '@/hooks/useSuitabilityScores'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useFreeFavourites } from '@/hooks/useFreeFavourites'
import { getFavouriteHallIds } from '@/services/favouriteService'
import { supabase } from '@/lib/supabase'
import { FreeHallResult, StudyPurpose, UsagePattern } from '@/types/halls'
import HallCard from '@/components/halls/HallCard'
import HallFilters from '@/components/halls/HallFilters'
import FreeFavouritesButton from '@/components/favourites/FreeFavouritesButton'
import PreferencesPanel from '@/components/preferences/PreferencesPanel'

const HAVERSINE_RADIUS_KM = 6371

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2

  return HAVERSINE_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function FreeHallFinder() {
  // Get user ID from auth context (TODO: wire up actual auth)
  const userId = 'user-123'

  // State
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [minCapacity, setMinCapacity] = useState(1)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [quietOnly, setQuietOnly] = useState(false)
  const [nearMeEnabled, setNearMeEnabled] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPurpose, setSelectedPurpose] = useState<StudyPurpose | null>(null)
  const [selectedGroupSize, setSelectedGroupSize] = useState<number>(1)
  const [showingFavourites, setShowingFavourites] = useState(false)
  const [preferencePanelOpen, setPreferencePanelOpen] = useState(false)
  const [favouriteHallIds, setFavouriteHallIds] = useState<Set<string>>(new Set())

  // Hooks
  const { hallsNow, loading: loadingFreeHalls, error: errorFreeHalls } = useFreeHalls()
  const { nextSlots, loading: loadingNextSlots } = useNextFreeSlot(3, 30)
  const { scores, computeScores } = useSuitabilityScores()
  const { preferences, updatePreferences } = useUserPreferences(userId)
  const { freeFavourites, refetch: refetchFreeFavourites } = useFreeFavourites(userId)

  // Load usage patterns and favourites on mount
  const [usagePatterns, setUsagePatterns] = useState<Map<string, UsagePattern>>(new Map())

  useEffect(() => {
    const loadData = async () => {
      // Load usage patterns
      const now = new Date()
      const dayOfWeek = now.getDay()
      const hour = now.getHours()

      const { data: patterns } = await supabase
        .from('hall_usage_patterns')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('hour_of_day', hour)

      if (patterns) {
        const patternMap = new Map(patterns.map((p: any) => [p.hall_id, p]))
        setUsagePatterns(patternMap)
      }

      // Load favourite hall IDs
      try {
        const favIds = await getFavouriteHallIds(userId)
        setFavouriteHallIds(new Set(favIds))
      } catch (err) {
        console.error('Failed to load favourites:', err)
      }
    }

    loadData()
  }, [userId])

  // Use saved preferences as default
  useEffect(() => {
    if (preferences) {
      setSelectedPurpose(preferences.default_purpose)
      setSelectedGroupSize(preferences.default_group_size)
    }
  }, [preferences])

  // Compute scores when purpose/group size changes
  useEffect(() => {
    if (selectedPurpose && selectedGroupSize && hallsNow.length > 0) {
      const hallIds = hallsNow.map((h) => h.hall_id)
      computeScores(hallIds, selectedPurpose, selectedGroupSize)
    }
  }, [selectedPurpose, selectedGroupSize, hallsNow, computeScores])

  // Filter halls based on selected criteria
  const filteredHalls = useMemo(() => {
    let halls = showingFavourites ? freeFavourites : hallsNow

    // Filter by blocked conflicts
    halls = halls.filter((h) => !(h.conflict_severity === 'blocked'))

    // Filter by building
    if (selectedBuilding) {
      halls = halls.filter((h) => h.building === selectedBuilding)
    }

    // Filter by floor
    if (selectedFloor !== null) {
      halls = halls.filter((h) => h.floor === selectedFloor)
    }

    // Filter by min capacity
    halls = halls.filter((h) => h.capacity >= minCapacity)

    // Filter by facilities
    if (selectedFacilities.length > 0) {
      halls = halls.filter((h) =>
        selectedFacilities.every(
          (fac) =>
            (fac === 'projector' && h.projector) ||
            (fac === 'wifi' && h.wifi) ||
            (fac === 'ac' && h.ac) ||
            (fac === 'whiteboard' && h.whiteboard) ||
            (fac === 'wheelchair_accessible' && h.wheelchair_accessible) ||
            (fac === 'power_sockets' && h.power_sockets)
        )
      )
    }

    return halls
  }, [showingFavourites, hallsNow, freeFavourites, selectedBuilding, selectedFloor, minCapacity, selectedFacilities])

  // Sort halls by score or distance
  const sortedHalls = useMemo(() => {
    const halls = [...filteredHalls]

    if (nearMeEnabled && userLocation) {
      // Sort by distance, but filter out halls without coords first
      const withCoords = halls.filter((h) => h.latitude && h.longitude)
      const withoutCoords = halls.filter((h) => !h.latitude || !h.longitude)

      withCoords.sort((a, b) => {
        const distA = haversineDistance(userLocation.lat, userLocation.lng, a.latitude!, a.longitude!)
        const distB = haversineDistance(userLocation.lat, userLocation.lng, b.latitude!, b.longitude!)
        return distA - distB
      })

      // Add distance property for display
      return [
        ...withCoords.map((h) => ({
          ...h,
          distanceKm: haversineDistance(userLocation.lat, userLocation.lng, h.latitude!, h.longitude!),
        })),
        ...withoutCoords.map((h) => ({ ...h, distanceKm: undefined })),
      ]
    } else {
      // Sort by suitability score descending
      return halls.sort((a, b) => {
        const scoreA = scores.get(a.hall_id)?.score || 0
        const scoreB = scores.get(b.hall_id)?.score || 0
        return scoreB - scoreA
      })
    }
  }, [filteredHalls, nearMeEnabled, userLocation, scores])

  const handleToggleFavourite = (hallId: string) => {
    setFavouriteHallIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(hallId)) {
        newSet.delete(hallId)
      } else {
        newSet.add(hallId)
      }
      return newSet
    })
  }

  const handleShowFreeFavourites = async () => {
    setShowingFavourites(true)
    await refetchFreeFavourites()
  }

  const hasFreeBalls = hallsNow.length > 0
  const hasNextSlots = !hasFreeBalls && nextSlots.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Free Hall Finder</h1>
          <p className="text-gray-600">Find the perfect study space right now</p>
        </div>

        {/* Top controls */}
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <FreeFavouritesButton
            onClick={handleShowFreeFavourites}
            enabled={favouriteHallIds.size > 0}
            count={freeFavourites.length}
          />
          <button
            onClick={() => setPreferencePanelOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            ⚙️ My Preferences
          </button>
        </div>

        {/* Preferences panel */}
        <PreferencesPanel
          userId={userId}
          preferences={preferences}
          isOpen={preferencePanelOpen}
          onClose={() => setPreferencePanelOpen(false)}
          onSave={(prefs) => updatePreferences(prefs)}
        />

        {/* Purpose & group size selectors */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Purpose</label>
              <select
                value={selectedPurpose || ''}
                onChange={(e) => setSelectedPurpose((e.target.value as StudyPurpose) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select purpose...</option>
                <option value="individual_study">📘 Individual Study</option>
                <option value="group_study">👥 Group Study</option>
                <option value="presentation">🎤 Presentation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Size: {selectedGroupSize}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={selectedGroupSize}
                onChange={(e) => setSelectedGroupSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <HallFilters
          halls={hallsNow}
          selectedBuilding={selectedBuilding}
          selectedFloor={selectedFloor}
          minCapacity={minCapacity}
          selectedFacilities={selectedFacilities}
          quietOnly={quietOnly}
          nearMeEnabled={nearMeEnabled}
          userLocation={userLocation}
          onBuildingChange={setSelectedBuilding}
          onFloorChange={setSelectedFloor}
          onCapacityChange={setMinCapacity}
          onFacilitiesChange={setSelectedFacilities}
          onQuietChange={setQuietOnly}
          onNearMeToggle={setNearMeEnabled}
          onLocationObtained={(lat, lng) => setUserLocation({ lat, lng })}
        />

        {/* Results or empty state */}
        {loadingFreeHalls ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading free halls...</p>
          </div>
        ) : errorFreeHalls ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {errorFreeHalls}
          </div>
        ) : sortedHalls.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            {hasFreeBalls ? (
              <p className="text-gray-600">No halls match your filters. Try adjusting them.</p>
            ) : hasNextSlots ? (
              <div className="space-y-4">
                <p className="text-gray-700 font-medium">No free halls right now.</p>
                <p className="text-gray-600">Next available times:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nextSlots.slice(0, 4).map((slot) => (
                    <div key={slot.hall_id} className="bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium">{slot.hall_name}</p>
                      <p className="text-sm text-gray-600">
                        Free at {new Date(slot.next_free_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No free halls found. Check back later!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedHalls.map((hall) => (
              <HallCard
                key={hall.hall_id}
                hall={hall}
                suitabilityScore={scores.get(hall.hall_id) || null}
                usagePattern={usagePatterns.get(hall.hall_id) || null}
                isFavourite={favouriteHallIds.has(hall.hall_id)}
                onToggleFavourite={handleToggleFavourite}
                selectedPurpose={selectedPurpose}
                selectedGroupSize={selectedGroupSize}
                distanceKm={(hall as any).distanceKm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

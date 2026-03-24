'use client'

/**
 * HallFilters — Filter bar for building, floor, capacity, facilities, quiet toggle
 */

import { useMemo } from 'react'
import { FreeHallResult } from '@/types/halls'
import NearMeToggle from '@/components/location/NearMeToggle'

interface HallFiltersProps {
  halls: FreeHallResult[]
  selectedBuilding: string | null
  selectedFloor: number | null
  minCapacity: number
  selectedFacilities: string[]
  quietOnly: boolean
  nearMeEnabled: boolean
  userLocation: { lat: number; lng: number } | null
  onBuildingChange: (building: string | null) => void
  onFloorChange: (floor: number | null) => void
  onCapacityChange: (capacity: number) => void
  onFacilitiesChange: (facilities: string[]) => void
  onQuietChange: (quiet: boolean) => void
  onNearMeToggle: (enabled: boolean) => void
  onLocationObtained: (lat: number, lng: number) => void
}

export default function HallFilters({
  halls,
  selectedBuilding,
  selectedFloor,
  minCapacity,
  selectedFacilities,
  quietOnly,
  nearMeEnabled,
  onBuildingChange,
  onFloorChange,
  onCapacityChange,
  onFacilitiesChange,
  onQuietChange,
  onNearMeToggle,
  onLocationObtained,
}: HallFiltersProps) {
  // Extract unique buildings and floors
  const buildings = useMemo(() => {
    return Array.from(new Set(halls.map((h) => h.building))).sort()
  }, [halls])

  const floors = useMemo(() => {
    const floorSet = nearMeEnabled && selectedBuilding
      ? new Set(halls.filter((h) => h.building === selectedBuilding).map((h) => h.floor))
      : new Set(halls.map((h) => h.floor))
    return Array.from(floorSet).sort((a, b) => a - b)
  }, [halls, selectedBuilding, nearMeEnabled])

  const facilities = ['projector', 'wifi', 'ac', 'whiteboard', 'wheelchair_accessible', 'power_sockets']

  const handleFacilityToggle = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      onFacilitiesChange(selectedFacilities.filter((f) => f !== facility))
    } else {
      onFacilitiesChange([...selectedFacilities, facility])
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      {/* Building & Floor */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
          <select
            value={selectedBuilding || ''}
            onChange={(e) => onBuildingChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
          <select
            value={selectedFloor || ''}
            onChange={(e) => onFloorChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Capacity: {minCapacity}
        </label>
        <input
          type="range"
          min="1"
          max="300"
          value={minCapacity}
          onChange={(e) => onCapacityChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Facilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {facilities.map((fac) => (
            <label key={fac} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFacilities.includes(fac)}
                onChange={() => handleFacilityToggle(fac)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{fac}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={quietOnly}
          onChange={(e) => onQuietChange(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm font-medium text-gray-700">🔇 Quiet halls only</span>
      </label>

      {/* Near Me toggle */}
      <NearMeToggle
        enabled={nearMeEnabled}
        onToggle={onNearMeToggle}
        onLocationObtained={onLocationObtained}
      />
    </div>
  )
}

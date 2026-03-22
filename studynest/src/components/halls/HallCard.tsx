'use client'

/**
 * HallCard — Display a single free hall result with all details
 */

import { FreeHallResult, SuitabilityScore, UsagePattern } from '@/types/halls'
import ConflictBadge from './ConflictBadge'
import SuitabilityBar from './SuitabilityBar'
import UsageInsightChip from '@/components/insights/UsageInsightChip'
import FavouriteButton from '@/components/favourites/FavouriteButton'

interface HallCardProps {
  hall: FreeHallResult
  suitabilityScore: SuitabilityScore | null
  usagePattern: UsagePattern | null
  isFavourite: boolean
  onToggleFavourite: (hallId: string) => void
  selectedPurpose: string | null
  selectedGroupSize: number | null
  distanceKm?: number
}

export default function HallCard({
  hall,
  suitabilityScore,
  usagePattern,
  isFavourite,
  onToggleFavourite,
  selectedPurpose,
  selectedGroupSize,
  distanceKm,
}: HallCardProps) {
  const facilityIcons: Record<string, string> = {
    projector: '🎥',
    wifi: 'wifi: 📡',
    ac: '❄️',
    whiteboard: '📋',
    wheelchair_accessible: '♿',
    power_sockets: '🔌',
  }

  const facilities = [
    hall.projector && 'projector',
    hall.wifi && 'wifi',
    hall.ac && 'ac',
    hall.whiteboard && 'whiteboard',
    hall.wheelchair_accessible && 'wheelchair_accessible',
    hall.power_sockets && 'power_sockets',
  ].filter(Boolean)

  return (
    <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-white hover:shadow-lg transition-shadow">
      {/* Header: Name, building, floor, favourite button */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{hall.hall_name}</h3>
          <p className="text-sm text-gray-600">
            📍 {hall.building}, Floor {hall.floor}
          </p>
        </div>
        <FavouriteButton
          hallId={hall.hall_id}
          isFavourite={isFavourite}
          onToggle={onToggleFavourite}
        />
      </div>

      {/* Conflict badge if present */}
      {hall.has_conflict && (
        <ConflictBadge
          maintenanceStatus={hall.maintenance_status}
          conflictSeverity={hall.conflict_severity || 'warning'}
        />
      )}

      {/* Capacity badge */}
      <div className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
        👥 Capacity: {hall.capacity}
      </div>

      {/* Facilities */}
      {facilities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {facilities.map((fac) => (
            <span key={fac} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
              {facilityIcons[fac] || ''} {fac}
            </span>
          ))}
        </div>
      )}

      {/* Suitability score bar */}
      <SuitabilityBar
        score={suitabilityScore}
        purpose={selectedPurpose}
        groupSize={selectedGroupSize}
      />

      {/* Usage insight chip */}
      {usagePattern && <UsageInsightChip usagePattern={usagePattern} />}

      {/* Distance if available */}
      {distanceKm !== undefined && (
        <p className="text-sm text-gray-600">
          📍 ~{distanceKm < 1 ? (distanceKm * 1000).toFixed(0) + 'm' : distanceKm.toFixed(1) + 'km'} away
        </p>
      )}
    </div>
  )
}

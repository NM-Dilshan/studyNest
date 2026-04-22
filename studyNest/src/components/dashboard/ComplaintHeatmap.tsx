'use client'

// Complaint Heatmap component showing complaint intensity by location

import DashboardCard from './DashboardCard'
import { ComplaintLocation } from '@/types/dashboard'

interface ComplaintHeatmapProps {
  locations: ComplaintLocation[]
}

export default function ComplaintHeatmap({ locations }: ComplaintHeatmapProps) {
  const getIntensityColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800'
    }
  }

  const getIntensityBadgeColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'low':
        return 'bg-green-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'high':
        return 'bg-red-500 text-white'
    }
  }

  const sortedLocations = [...locations].sort((a, b) => b.complaintCount - a.complaintCount)

  return (
    <DashboardCard
      title="Complaint Heatmap"
      description="Hall/Location complaint intensity overview"
    >
      <div className="space-y-3">
        {sortedLocations.map(location => (
          <div
            key={location.hallId}
            className={`p-4 rounded-lg border-2 transition-all ${getIntensityColor(
              location.intensity
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{location.hallName}</h4>
                <p className="text-sm opacity-75 mt-1">
                  {location.hallId} • {location.unresolvedCount} unresolved
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Complaint count badge */}
                <div className={`${getIntensityBadgeColor(location.intensity)} px-3 py-2 rounded-lg`}>
                  <span className="font-bold text-sm">{location.complaintCount}</span>
                  <span className="text-xs ml-1">complaints</span>
                </div>

                {/* Health score progress */}
                <div className="w-24">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Health</span>
                    <span className="text-xs font-bold">{location.healthScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        location.healthScore >= 70
                          ? 'bg-green-500'
                          : location.healthScore >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${location.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    </DashboardCard>
  )
}

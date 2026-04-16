'use client'

import { MapPin, TrendingUp } from 'lucide-react'

interface StudyAreaSummaryProps {
  lowCrowdCount: number
  mediumCrowdCount: number
  highCrowdCount: number
  totalAreas: number
}

export function StudyAreaSummary({
  lowCrowdCount,
  mediumCrowdCount,
  highCrowdCount,
  totalAreas,
}: StudyAreaSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Study Areas</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Real-time occupancy across {totalAreas} study areas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Areas */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Areas</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{totalAreas}</div>
        </div>

        {/* Low Crowd */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Low Crowd</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {lowCrowdCount}
          </div>
          <div className="text-xs text-green-700 mt-2">
            {totalAreas > 0 ? ((lowCrowdCount / totalAreas) * 100).toFixed(0) : 0}% less busy
          </div>
        </div>

        {/* Medium Crowd */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Medium Crowd</div>
          <div className="text-3xl font-bold text-yellow-900 mt-2">
            {mediumCrowdCount}
          </div>
          <div className="text-xs text-yellow-700 mt-2">
            {totalAreas > 0 ? ((mediumCrowdCount / totalAreas) * 100).toFixed(0) : 0}% moderate
          </div>
        </div>

        {/* High Crowd */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">High Crowd</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {highCrowdCount}
          </div>
          <div className="text-xs text-red-700 mt-2">
            {totalAreas > 0 ? ((highCrowdCount / totalAreas) * 100).toFixed(0) : 0}% crowded
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      {lowCrowdCount > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900">Good availability</p>
            <p className="text-sm text-green-700 mt-1">
              {lowCrowdCount} study area{lowCrowdCount === 1 ? '' : 's'} with low occupancy available. Perfect time to find a quiet spot!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

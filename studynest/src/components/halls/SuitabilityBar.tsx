'use client'

/**
 * SuitabilityBar — Display suitability score (0-10) with breakdown tooltip
 */

import { useState } from 'react'
import { SuitabilityScore } from '@/types/halls'

interface SuitabilityBarProps {
  score: SuitabilityScore | null
  purpose: string | null
  groupSize: number | null
}

export default function SuitabilityBar({ score, purpose, groupSize }: SuitabilityBarProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!score || !purpose || !groupSize) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Suitability Score</span>
          <span className="text-xs text-gray-400">Select purpose to score</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" />
      </div>
    )
  }

  const percentage = (score.score / 10) * 100
  const getScoreColor = (s: number) => {
    if (s >= 7) return 'bg-green-500'
    if (s >= 4) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getPurposeLabel = (p: string) => {
    const labels: Record<string, string> = {
      individual_study: '📘 Good for individual study',
      group_study: '👥 Good for group study',
      presentation: '🎤 Best for presentations',
    }
    return labels[p] || p
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Suitability Score</span>
        <span className="text-sm font-bold text-gray-900">{score.score.toFixed(1)}/10</span>
      </div>

      {/* Score bar */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full ${getScoreColor(score.score)} transition-all`} style={{ width: `${percentage}%` }} />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute left-0 mt-2 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg w-48 z-10">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Capacity fit</span>
                <span className="font-semibold">{score.score_breakdown.capacity_score.toFixed(1)}/3</span>
              </div>
              <div className="flex justify-between">
                <span>Noise level</span>
                <span className="font-semibold">{score.score_breakdown.noise_score.toFixed(1)}/3</span>
              </div>
              <div className="flex justify-between">
                <span>Facilities</span>
                <span className="font-semibold">{score.score_breakdown.facility_score.toFixed(1)}/2</span>
              </div>
              <div className="flex justify-between">
                <span>Usage pattern</span>
                <span className="font-semibold">{score.score_breakdown.pattern_score.toFixed(1)}/2</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{score.score.toFixed(2)}/10</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purpose label */}
      <p className="text-xs font-medium text-gray-600">{getPurposeLabel(purpose)}</p>
    </div>
  )
}

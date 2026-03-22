'use client'

/**
 * UsageInsightChip — Show "Usually free" insight from usage patterns
 */

import { UsagePattern } from '@/types/halls'

interface UsageInsightChipProps {
  usagePattern: UsagePattern
}

export default function UsageInsightChip({ usagePattern }: UsageInsightChipProps) {
  // Only show if sample_count >= 5
  if (usagePattern.sample_count < 5) return null

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = usagePattern.day_of_week
  const hour = usagePattern.hour_of_day
  const avgOccupancy = usagePattern.avg_occupancy

  // Determine chip color and message
  let bgColor = 'bg-green-100'
  let textColor = 'text-green-900'
  let message = ''

  if (avgOccupancy < 20) {
    bgColor = 'bg-green-100'
    textColor = 'text-green-900'
    message = `Usually free ${days[dayOfWeek]} ${hour}:00–${hour + 1}:00`
  } else if (avgOccupancy > 75) {
    bgColor = 'bg-red-100'
    textColor = 'text-red-900'
    message = `High usage ${days[dayOfWeek]} ${hour}:00–${hour + 1}:00`
  } else {
    bgColor = 'bg-amber-100'
    textColor = 'text-amber-900'
    message = `Moderate usage ${days[dayOfWeek]} ${hour}:00–${hour + 1}:00`
  }

  return (
    <div className={`${bgColor} ${textColor} px-3 py-2 rounded-lg text-sm font-medium`}>
      📊 {message}
    </div>
  )
}

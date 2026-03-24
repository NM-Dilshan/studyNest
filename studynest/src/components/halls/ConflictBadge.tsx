'use client'

/**
 * ConflictBadge — Display conflict/maintenance status badge
 */

import { LectureHall } from '@/types/halls'

interface ConflictBadgeProps {
  maintenanceStatus: LectureHall['maintenance_status']
  conflictSeverity: LectureHall['conflict_severity']
}

export default function ConflictBadge({ maintenanceStatus, conflictSeverity }: ConflictBadgeProps) {
  if (maintenanceStatus === 'available') return null

  const statusConfig: Record<LectureHall['maintenance_status'], { label: string; bgColor: string; icon: string }> = {
    available: { label: 'Available', bgColor: 'bg-green-100', icon: '✓' },
    under_maintenance: { label: 'Under Maintenance', bgColor: 'bg-amber-100', icon: '⚙️' },
    reserved_exam: { label: 'Reserved for Exam', bgColor: 'bg-red-100', icon: '📝' },
    reserved_event: { label: 'Reserved for Event', bgColor: 'bg-blue-100', icon: '🎤' },
    closed: { label: 'Closed', bgColor: 'bg-slate-200', icon: '🚫' },
  }

  const config = statusConfig[maintenanceStatus]
  const isBocked = conflictSeverity === 'blocked'
  const warningIcon = isBocked ? '🚫' : '⚠️'

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor}`}
    >
      <span>{warningIcon}</span>
      <span>{isBocked ? 'Unavailable' : 'May be unavailable'}</span>
    </div>
  )
}

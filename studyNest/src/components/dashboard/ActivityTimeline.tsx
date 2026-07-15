'use client'

// Activity Timeline component showing recent actions

import DashboardCard from './DashboardCard'
import { ActivityEvent } from '@/types/dashboard'
import {
  CheckCircle2,
  Eye,
  Clock,
  Plus,
  AlertCircle,
} from 'lucide-react'

interface ActivityTimelineProps {
  events: ActivityEvent[]
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'submitted':
        return <Plus size={18} className="text-blue-600" />
      case 'viewed':
        return <Eye size={18} className="text-purple-600" />
      case 'in_progress':
        return <Clock size={18} className="text-amber-600" />
      case 'resolved':
        return <CheckCircle2 size={18} className="text-green-600" />
      default:
        return <AlertCircle size={18} className="text-gray-600" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'submitted':
        return 'bg-blue-100'
      case 'viewed':
        return 'bg-purple-100'
      case 'in_progress':
        return 'bg-amber-100'
      case 'resolved':
        return 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <DashboardCard
      title="Recent Activity"
      description="Latest actions and updates"
    >
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4 py-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`${getEventColor(event.type)} p-2.5 rounded-full`}>
                {getEventIcon(event.type)}
              </div>
              {index < events.length - 1 && (
                <div className="w-1 h-12 bg-gray-200 my-1"></div>
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-gray-900">{event.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  #{event.complaintId}
                </span>
                <span className="text-xs text-gray-600">{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

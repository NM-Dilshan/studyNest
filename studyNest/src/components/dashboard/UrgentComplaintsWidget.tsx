'use client'

// Urgent Complaints Widget

import DashboardCard from './DashboardCard'
import { UrgentComplaint } from '@/types/dashboard'
import { AlertTriangle, ChevronRight } from 'lucide-react'

interface UrgentComplaintsWidgetProps {
  complaints: UrgentComplaint[]
}

export default function UrgentComplaintsWidget({
  complaints,
}: UrgentComplaintsWidgetProps) {
  const getPriorityColor = (priority: 'high' | 'critical') => {
    return priority === 'critical'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const getPriorityBadgeColor = (priority: 'high' | 'critical') => {
    return priority === 'critical'
      ? 'bg-red-600 text-white'
      : 'bg-orange-600 text-white'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else {
      return `${diffHours}h ago`
    }
  }

  return (
    <DashboardCard
      title="Urgent Complaints"
      description={`${complaints.length} high-priority issues need attention`}
      headerAction={
        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
          <AlertTriangle size={16} className="text-red-600" />
        </div>
      }
    >
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-3xl mb-2">✓</div>
            <p className="text-gray-600">No urgent complaints at the moment</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <div
              key={complaint.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${getPriorityColor(
                complaint.priority
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${getPriorityBadgeColor(
                        complaint.priority
                      )}`}
                    >
                      {complaint.priority.toUpperCase()}
                    </span>
                    <h4 className="font-semibold">Complaint #{complaint.id}</h4>
                  </div>
                  <p className="text-sm mt-2 font-medium">{complaint.category}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {complaint.location} • {formatTime(complaint.submittedAt)}
                  </p>
                </div>
                <button className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action button */}
      {complaints.length > 0 && (
        <button className="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          View All Urgent Complaints
        </button>
      )}
    </DashboardCard>
  )
}

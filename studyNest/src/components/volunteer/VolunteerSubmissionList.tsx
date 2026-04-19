'use client'

import { useEffect, useState } from 'react'
import { Trash2, Edit2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { getTimeRemaining } from '@/lib/validations/volunteerHallUpdate'

interface Submission {
  hall_update_id: number
  volunteer_id: string
  hall_id: string
  availability_status: string
  occupancy_level?: string
  available_seats?: number
  note?: string
  created_at: string
  expires_at: string
  isExpired: boolean
  lecture_halls: {
    hall_id: string
    hall_name: string
    building?: string
    floor?: number
  }
}

interface VolunteerSubmissionListProps {
  volunteerId: string
  onEdit?: (submission: Submission) => void
  onDelete?: () => void
  refreshTrigger?: number
}

export default function VolunteerSubmissionList({
  volunteerId,
  onEdit,
  onDelete,
  refreshTrigger,
}: VolunteerSubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({})

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/volunteer/hall-updates?volunteerId=${volunteerId}&includeExpired=true`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  // Fetch submissions on mount and when refreshTrigger changes
  useEffect(() => {
    fetchSubmissions()
  }, [volunteerId, refreshTrigger])

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: Record<number, string> = {}

      submissions.forEach((submission) => {
        if (submission.expires_at && !submission.isExpired) {
          const result = getTimeRemaining(new Date(submission.expires_at))
          newTimeRemaining[submission.hall_update_id] = result.displayText
        }
      })

      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [submissions])

  // Handle delete
  const handleDelete = async (submissionId: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    setDeleting(submissionId)

    try {
      const response = await fetch(
        `/api/volunteer/hall-updates/${submissionId}?volunteerId=${volunteerId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setSubmissions(submissions.filter((s) => s.hall_update_id !== submissionId))
        if (onDelete) {
          onDelete()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete submission')
      }
    } catch (err) {
      console.error('Error deleting submission:', err)
      alert('Error deleting submission')
    } finally {
      setDeleting(null)
    }
  }

  // Get status color
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    switch (status.toLowerCase()) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'partially busy':
        return 'bg-yellow-100 text-yellow-800'
      case 'busy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get occupancy color
  const getOccupancyColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800'

    switch (level.toLowerCase()) {
      case 'empty':
        return 'bg-green-100 text-green-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'full':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Submissions</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading submissions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Submissions</h2>
        <p className="text-sm text-gray-500 mt-1">View and manage your hall updates</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No submissions yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Submit your first hall update using the form above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.hall_update_id}
              className={`border rounded-lg p-4 transition-colors ${
                submission.isExpired
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:bg-blue-50'
              }`}
            >
              {/* Top Row: Hall Name and Status Badges */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {submission.lecture_halls.hall_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {submission.lecture_halls.building && `Building: ${submission.lecture_halls.building}`}
                    {submission.lecture_halls.floor && `, Floor: ${submission.lecture_halls.floor}`}
                  </p>
                </div>

                {/* Status Badge */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                  submission.isExpired
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {submission.isExpired ? 'Expired' : 'Active'}
                </div>
              </div>

              {/* Status and Occupancy */}
              <div className="flex flex-wrap gap-2 mb-3">
                {submission.availability_status && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.availability_status)}`}>
                    {submission.availability_status}
                  </span>
                )}
                {submission.occupancy_level && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOccupancyColor(submission.occupancy_level)}`}>
                    {submission.occupancy_level}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                {submission.available_seats !== null && submission.available_seats !== undefined && (
                  <div>
                    <p className="text-gray-500 text-xs">Available Seats</p>
                    <p className="font-medium text-gray-900">{submission.available_seats}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(submission.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Expires</p>
                  <p className="font-medium text-gray-900">
                    {new Date(submission.expires_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!submission.isExpired && (
                  <div>
                    <p className="text-gray-500 text-xs">Time Left</p>
                    <p className="font-medium text-gray-900">
                      {timeRemaining[submission.hall_update_id] || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Note */}
              {submission.note && (
                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-500">Note: </span>
                    {submission.note}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!submission.isExpired && (
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => onEdit && onEdit(submission)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(submission.hall_update_id)}
                    disabled={deleting === submission.hall_update_id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === submission.hall_update_id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

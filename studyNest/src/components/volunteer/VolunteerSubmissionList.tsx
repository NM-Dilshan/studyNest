'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertCircle, Loader2 } from 'lucide-react'
import { getTimeRemaining } from '@/lib/validations/volunteerHallUpdate'
import VolunteerPanelSection from './VolunteerPanelSection'
import VolunteerEmptyState from './VolunteerEmptyState'
import VolunteerUpdateCard from './VolunteerUpdateCard'

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
  const fetchSubmissions = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/volunteer/hall-updates?volunteerId=${volunteerId}&includeExpired=true`,
        { signal }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      console.error('Error fetching submissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  // Fetch submissions on mount and when refreshTrigger changes
  useEffect(() => {
    const controller = new AbortController()
    fetchSubmissions(controller.signal)

    return () => {
      controller.abort()
    }
  }, [volunteerId, refreshTrigger])

  // Update countdown timers
  useEffect(() => {
    const hasActiveExpiries = submissions.some((submission) => submission.expires_at && !submission.isExpired)
    if (!hasActiveExpiries) {
      setTimeRemaining({})
      return
    }

    const updateCountdowns = () => {
      if (typeof document !== 'undefined' && document.hidden) return

      const newTimeRemaining: Record<number, string> = {}

      submissions.forEach((submission) => {
        if (submission.expires_at && !submission.isExpired) {
          const result = getTimeRemaining(new Date(submission.expires_at))
          newTimeRemaining[submission.hall_update_id] = result.displayText
        }
      })

      setTimeRemaining(newTimeRemaining)
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)

    const onVisible = () => {
      if (!document.hidden) {
        updateCountdowns()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
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

  if (loading) {
    return (
      <VolunteerPanelSection title="My Submissions" subtitle="View and manage your hall updates">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
          <span className="ml-2 text-slate-300">Loading submissions...</span>
        </div>
      </VolunteerPanelSection>
    )
  }

  return (
    <VolunteerPanelSection title="My Submissions" subtitle="View and manage your hall updates">

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-300/40 bg-rose-400/15 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          <p className="text-sm text-rose-100">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {submissions.length === 0 ? (
        <VolunteerEmptyState
          title="No submissions yet"
          description="Submit your first hall update using the form in this tab."
          icon={<Clock className="h-5 w-5 text-slate-400" />}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <VolunteerUpdateCard
              key={submission.hall_update_id}
              submission={submission}
              timeRemainingText={timeRemaining[submission.hall_update_id] || '-'}
              deleting={deleting === submission.hall_update_id}
              onEdit={() => onEdit && onEdit(submission)}
              onDelete={() => handleDelete(submission.hall_update_id)}
            />
          ))}
        </div>
      )}
    </VolunteerPanelSection>
  )
}

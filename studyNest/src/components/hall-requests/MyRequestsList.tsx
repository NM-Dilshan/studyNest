'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import RequestResponseCard from './RequestResponseCard'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import RequestStatusBadge from './RequestStatusBadge'
import RequestListSkeleton from './RequestListSkeleton'

interface HallUpdate {
  update_id: string
  responder_id: string
  availability_status: string
  occupancy_level: string
  available_seats?: number
  volunteer_note?: string
  confidence_level?: string
  created_at: string
  expires_at?: string
  responder: {
    user_id: string
    name: string
    volunteer_id?: string
  }
}

interface Hall {
  hall_id: string
  hall_name: string
  building?: string
  floor?: number
  capacity?: number
}

interface HallRequest {
  request_id: string
  requester_id: string
  requester_role: string
  requester_id_number: string
  hall_id: string
  request_note?: string
  request_status: string
  created_at: string
  updated_at: string
  expires_at?: string
  lecture_halls: Hall
  hall_request_updates: HallUpdate[]
}

interface MyRequestsListProps {
  userId: string
  refreshTrigger?: number
}

export default function MyRequestsList({ userId, refreshTrigger }: MyRequestsListProps) {
  const shouldReduceMotion = useReducedMotion()
  const [requests, setRequests] = useState<HallRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const skip = 0

  const fetchRequests = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(
        `/api/hall-requests/my?userId=${userId}&skip=${skip}&take=10`,
        { signal }
      )
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to load requests')
        return
      }

      setRequests(result.data || [])
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return
      }
      console.error('Error fetching requests:', fetchError)
      setError('An error occurred while loading requests')
    } finally {
      setLoading(false)
    }
  }, [userId, skip])

  useEffect(() => {
    const controller = new AbortController()
    fetchRequests(controller.signal)

    return () => {
      controller.abort()
    }
  }, [refreshTrigger, fetchRequests])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && requests.length === 0) {
    return <RequestListSkeleton />
  }

  if (error) {
    return (
      <GlassCard className="themed-panel-danger p-4" role="alert" aria-live="assertive">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </GlassCard>
    )
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="You haven't sent any hall requests. Create one using the form to receive volunteer updates."
      />
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <motion.div
          key={request.request_id}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, delay: index * 0.03, ease: 'easeOut' }}
        >
          <GlassCard className="overflow-hidden">
            <div className="themed-inset border-b border-[var(--surface-border)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">{request.lecture_halls.hall_name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-soft)]">
                    {request.lecture_halls.building}
                    {request.lecture_halls.floor && ` • Floor ${request.lecture_halls.floor}`}
                    {request.lecture_halls.capacity && ` • Capacity: ${request.lecture_halls.capacity}`}
                  </p>
                </div>
                <div className="text-right">
                  <RequestStatusBadge status={request.request_status} />
                </div>
              </div>

              {request.request_note && (
                <div className="themed-inset-strong mt-3 rounded p-3">
                  <p className="text-sm text-[var(--text-main)]">{request.request_note}</p>
                </div>
              )}

              <div className="mt-3 flex gap-4 text-xs text-[var(--text-muted)]">
                <span>Created: {formatDate(request.created_at)}</span>
                {request.request_status === 'Pending' && request.expires_at && (
                  <span>Expires: {formatDate(request.expires_at)}</span>
                )}
              </div>
            </div>

            {request.hall_request_updates.length > 0 ? (
              <div className="space-y-3 p-4">
                <h4 className="text-sm font-semibold text-[var(--text-main)]">Volunteer Responses</h4>
                {request.hall_request_updates.map((update) => (
                  <RequestResponseCard
                    key={update.update_id}
                    response={update}
                    requestId={request.request_id}
                    currentUserId={userId}
                    onFeedbackSubmitted={() => fetchRequests()}
                  />
                ))}
              </div>
            ) : request.request_status === 'Responded' ? (
              <div className="p-4">
                <p className="text-sm text-[var(--text-soft)]">Loading response information...</p>
              </div>
            ) : request.request_status === 'Pending' ? (
              <div className="p-4">
                <p className="text-sm text-[var(--text-soft)]">Waiting for volunteer responses...</p>
              </div>
            ) : null}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}

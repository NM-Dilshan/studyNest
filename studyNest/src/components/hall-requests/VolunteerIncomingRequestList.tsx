'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import VolunteerRequestResponseForm from './VolunteerRequestResponseForm'
import VolunteerEmptyState from '@/components/volunteer/VolunteerEmptyState'
import VolunteerPanelSection from '@/components/volunteer/VolunteerPanelSection'
import StatusBadge from '@/components/ui/StatusBadge'
import AppButton from '@/components/ui/AppButton'

interface HallUpdate {
  update_id: string
  availability_status: string
  occupancy_level: string
  available_seats?: number
}

interface Hall {
  hall_id: string
  hall_name: string
  building?: string
  floor?: number
  capacity?: number
}

interface Requester {
  user_id: string
  name: string
  student_id?: string
  volunteer_id?: string
  role: string
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
  lecture_halls: Hall
  requester: Requester
  hall_request_updates: HallUpdate[]
}

interface VolunteerIncomingRequestListProps {
  volunteerId: string
  refreshTrigger?: number
}

const requestCardClassName = 'themed-surface overflow-hidden rounded-xl'
const idPillClassName = 'inline-block rounded-full border border-[var(--surface-border)] bg-[var(--surface-inset)] px-2 py-0.5 text-xs font-semibold text-[var(--text-soft)]'

export default function VolunteerIncomingRequestList({
  volunteerId,
  refreshTrigger,
}: VolunteerIncomingRequestListProps) {
  const [requests, setRequests] = useState<HallRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [respondingToId, setRespondingToId] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchRequests = useCallback(async () => {
    if (inFlightRef.current) return
    if (typeof document !== 'undefined' && document.hidden) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return

    inFlightRef.current = true
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/hall-requests?status=Pending&skip=0&take=20', {
        signal: controller.signal,
      })
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
      inFlightRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) {
        fetchRequests()
      }
    }

    const onOnline = () => {
      fetchRequests()
    }

    const interval = setInterval(fetchRequests, 5000)
    fetchRequests()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      abortControllerRef.current?.abort()
    }
  }, [refreshTrigger, fetchRequests])

  const formatDate = (date: string) => {
    const now = new Date()
    const requestDate = new Date(date)
    const diffMs = now.getTime() - requestDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleResponseSubmitted = () => {
    setRespondingToId(null)
    setExpandedRequestId(null)
    fetchRequests()
  }

  if (loading && requests.length === 0) {
    return (
      <VolunteerPanelSection
        title="Incoming Requests"
        subtitle="Live queue from students and volunteers"
      >
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--button-primary-bg)]" />
        </div>
      </VolunteerPanelSection>
    )
  }

  if (error) {
    return (
      <div className="themed-panel-danger flex items-start gap-3 rounded-xl p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">{error}</p>
          <AppButton onClick={fetchRequests} size="sm" variant="danger" className="mt-2">
            Try again
          </AppButton>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <VolunteerPanelSection
        title="Incoming Requests"
        subtitle="Live queue from students and volunteers"
      >
        <VolunteerEmptyState
          title="No pending requests"
          description="Check back soon for new hall information requests."
          icon={<Clock className="h-5 w-5 text-[var(--text-muted)]" />}
        />
      </VolunteerPanelSection>
    )
  }

  return (
    <div className="space-y-3">
      <div className="themed-panel-info rounded-xl px-4 py-2">
        <p className="text-sm font-semibold">
          {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {requests.map((request) => (
        <motion.div
          key={request.request_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={requestCardClassName}
        >
          <button
            onClick={() =>
              setExpandedRequestId(
                expandedRequestId === request.request_id ? null : request.request_id
              )
            }
            className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-[var(--surface-card-muted)]"
          >
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    {request.lecture_halls.hall_name}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--text-soft)]">
                    Requested by <span className="font-semibold text-[var(--text-main)]">{request.requester.name}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={idPillClassName}>
                      {request.requester_role === 'student' ? 'Student' : 'Volunteer'} ID:{' '}
                      {request.requester_id_number}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-soft)]">
                <span className="inline-block">
                  {request.lecture_halls.building}
                  {request.lecture_halls.floor && ` • Floor ${request.lecture_halls.floor}`}
                </span>
                {request.lecture_halls.capacity && (
                  <span className="inline-block">
                    • Capacity: {request.lecture_halls.capacity}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Clock className="h-3 w-3" />
                <span>{formatDate(request.created_at)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {request.hall_request_updates.length > 0 && (
                <StatusBadge status="Responded" />
              )}
              <div className="text-[var(--text-muted)]">
                {expandedRequestId === request.request_id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </button>

          {expandedRequestId === request.request_id && (
            <div className="space-y-4 border-t border-[var(--surface-border)] bg-[var(--surface-card-muted)]/70 p-4">
              {request.request_note && (
                <div className="themed-inset rounded-lg p-3">
                  <p className="mb-1 text-xs font-semibold text-[var(--text-soft)]">Request Message:</p>
                  <p className="text-sm text-[var(--text-main)]">{request.request_note}</p>
                </div>
              )}

              {request.hall_request_updates.length > 0 && (
                <div className="themed-panel-success rounded-lg p-3">
                  <p className="mb-2 text-xs font-semibold">Previous Response:</p>
                  {request.hall_request_updates.map((update) => (
                    <div key={update.update_id} className="text-xs">
                      <p className="text-[var(--text-soft)]">
                        <span className="font-semibold">{update.availability_status}</span> • {update.occupancy_level}
                      </p>
                      {update.available_seats !== null && (
                        <p className="mt-1 text-[var(--text-soft)]">
                          Available Seats: <span className="font-semibold">{update.available_seats}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {respondingToId === request.request_id ? (
                <VolunteerRequestResponseForm
                  requestId={request.request_id}
                  hallCapacity={request.lecture_halls.capacity}
                  volunteerId={volunteerId}
                  onCancel={() => setRespondingToId(null)}
                  onSuccess={handleResponseSubmitted}
                />
              ) : (
                <AppButton
                  onClick={() => setRespondingToId(request.request_id)}
                  fullWidth
                  variant="primary"
                >
                  Respond with Hall Information
                </AppButton>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

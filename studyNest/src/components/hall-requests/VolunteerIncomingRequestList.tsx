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

const requestCardClassName = 'overflow-hidden rounded-xl border border-white/15 bg-slate-950/55'
const idPillClassName = 'inline-block rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-100'

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
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      console.error('Error fetching requests:', err)
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

    const interval = setInterval(fetchRequests, 5000) // Refresh every 5 seconds
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
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
        </div>
      </VolunteerPanelSection>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-300/40 bg-rose-400/15 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
        <div>
          <p className="text-sm font-semibold text-rose-100">{error}</p>
          <AppButton
            onClick={fetchRequests}
            size="sm"
            variant="danger"
            className="mt-2"
          >
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
          icon={<Clock className="h-5 w-5 text-slate-400" />}
        />
      </VolunteerPanelSection>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with count */}
      <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2">
        <p className="text-sm font-semibold text-cyan-100">
          {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Request List */}
      {requests.map((request) => (
        <motion.div
          key={request.request_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={requestCardClassName}
        >
          {/* Request Header (Click to expand) */}
          <button
            onClick={() =>
              setExpandedRequestId(
                expandedRequestId === request.request_id ? null : request.request_id
              )
            }
            className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-white/5"
          >
            {/* Left Side - Request Info */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">
                    {request.lecture_halls.hall_name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-300">
                    Requested by <span className="font-semibold text-white">{request.requester.name}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={idPillClassName}>
                      {request.requester_role === 'student' ? 'Student' : 'Volunteer'} ID:{' '}
                      {request.requester_id_number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hall Details */}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
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

              {/* Time */}
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{formatDate(request.created_at)}</span>
              </div>
            </div>

            {/* Right Side - Expand Button & Responded Indicator */}
            <div className="flex flex-col items-end gap-2">
              {request.hall_request_updates.length > 0 && (
                <StatusBadge status="Responded" />
              )}
              <div className="text-slate-400">
                {expandedRequestId === request.request_id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </button>

          {/* Expanded Content */}
          {expandedRequestId === request.request_id && (
            <div className="space-y-4 border-t border-white/10 bg-slate-900/45 p-4">
              {/* Request Note */}
              {request.request_note && (
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-300">Request Message:</p>
                  <p className="text-sm text-slate-100">{request.request_note}</p>
                </div>
              )}

              {/* Previous Responses (if any) */}
              {request.hall_request_updates.length > 0 && (
                <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3">
                  <p className="mb-2 text-xs font-semibold text-emerald-100">
                    Previous Response:
                  </p>
                  {request.hall_request_updates.map((update) => (
                    <div key={update.update_id} className="text-xs">
                      <p className="text-slate-200">
                        <span className="font-semibold">{update.availability_status}</span> •{' '}
                        {update.occupancy_level}
                      </p>
                      {update.available_seats !== null && (
                        <p className="mt-1 text-slate-300">
                          Available Seats: <span className="font-semibold">{update.available_seats}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Response Form */}
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

'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import VolunteerRequestResponseForm from './VolunteerRequestResponseForm'

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

export default function VolunteerIncomingRequestList({
  volunteerId,
  refreshTrigger,
}: VolunteerIncomingRequestListProps) {
  const [requests, setRequests] = useState<HallRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [respondingToId, setRespondingToId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/hall-requests?status=Pending&skip=0&take=20')
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to load requests')
        return
      }

      setRequests(result.data || [])
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError('An error occurred while loading requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchRequests, 5000) // Refresh every 5 seconds
    fetchRequests()
    return () => clearInterval(interval)
  }, [refreshTrigger])

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
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#2E6F95]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchRequests}
            className="text-xs text-red-600 hover:text-red-800 mt-2 underline font-semibold"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-gray-600 font-semibold">No pending requests</p>
        <p className="text-sm text-gray-500 mt-1">
          Check back soon for new hall information requests!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with count */}
      <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900">
          {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Request List */}
      {requests.map((request) => (
        <div
          key={request.request_id}
          className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
        >
          {/* Request Header (Click to expand) */}
          <button
            onClick={() =>
              setExpandedRequestId(
                expandedRequestId === request.request_id ? null : request.request_id
              )
            }
            className="w-full text-left p-4 hover:bg-slate-50 transition flex items-start justify-between gap-4"
          >
            {/* Left Side - Request Info */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {request.lecture_halls.hall_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Requested by <span className="font-semibold">{request.requester.name}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      {request.requester_role === 'student' ? 'Student' : 'Volunteer'} ID:{' '}
                      {request.requester_id_number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hall Details */}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
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
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(request.created_at)}</span>
              </div>
            </div>

            {/* Right Side - Expand Button & Responded Indicator */}
            <div className="flex flex-col items-end gap-2">
              {request.hall_request_updates.length > 0 && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                  Already Responded
                </span>
              )}
              <div className="text-gray-400">
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
            <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
              {/* Request Note */}
              {request.request_note && (
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Request Message:</p>
                  <p className="text-sm text-gray-800">{request.request_note}</p>
                </div>
              )}

              {/* Previous Responses (if any) */}
              {request.hall_request_updates.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 font-semibold mb-2">
                    Previous Response:
                  </p>
                  {request.hall_request_updates.map((update) => (
                    <div key={update.update_id} className="text-xs">
                      <p className="text-gray-700">
                        <span className="font-semibold">{update.availability_status}</span> •{' '}
                        {update.occupancy_level}
                      </p>
                      {update.available_seats !== null && (
                        <p className="text-gray-600 mt-1">
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
                <button
                  onClick={() => setRespondingToId(request.request_id)}
                  className="w-full px-4 py-2 bg-[#2E6F95] text-white font-semibold rounded-lg hover:bg-[#255B79] transition"
                >
                  Respond with Hall Information
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

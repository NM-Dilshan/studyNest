'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Clock, CheckCircle2, X } from 'lucide-react'
import RequestResponseCard from './RequestResponseCard'

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
  const [requests, setRequests] = useState<HallRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skip, setSkip] = useState(0)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(
        `/api/hall-requests/my?userId=${userId}&skip=${skip}&take=10`
      )
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
    fetchRequests()
  }, [userId, skip, refreshTrigger])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case 'Responded':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Responded
          </span>
        )
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <X className="h-3 w-3" />
            Expired
          </span>
        )
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            <X className="h-3 w-3" />
            Closed
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-gray-600">You haven't sent any requests yet.</p>
        <p className="text-sm text-gray-500 mt-1">Create a new request above to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.request_id} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {/* Request Header */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{request.lecture_halls.hall_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {request.lecture_halls.building}
                  {request.lecture_halls.floor && ` • Floor ${request.lecture_halls.floor}`}
                  {request.lecture_halls.capacity && ` • Capacity: ${request.lecture_halls.capacity}`}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(request.request_status)}
              </div>
            </div>

            {/* Request Note */}
            {request.request_note && (
              <div className="mt-3 p-3 bg-white rounded border border-slate-200 rounded">
                <p className="text-sm text-gray-700">{request.request_note}</p>
              </div>
            )}

            {/* Request Meta */}
            <div className="flex gap-4 text-xs text-gray-500 mt-3">
              <span>Created: {formatDate(request.created_at)}</span>
              {request.request_status === 'Pending' && request.expires_at && (
                <span>Expires: {formatDate(request.expires_at)}</span>
              )}
            </div>
          </div>

          {/* Responses Section */}
          {request.hall_request_updates.length > 0 ? (
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Volunteer Responses:</h4>
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
              <p className="text-sm text-gray-600">Loading response information...</p>
            </div>
          ) : request.request_status === 'Pending' ? (
            <div className="p-4">
              <p className="text-sm text-gray-600">Waiting for volunteer responses...</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

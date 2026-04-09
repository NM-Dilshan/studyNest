'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { ResponseFeedbackForm } from '@/components/feedback/ResponseFeedbackForm'

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

interface RequestResponseCardProps {
  response: HallUpdate
  requestId?: string
  currentUserId?: string
  onFeedbackSubmitted?: () => void
}

export default function RequestResponseCard({ 
  response, 
  requestId, 
  currentUserId,
  onFeedbackSubmitted 
}: RequestResponseCardProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired =
    response.expires_at && new Date(response.expires_at) < new Date()

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Free':
        return 'bg-green-100 text-green-800'
      case 'Partially Busy':
        return 'bg-yellow-100 text-yellow-800'
      case 'Busy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOccupancyColor = (level: string) => {
    switch (level) {
      case 'Empty':
        return 'bg-blue-100 text-blue-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Full':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (level?: string) => {
    switch (level) {
      case 'Low':
        return 'text-orange-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'High':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`rounded-lg border p-4 ${isExpired ? 'border-gray-200 bg-gray-50' : 'border-slate-200 bg-slate-50'}`}>
      {/* Expired Badge */}
      {isExpired && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-100 rounded">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <p className="text-xs text-gray-600 font-semibold">This response has expired</p>
        </div>
      )}

      {/* Primary Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1"></div>
        <div className="flex gap-2 flex-wrap justify-end">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getAvailabilityColor(response.availability_status)}`}>
            {response.availability_status}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getOccupancyColor(response.occupancy_level)}`}>
            {response.occupancy_level}
          </span>
        </div>
      </div>

      {/* Hall Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {response.available_seats !== null && response.available_seats !== undefined && (
          <div className="bg-white rounded p-2">
            <p className="text-xs text-gray-600">Available Seats</p>
            <p className="text-sm font-bold text-gray-900">{response.available_seats}</p>
          </div>
        )}
        {response.confidence_level && (
          <div className="bg-white rounded p-2">
            <p className="text-xs text-gray-600">Confidence</p>
            <p className={`text-sm font-bold ${getConfidenceColor(response.confidence_level)}`}>
              {response.confidence_level}
            </p>
          </div>
        )}
      </div>

      {/* Volunteer Note */}
      {response.volunteer_note && (
        <div className="mb-3 p-2 bg-white rounded border border-slate-200">
          <p className="text-xs text-gray-600 font-semibold mb-1">Volunteer's Note:</p>
          <p className="text-sm text-gray-800">{response.volunteer_note}</p>
        </div>
      )}

      {/* Timestamp and Expiry */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-slate-200">
        <span>Responded: {formatDate(response.created_at)}</span>
        {response.expires_at && !isExpired && (
          <span>Valid until: {formatDate(response.expires_at)}</span>
        )}
      </div>

      {/* Feedback Form */}
      {currentUserId && requestId && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          {!showFeedbackForm ? (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded transition-all duration-200 hover:shadow-md"
            >
              ⭐ Rate This Response
            </button>
          ) : (
            <ResponseFeedbackForm
              responseId={response.update_id}
              requestId={requestId}
              userId={currentUserId}
              volunteerId={response.responder_id}
              volunteerName={response.responder.name}
              onSuccess={() => {
                setShowFeedbackForm(false)
                onFeedbackSubmitted?.()
              }}
              onCancel={() => setShowFeedbackForm(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

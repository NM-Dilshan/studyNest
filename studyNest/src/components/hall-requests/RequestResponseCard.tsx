'use client'

import { AlertCircle, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { ResponseFeedbackForm } from '@/components/feedback/ResponseFeedbackForm'
import StatusBadge from '@/components/ui/StatusBadge'
import AppButton from '@/components/ui/AppButton'

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

  const getConfidenceColor = (level?: string) => {
    switch (level) {
      case 'Low':
        return 'text-amber-200'
      case 'Medium':
        return 'text-yellow-200'
      case 'High':
        return 'text-emerald-200'
      default:
        return 'text-slate-300'
    }
  }

  return (
    <div className={`rounded-xl border p-4 ${isExpired ? 'border-slate-300/25 bg-slate-800/35' : 'border-white/15 bg-white/5'}`}>
      {isExpired && (
        <div className="mb-3 flex items-center gap-2 rounded border border-slate-300/25 bg-slate-700/35 p-2">
          <AlertCircle className="h-4 w-4 text-slate-200" />
          <p className="text-xs font-semibold text-slate-200">This response has expired</p>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1"></div>
        <div className="flex gap-2 flex-wrap justify-end">
          <StatusBadge status={response.availability_status} className="normal-case tracking-normal" />
          <StatusBadge status={response.occupancy_level} className="normal-case tracking-normal" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {response.available_seats !== null && response.available_seats !== undefined && (
          <div className="rounded border border-white/10 bg-slate-900/60 p-2">
            <p className="text-xs text-slate-400">Available Seats</p>
            <p className="text-sm font-bold text-white">{response.available_seats}</p>
          </div>
        )}
        {response.confidence_level && (
          <div className="rounded border border-white/10 bg-slate-900/60 p-2">
            <p className="text-xs text-slate-400">Confidence</p>
            <p className={`text-sm font-bold ${getConfidenceColor(response.confidence_level)}`}>
              {response.confidence_level}
            </p>
          </div>
        )}
      </div>

      {response.volunteer_note && (
        <div className="mb-3 rounded border border-white/10 bg-slate-900/60 p-2">
          <p className="mb-1 text-xs font-semibold text-slate-300">Volunteer Note:</p>
          <p className="text-sm text-slate-100">{response.volunteer_note}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs text-slate-400">
        <span>Responded: {formatDate(response.created_at)}</span>
        {response.expires_at && !isExpired && (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            Valid until: {formatDate(response.expires_at)}
          </span>
        )}
      </div>

      {currentUserId && requestId && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {!showFeedbackForm ? (
            <AppButton
              onClick={() => setShowFeedbackForm(true)}
              fullWidth
              variant="primary"
              className="text-slate-950"
            >
              ⭐ Rate This Response
            </AppButton>
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

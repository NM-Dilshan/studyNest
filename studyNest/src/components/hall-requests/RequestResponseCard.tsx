'use client'

import { AlertCircle, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { ResponseFeedbackForm } from '@/components/feedback/ResponseFeedbackForm'
import StatusBadge from '@/components/ui/StatusBadge'
import AppButton from '@/components/ui/AppButton'
import ResponseReportButton from './ResponseReportButton'
import type { HallRequestReportData } from '@/lib/hall-requests/report'

interface HallUpdate {
  update_id: string
  responder_id: string
  availability_status: string
  occupancy_level: string
  available_seats?: number | null
  volunteer_note?: string | null
  confidence_level?: string | null
  created_at: string
  expires_at?: string | null
  responder?: {
    user_id: string
    name: string
    volunteer_id?: string | null
  } | null
}

interface RequestResponseCardProps {
  request: HallRequestReportData
  response: HallUpdate
  requestId?: string
  currentUserId?: string
  onFeedbackSubmitted?: () => void
}

export default function RequestResponseCard({
  request,
  response,
  requestId,
  currentUserId,
  onFeedbackSubmitted,
}: RequestResponseCardProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const responderName = response.responder?.name || response.responder_id

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
        return 'text-amber-600'
      case 'Medium':
        return 'text-amber-500'
      case 'High':
        return 'text-emerald-600'
      default:
        return 'text-[var(--text-soft)]'
    }
  }

  return (
    <div className={`rounded-xl border p-4 ${isExpired ? 'themed-inset' : 'themed-inset-strong'}`}>
      {isExpired && (
        <div className="mb-3 flex items-center gap-2 rounded border border-[var(--surface-border)] bg-[var(--surface-card-muted)] p-2">
          <AlertCircle className="h-4 w-4 text-[var(--text-soft)]" />
          <p className="text-xs font-semibold text-[var(--text-soft)]">This response has expired</p>
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1"></div>
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge status={response.availability_status} className="normal-case tracking-normal" />
          <StatusBadge status={response.occupancy_level} className="normal-case tracking-normal" />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        {response.available_seats !== null && response.available_seats !== undefined && (
          <div className="themed-inset rounded p-2">
            <p className="text-xs text-[var(--text-muted)]">Available Seats</p>
            <p className="text-sm font-bold text-[var(--text-main)]">{response.available_seats}</p>
          </div>
        )}
        {response.confidence_level && (
          <div className="themed-inset rounded p-2">
            <p className="text-xs text-[var(--text-muted)]">Confidence</p>
            <p className={`text-sm font-bold ${getConfidenceColor(response.confidence_level)}`}>
              {response.confidence_level}
            </p>
          </div>
        )}
      </div>

      {response.volunteer_note && (
        <div className="themed-inset mb-3 rounded p-2">
          <p className="mb-1 text-xs font-semibold text-[var(--text-soft)]">Volunteer Note:</p>
          <p className="text-sm text-[var(--text-main)]">{response.volunteer_note}</p>
        </div>
      )}

      <div className="border-t border-[var(--surface-border)] pt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>Responded: {formatDate(response.created_at)}</span>
            {response.expires_at && !isExpired && (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                Valid until: {formatDate(response.expires_at)}
              </span>
            )}
          </div>

          <ResponseReportButton
            request={request}
            responseId={response.update_id}
            label="Download Response PDF"
            loadingLabel="Generating Response PDF..."
            ariaLabel={`Download PDF for response from ${responderName}`}
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {currentUserId && requestId && (
        <div className="mt-4 border-t border-[var(--surface-border)] pt-4">
          {!showFeedbackForm ? (
            <AppButton
              onClick={() => setShowFeedbackForm(true)}
              fullWidth
              variant="primary"
            >
              Rate This Response
            </AppButton>
          ) : (
            <ResponseFeedbackForm
              responseId={response.update_id}
              requestId={requestId}
              userId={currentUserId}
              volunteerId={response.responder_id}
              volunteerName={responderName}
              onSuccess={() => {
                setShowFeedbackForm(false)
                onFeedbackSubmitted?.()
              }}
              onClose={() => setShowFeedbackForm(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

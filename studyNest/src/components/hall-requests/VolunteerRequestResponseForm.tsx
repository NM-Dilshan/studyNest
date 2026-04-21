'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import VolunteerStatusSelector from '@/components/volunteer/VolunteerStatusSelector'
import AppButton from '@/components/ui/AppButton'

interface VolunteerRequestResponseFormProps {
  requestId: string
  hallCapacity?: number
  volunteerId: string
  onCancel: () => void
  onSuccess: () => void
}

export default function VolunteerRequestResponseForm({
  requestId,
  hallCapacity,
  volunteerId,
  onCancel,
  onSuccess,
}: VolunteerRequestResponseFormProps) {
  const shouldReduceMotion = useReducedMotion()
  const [availabilityStatus, setAvailabilityStatus] = useState('')
  const [occupancyLevel, setOccupancyLevel] = useState('')
  const [availableSeats, setAvailableSeats] = useState('')
  const [note, setNote] = useState('')
  const [confidenceLevel, setConfidenceLevel] = useState('Medium')
  const [expiryMinutes, setExpiryMinutes] = useState('60')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!availabilityStatus) {
      setError('Please select availability status')
      return
    }
    if (!occupancyLevel) {
      setError('Please select occupancy level')
      return
    }

    const seats = availableSeats ? parseInt(availableSeats) : null
    if (seats !== null && seats < 0) {
      setError('Available seats cannot be negative')
      return
    }
    if (hallCapacity && seats !== null && seats > hallCapacity) {
      setError(`Available seats cannot exceed hall capacity (${hallCapacity})`)
      return
    }
    if (occupancyLevel === 'Full' && seats !== 0 && seats !== null) {
      setError('If hall is Full, available seats must be 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/hall-requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responderId: volunteerId,
          availabilityStatus,
          occupancyLevel,
          availableSeats: seats,
          volunteerNote: note || null,
          confidenceLevel,
          expiryMinutes: parseInt(expiryMinutes),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to submit response')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (submitError) {
      console.error('Error submitting response:', submitError)
      setError('An error occurred while submitting your response')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="themed-panel-success flex items-center gap-3 rounded-xl p-4" role="status" aria-live="polite">
        <Check className="h-5 w-5" />
        <div>
          <p className="text-sm font-semibold">Response submitted!</p>
          <p className="mt-1 text-xs">The requester will see your update shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.form
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
      onSubmit={handleSubmit}
      className="themed-surface space-y-4 rounded-xl p-4"
    >
      <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">Submit Hall Information</h4>

      {error && (
        <div className="themed-panel-danger flex items-start gap-3 rounded-lg p-3" role="alert" aria-live="assertive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      <VolunteerStatusSelector
        label="Availability Status"
        required
        value={availabilityStatus}
        onChange={setAvailabilityStatus}
        options={[
          { label: 'Free', value: 'Free', colorClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' },
          { label: 'Partially Busy', value: 'Partially Busy', colorClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600' },
          { label: 'Busy', value: 'Busy', colorClass: 'border-rose-500/25 bg-rose-500/10 text-rose-600' },
        ]}
      />

      <VolunteerStatusSelector
        label="Occupancy Level"
        required
        value={occupancyLevel}
        onChange={setOccupancyLevel}
        options={[
          { label: 'Empty', value: 'Empty', colorClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' },
          { label: 'Low', value: 'Low', colorClass: 'border-sky-500/25 bg-sky-500/10 text-sky-600' },
          { label: 'Medium', value: 'Medium', colorClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600' },
          { label: 'High', value: 'High', colorClass: 'border-orange-500/25 bg-orange-500/10 text-orange-600' },
          { label: 'Full', value: 'Full', colorClass: 'border-rose-500/25 bg-rose-500/10 text-rose-600' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="volunteerAvailableSeats" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Available Seats {hallCapacity && `(Max: ${hallCapacity})`}
          </label>
          <input
            id="volunteerAvailableSeats"
            type="number"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
            placeholder="e.g., 42"
            min="0"
            className="themed-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>

        <div>
          <label htmlFor="volunteerConfidenceLevel" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Confidence Level
          </label>
          <select
            id="volunteerConfidenceLevel"
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(e.target.value)}
            className="themed-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <p className="mt-1 text-xs text-[var(--text-muted)]">How confident are you about this information?</p>
        </div>
      </div>

      <div>
        <label htmlFor="volunteerExpiryMinutes" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Valid For (minutes)
        </label>
        <select
          id="volunteerExpiryMinutes"
          value={expiryMinutes}
          onChange={(e) => setExpiryMinutes(e.target.value)}
          className="themed-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
          <option value="180">3 hours</option>
        </select>
      </div>

      <div>
        <label htmlFor="volunteerAdditionalNote" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Additional Note (Optional)
        </label>
        <textarea
          id="volunteerAdditionalNote"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          placeholder="E.g., Class ending soon, will free up..."
          className="themed-input w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          rows={2}
          maxLength={300}
        />
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{note.length}/300 characters</p>
      </div>

      <div className="flex gap-2 pt-2">
        <AppButton type="submit" disabled={loading} className="flex-1" variant="primary">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Response'}
        </AppButton>
        <AppButton type="button" onClick={onCancel} disabled={loading} className="flex-1" variant="secondary">
          Cancel
        </AppButton>
      </div>
    </motion.form>
  )
}

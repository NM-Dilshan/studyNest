'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, Check } from 'lucide-react'

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

    // Validation
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
      const response = await fetch(
        `/api/hall-requests/${requestId}/respond`,
        {
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
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to submit response')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error('Error submitting response:', err)
      setError('An error occurred while submitting your response')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800">Response submitted!</p>
          <p className="text-xs text-green-700 mt-1">The requester will see your update shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
      <h4 className="text-sm font-bold text-gray-900">Submit Hall Information</h4>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Availability Status */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Availability Status <span className="text-red-500">*</span>
        </label>
        <select
          value={availabilityStatus}
          onChange={(e) => setAvailabilityStatus(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
        >
          <option value="">-- Select --</option>
          <option value="Free">Free</option>
          <option value="Partially Busy">Partially Busy</option>
          <option value="Busy">Busy</option>
        </select>
      </div>

      {/* Occupancy Level */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Occupancy Level <span className="text-red-500">*</span>
        </label>
        <select
          value={occupancyLevel}
          onChange={(e) => setOccupancyLevel(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
        >
          <option value="">-- Select --</option>
          <option value="Empty">Empty</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Full">Full</option>
        </select>
      </div>

      {/* Available Seats */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Available Seats {hallCapacity && `(Max: ${hallCapacity})`}
        </label>
        <input
          type="number"
          value={availableSeats}
          onChange={(e) => setAvailableSeats(e.target.value)}
          placeholder="e.g., 42"
          min="0"
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
        />
      </div>

      {/* Confidence Level */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Confidence Level
        </label>
        <select
          value={confidenceLevel}
          onChange={(e) => setConfidenceLevel(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">How confident are you about this information?</p>
      </div>

      {/* Valid For */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Valid For (minutes)
        </label>
        <select
          value={expiryMinutes}
          onChange={(e) => setExpiryMinutes(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
        >
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
          <option value="180">3 hours</option>
        </select>
      </div>

      {/* Volunteer Note */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Additional Note (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          placeholder="E.g., Class ending soon, will free up..."
          className="w-full px-3 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
          rows={2}
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-0.5">{note.length}/300 characters</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#2E6F95] text-white font-semibold rounded-lg hover:bg-[#255B79] disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Response'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

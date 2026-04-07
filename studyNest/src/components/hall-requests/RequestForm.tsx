'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Check, X } from 'lucide-react'

interface Hall {
  hall_id: string
  hall_name: string
  building?: string
  floor?: number
  capacity?: number
}

interface RequestFormProps {
  userId: string
  userRole: 'student' | 'volunteer'
  userIdNumber: string
  userName: string
  onRequestCreated?: () => void
}

export default function RequestForm({
  userId,
  userRole,
  userIdNumber,
  userName,
  onRequestCreated,
}: RequestFormProps) {
  const [halls, setHalls] = useState<Hall[]>([])
  const [selectedHallId, setSelectedHallId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hallsLoading, setHallsLoading] = useState(true)

  // Fetch halls on mount
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setHallsLoading(true)
        const response = await fetch('/api/lecture-halls')
        const result = await response.json()
        if (result.success) {
          setHalls(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching halls:', err)
        setError('Failed to load lecture halls')
      } finally {
        setHallsLoading(false)
      }
    }

    fetchHalls()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!selectedHallId) {
      setError('Please select a lecture hall')
      return
    }

    if (note.length > 300) {
      setError('Note must be 300 characters or less')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/hall-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hallId: selectedHallId,
          note: note || null,
          userId,
          userRole,
          userIdNumber,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create request')
        return
      }

      setSuccess(true)
      setSelectedHallId('')
      setNote('')

      setTimeout(() => {
        setSuccess(false)
      }, 3000)

      onRequestCreated?.()
    } catch (err) {
      console.error('Error submitting request:', err)
      setError('An error occurred while submitting your request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Request Hall Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Request submitted successfully!</p>
          </div>
        )}

        {/* Hall Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lecture Hall <span className="text-red-500">*</span>
          </label>
          {hallsLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ) : (
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]"
            >
              <option value="">-- Select a hall --</option>
              {halls.map((hall) => (
                <option key={hall.hall_id} value={hall.hall_id}>
                  {hall.hall_name}
                  {hall.building && ` (${hall.building})`}
                  {hall.capacity && ` - Capacity: ${hall.capacity}`}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">Select the lecture hall you want information about</p>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder="E.g., Need to know if there are seats available now"
            className="w-full px-4 py-2 bg-white text-gray-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95] resize-none"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">
            {note.length}/300 characters
          </p>
        </div>

        {/* User Info Section */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-gray-600">
            This request will be sent as:
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{userName}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {userRole === 'student' ? 'Student' : 'Volunteer'} ID: {userIdNumber}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || hallsLoading || !selectedHallId}
          className="w-full px-4 py-2 bg-[#2E6F95] text-white font-semibold rounded-lg hover:bg-[#255B79] disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

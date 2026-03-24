'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Building2, MapPin } from 'lucide-react'

interface HistoryItem {
  id: number
  type: 'hall' | 'area'
  name: string
  status: string
  time: Date
  points: number
  confidence: string
}

interface Location {
  id: string
  name: string
}

interface SubmitFormProps {
  volunteerId: string
  onSubmitSuccess: (newItem: HistoryItem) => void
}

const getStatusColor = (status: string | null | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  switch (status.toLowerCase()) {
    case 'free':
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'full':
    case 'occupied':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function VolunteerSubmitForm({ volunteerId, onSubmitSuccess }: SubmitFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [halls, setHalls] = useState<Location[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [formData, setFormData] = useState({
    location: '',
    status: '',
    confidence: '',
  })

  // Fetch available lecture halls on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/volunteer/locations')
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched locations:', data)
          setHalls(data.halls || [])
          if (!data.halls || data.halls.length === 0) {
            console.warn('No lecture halls available in database')
          }
        } else {
          console.error('Failed to fetch locations:', response.status)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLocationsLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    // Validate all fields
    if (!formData.location || !formData.status || !formData.confidence) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields before submitting.',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/volunteer/submit-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId,
          spaceType: 'lecture-hall',
          locationId: formData.location,
          status: formData.status,
          confidence: formData.confidence,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to submit update',
        })
        return
      }

      // Success
      setMessage({
        type: 'success',
        text: data.message || 'Update submitted successfully!',
      })

      // Reset form
      setFormData({
        location: '',
        status: '',
        confidence: '',
      })

      // Notify parent to refresh history
      if (data.data) {
        onSubmitSuccess({
          ...data.data,
          time: new Date(data.data.time),
        })
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900">Submit Space Update</h2>
      <p className="text-sm text-gray-500 mt-1">Report the current status of a lecture hall</p>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lecture Hall <span className="text-red-500">*</span>
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={locationsLoading}
          >
            <option value="">
              {locationsLoading
                ? 'Loading lecture halls...'
                : halls.length === 0
                ? 'No halls available'
                : 'Select a lecture hall'}
            </option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['free', 'occupied'].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={formData.status === s}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {['low', 'medium', 'high'].map((l) => (
              <label key={l} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="confidence"
                  value={l}
                  checked={formData.confidence === l}
                  onChange={(e) =>
                    setFormData({ ...formData, confidence: e.target.value })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            High confidence = +5 points, Medium = +3 points, Low = +1 point
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || locationsLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Update'}
        </button>
      </form>
    </div>
  )
}

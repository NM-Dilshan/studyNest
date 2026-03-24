'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

interface LectureHall {
  hall_id: string
  hall_name: string
  building?: string
  floor?: number
  capacity?: number
}

interface VolunteerHallFormProps {
  volunteerId: string
  onSubmitSuccess?: (submission: any) => void
  editingSubmission?: any
  onEditCancel?: () => void
}

export default function VolunteerHallForm({
  volunteerId,
  onSubmitSuccess,
  editingSubmission,
  onEditCancel,
}: VolunteerHallFormProps) {
  const [filteredHalls, setFilteredHalls] = useState<LectureHall[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const [formData, setFormData] = useState({
    hallId: editingSubmission?.hall_id || '',
    hallName: '',
    availabilityStatus: editingSubmission?.availability_status || 'Free',
    occupancyLevel: editingSubmission?.occupancy_level || 'Empty',
    availableSeats: editingSubmission?.available_seats?.toString() || '',
    note: editingSubmission?.note || '',
    expiryDuration: '1h' as '30m' | '1h' | '2h' | 'custom',
    expiryTime: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Search lecture halls using the search API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHalls([])
      setHighlightedIndex(-1)
      return
    }

    // Debounce search requests
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(
          `/api/lecture-halls/search?q=${encodeURIComponent(searchQuery)}&limit=15`
        )
        
        if (response.ok) {
          const data = await response.json()
          setFilteredHalls(data)
          setHighlightedIndex(-1)
        } else {
          console.error('Failed to search halls:', response.status)
          setFilteredHalls([])
        }
      } catch (error) {
        console.error('Error searching halls:', error)
        setFilteredHalls([])
      } finally {
        setSearchLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update form when editing
  useEffect(() => {
    if (editingSubmission) {
      setFormData({
        hallId: editingSubmission.hall_id || '',
        hallName: editingSubmission.lecture_halls?.hall_name || '',
        availabilityStatus: editingSubmission.availability_status || 'Free',
        occupancyLevel: editingSubmission.occupancy_level || 'Empty',
        availableSeats: editingSubmission.available_seats?.toString() || '',
        note: editingSubmission.note || '',
        expiryDuration: '1h',
        expiryTime: '',
      })
      setSearchQuery(editingSubmission.lecture_halls?.hall_name || '')
    }
  }, [editingSubmission])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchInput = document.getElementById('hallSearch')
      if (searchInput && !searchInput.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setHighlightedIndex(-1)
    // Show dropdown only if there's a search query
    if (value.trim()) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
    // Clear hallId error if user is searching
    if (errors.hallId) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.hallId
        return newErrors
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredHalls.length === 0) {
      if (e.key === 'Enter' && formData.hallId) {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredHalls.length - 1 ? prev + 1 : prev
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredHalls.length) {
          handleHallSelect(filteredHalls[highlightedIndex])
        }
        break

      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break

      default:
        break
    }
  }

  const handleHallSelect = (hall: LectureHall) => {
    setFormData((prev) => ({
      ...prev,
      hallId: hall.hall_id,
      hallName: hall.hall_name,
    }))
    setSearchQuery(hall.hall_name)
    setShowDropdown(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.hallId) {
      newErrors.hallId = 'Lecture hall is required'
    }

    if (!formData.availabilityStatus) {
      newErrors.availabilityStatus = 'Availability status is required'
    }

    if (!formData.occupancyLevel) {
      newErrors.occupancyLevel = 'Occupancy level is required'
    }

    if (formData.availableSeats) {
      const seats = parseInt(formData.availableSeats, 10)
      if (isNaN(seats) || seats < 0) {
        newErrors.availableSeats = 'Available seats must be a non-negative number'
      }

      // Soft validation: if Full, seats should be 0
      if (formData.occupancyLevel === 'Full' && seats > 0) {
        newErrors.availableSeats = 'If occupancy is Full, available seats should be 0'
      }
    }

    if (!formData.expiryDuration) {
      newErrors.expiryDuration = 'Expiry duration is required'
    }

    if (formData.expiryDuration === 'custom' && !formData.expiryTime) {
      newErrors.expiryTime = 'Custom expiry time is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const url = editingSubmission
        ? `/api/volunteer/hall-updates/${editingSubmission.hall_update_id}`
        : '/api/volunteer/hall-updates'

      const method = editingSubmission ? 'PUT' : 'POST'

      const payload = {
        volunteerId,
        hallId: formData.hallId,
        availabilityStatus: formData.availabilityStatus,
        occupancyLevel: formData.occupancyLevel,
        availableSeats: formData.availableSeats ? parseInt(formData.availableSeats, 10) : null,
        note: formData.note || null,
        expiryDuration: formData.expiryDuration,
        expiryTime: formData.expiryTime || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingSubmission
            ? 'Submission updated successfully!'
            : 'Submission created successfully!',
        })

        // Reset form
        if (!editingSubmission) {
          setFormData({
            hallId: '',
            hallName: '',
            availabilityStatus: 'Free',
            occupancyLevel: 'Empty',
            availableSeats: '',
            note: '',
            expiryDuration: '1h',
            expiryTime: '',
          })
          setSearchQuery('')
        }

        // Notify parent
        if (onSubmitSuccess) {
          onSubmitSuccess(data.submission)
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({
          type: 'error',
          text: data.message || data.error || 'Failed to submit',
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage({
        type: 'error',
        text: 'Error submitting form. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {editingSubmission ? 'Edit Submission' : 'Submit Hall Update'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {editingSubmission
              ? 'Update hall availability information'
              : 'Help keep hall information up-to-date'}
          </p>
        </div>
        {editingSubmission && onEditCancel && (
          <button
            onClick={onEditCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success'
                ? 'text-green-700'
                : 'text-red-700'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lecture Hall - Search Input */}
        <div className="relative">
          <label htmlFor="hallSearch" className="block text-sm font-medium text-gray-700 mb-1.5">
            Lecture Hall <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="hallSearch"
              type="text"
              autoComplete="off"
              placeholder="Search lecture hall (e.g., G, 06, F12, G0610)"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && setShowDropdown(true)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-text pr-10 ${
                errors.hallId
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            
            {/* Loading indicator while searching */}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
          
          {/* Dropdown Results */}
          {showDropdown && searchQuery && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin inline-block" />
                  <span className="ml-2 text-sm text-gray-600">Searching...</span>
                </div>
              ) : filteredHalls.length > 0 ? (
                filteredHalls.map((hall, index) => (
                  <button
                    key={hall.hall_id}
                    type="button"
                    onClick={() => handleHallSelect(hall)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 transition flex justify-between items-center ${
                      highlightedIndex === index
                        ? 'bg-blue-200'
                        : formData.hallId === hall.hall_id
                          ? 'bg-blue-100'
                          : 'hover:bg-blue-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{hall.hall_name}</p>
                      {hall.building && (
                        <p className="text-xs text-gray-500">
                          {hall.building}
                          {hall.floor && ` • Floor ${hall.floor}`}
                        </p>
                      )}
                    </div>
                    {formData.hallId === hall.hall_id && (
                      <span className="text-green-600 font-semibold text-lg">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <p>No lecture halls match "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching by hall ID (e.g., G, F12)</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Hall Display */}
          {formData.hallId && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                <span className="inline-block mr-2">✓</span>
                <span>Selected: <span className="font-semibold">{formData.hallName}</span></span>
              </p>
            </div>
          )}

          {errors.hallId && (
            <p className="text-red-500 text-xs mt-1">{errors.hallId}</p>
          )}
        </div>

        {/* Availability Status */}
        <div>
          <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-700 mb-1.5">
            Availability Status <span className="text-red-500">*</span>
          </label>
          <select
            id="availabilityStatus"
            name="availabilityStatus"
            value={formData.availabilityStatus}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.availabilityStatus
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <option value="Free">Free</option>
            <option value="Partially Busy">Partially Busy</option>
            <option value="Busy">Busy</option>
          </select>
          {errors.availabilityStatus && (
            <p className="text-red-600 text-sm mt-1">{errors.availabilityStatus}</p>
          )}
        </div>

        {/* Occupancy Level */}
        <div>
          <label htmlFor="occupancyLevel" className="block text-sm font-medium text-gray-700 mb-1.5">
            Occupancy Level <span className="text-red-500">*</span>
          </label>
          <select
            id="occupancyLevel"
            name="occupancyLevel"
            value={formData.occupancyLevel}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.occupancyLevel
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <option value="Empty">Empty</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Full">Full</option>
          </select>
          {errors.occupancyLevel && (
            <p className="text-red-600 text-sm mt-1">{errors.occupancyLevel}</p>
          )}
        </div>

        {/* Available Seats */}
        <div>
          <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 mb-1.5">
            Available Seats <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            id="availableSeats"
            name="availableSeats"
            value={formData.availableSeats}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.availableSeats
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          {errors.availableSeats && (
            <p className="text-red-600 text-sm mt-1">{errors.availableSeats}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1.5">
            Note <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Add any additional information about the hall condition..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Expiry Duration */}
        <div>
          <label htmlFor="expiryDuration" className="block text-sm font-medium text-gray-700 mb-1.5">
            Valid For <span className="text-red-500">*</span>
          </label>
          <select
            id="expiryDuration"
            name="expiryDuration"
            value={formData.expiryDuration}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expiryDuration
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="2h">2 Hours</option>
            <option value="custom">Custom Time</option>
          </select>
          {errors.expiryDuration && (
            <p className="text-red-600 text-sm mt-1">{errors.expiryDuration}</p>
          )}
        </div>

        {/* Custom Expiry Time */}
        {formData.expiryDuration === 'custom' && (
          <div>
            <label htmlFor="expiryTime" className="block text-sm font-medium text-gray-700 mb-1.5">
              Expiry Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="expiryTime"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expiryTime
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {errors.expiryTime && (
              <p className="text-red-600 text-sm mt-1">{errors.expiryTime}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {editingSubmission ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            editingSubmission ? 'Update Submission' : 'Submit Update'
          )}
        </button>
      </form>
    </div>
  )
}

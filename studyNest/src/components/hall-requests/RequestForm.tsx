'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Check, X, Info } from 'lucide-react'
import {
  isValidHallCode,
  isValidPartialHallCode,
  validateHallCode,
  getFormatHelpText,
  shouldTriggerSearch,
  isCompleteHallCode,
  type ValidationResult,
} from '@/lib/validations/hallCodeValidation'

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
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([])
  const [selectedHallId, setSelectedHallId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [hallCodeValidation, setHallCodeValidation] = useState<ValidationResult>({
    isValid: false,
    error: '',
  })
  const [hallName, setHallName] = useState('')

  // Search lecture halls using the search API
  useEffect(() => {
    if (!searchQuery.trim() || !shouldTriggerSearch(searchQuery)) {
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

  // Show dropdown when search results arrive
  useEffect(() => {
    if (filteredHalls.length > 0 && searchQuery) {
      setShowDropdown(true)
    }
  }, [filteredHalls, searchQuery])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('hallSearch')?.parentElement?.parentElement
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setSearchQuery(value)
    
    // Validate hall code format
    const validation = validateHallCode(value)
    setHallCodeValidation(validation)
    
    // Reset selection if user modifies input
    if (value !== hallName) {
      setSelectedHallId('')
    }
    
    // Clear error when user is typing
    if (error && error.includes('Please select')) {
      setError('')
    }
  }

  const handleSelectHall = (hall: Hall) => {
    setSelectedHallId(hall.hall_id)
    setSearchQuery(hall.hall_name || `${hall.building}`)
    setHallName(hall.hall_name || '')
    setFilteredHalls([])
    setShowDropdown(false)
    setHallCodeValidation({ isValid: true, error: '' })
  }

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
      setSearchQuery('')
      setHallName('')
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Lecture Hall <span className="text-red-500">*</span>
            </label>
            {searchQuery && (
              <div className="flex items-center gap-2">
                {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                {selectedHallId && !searchLoading && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {!selectedHallId && searchQuery && !searchLoading && (
                  <X className="h-4 w-4 text-amber-600" />
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              id="hallSearch"
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Enter lecture hall code (e.g., A0103, G1210)"
              className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition ${
                selectedHallId
                  ? 'border-green-300 focus:ring-green-500'
                  : searchQuery && hallCodeValidation.error
                    ? 'border-amber-300 focus:ring-amber-500'
                    : 'border-slate-300 focus:ring-[#2E6F95]'
              }`}
            />

            {/* Help Text */}
            {searchQuery && hallCodeValidation.error && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="h-3.5 w-3.5 text-amber-600" />
                <p className="text-xs text-amber-700">{hallCodeValidation.error}</p>
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && filteredHalls.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredHalls.map((hall, index) => (
                  <button
                    key={hall.hall_id}
                    type="button"
                    onClick={() => handleSelectHall(hall)}
                    className={`w-full px-4 py-2.5 text-left transition ${
                      index === highlightedIndex
                        ? 'bg-blue-50 border-l-4 border-[#2E6F95]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{hall.hall_name}</div>
                    <div className="text-xs text-gray-600">
                      {hall.building && `${hall.building}`}
                      {hall.floor && ` • Floor ${hall.floor}`}
                      {hall.capacity && ` • Capacity: ${hall.capacity}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {selectedHallId
              ? '✓ Hall selected'
              : 'Type to search for a lecture hall'}
          </p>
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
          disabled={loading || !selectedHallId}
          className="w-full px-4 py-2 bg-[#2E6F95] text-white font-semibold rounded-lg hover:bg-[#255B79] disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

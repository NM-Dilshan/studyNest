'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X, Info } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  isValidHallCode,
  isValidPartialHallCode,
  validateHallCode,
  getFormatHelpText,
  shouldTriggerSearch,
  type ValidationResult,
} from '@/lib/validations/hallCodeValidation'
import VolunteerStatusSelector from './VolunteerStatusSelector'
import VolunteerPanelSection from './VolunteerPanelSection'
import AppButton from '@/components/ui/AppButton'

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
  const shouldReduceMotion = useReducedMotion()
  const [filteredHalls, setFilteredHalls] = useState<LectureHall[]>([])
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
  const [hallCodeValidation, setHallCodeValidation] = useState<ValidationResult>({
    isValid: false,
    error: '',
  })
  const [resolvedHall, setResolvedHall] = useState<LectureHall | null>(null)
  const [resolving, setResolving] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

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
    let value = e.target.value

    // Allow free typing - just convert to uppercase for consistency
    value = value.toUpperCase()

    setSearchQuery(value)
    setHighlightedIndex(-1)

    // Validate the input and update validation feedback
    const validation = validateHallCode(value)
    setHallCodeValidation(validation)

    // Reset resolved hall when input changes
    setResolvedHall(null)

    // Show dropdown only if there's a valid partial code
    if (value && isValidPartialHallCode(value)) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }

    // If code is complete and valid, try to resolve it
    if (value && validation.isValid && value.length === 5) {
      resolveHallCode(value)
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

  const resolveHallCode = async (code: string) => {
    try {
      setResolving(true)
      const response = await fetch(
        `/api/lecture-halls/resolve?code=${encodeURIComponent(code)}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.hall) {
          // Automatically treat the resolved hall as selected
          setResolvedHall(data.hall)
          setFormData((prev) => ({
            ...prev,
            hallId: data.hall.hall_id,
            hallName: data.hall.hall_name,
          }))
        } else {
          // Hall code format is valid but doesn't exist in database
          setHallCodeValidation({
            isValid: false,
            error: data.message || 'Lecture hall code not found',
          })
        }
      } else {
        const data = await response.json()
        setHallCodeValidation({
          isValid: false,
          error: data.message || 'Lecture hall code not found',
        })
      }
    } catch (error) {
      console.error('Error resolving hall code:', error)
      // Don't set validation error here - just log the network error
    } finally {
      setResolving(false)
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
    // Update form data with selected hall
    setFormData((prev) => ({
      ...prev,
      hallId: hall.hall_id,
      hallName: hall.hall_name,
    }))
    
    // Update input field to show selected hall name
    setSearchQuery(hall.hall_name)
    
    // Mark hall as resolved since it came from the database
    setResolvedHall(hall)
    
    // Close dropdown and reset highlighting
    setShowDropdown(false)
    setHighlightedIndex(-1)
    
    // Update validation state to mark as valid
    setHallCodeValidation({
      isValid: true,
      error: '',
    })
    
    // Clear any existing validation errors for the hall field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.hallId
      return newErrors
    })
  }

  const handleSelectButtonClick = (e: React.MouseEvent, hall: LectureHall) => {
    // Prevent any default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()
    
    // Handle the selection
    handleHallSelect(hall)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Check if lecture hall is provided and valid
    // Allow either:
    // 1. Selected from dropdown (hallId is set)
    // 2. Typed valid code that was resolved and found in database (resolvedHall is set)
    const hasValidHall = formData.hallId || (resolvedHall && hallCodeValidation.isValid)
    
    if (!hasValidHall) {
      // Show specific error based on what went wrong
      if (!searchQuery) {
        newErrors.hallId = 'Lecture hall is required'
      } else if (!hallCodeValidation.isValid) {
        newErrors.hallId = hallCodeValidation.error || 'Invalid lecture hall code'
      } else {
        newErrors.hallId = 'Lecture hall could not be resolved'
      }
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
    <VolunteerPanelSection
      title={editingSubmission ? 'Edit Submission' : 'Submit Hall Update'}
      subtitle={
        editingSubmission
          ? 'Update hall availability information'
          : 'Help keep hall information up-to-date'
      }
      rightSlot={
        editingSubmission && onEditCancel ? (
          <button
            onClick={onEditCancel}
            className="text-slate-300 transition-colors hover:text-white"
            aria-label="Cancel editing hall update"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null
      }
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
      >
      {/* Header */}
      {/* Messages */}
      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live={message.type === 'error' ? 'assertive' : 'polite'}
          className={`mb-6 flex items-start gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'border border-emerald-300/35 bg-emerald-400/15'
              : 'border border-rose-300/40 bg-rose-400/15'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success'
                ? 'text-emerald-100'
                : 'text-rose-100'
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
          <label htmlFor="hallSearch" className="mb-1.5 block text-sm font-medium text-slate-200">
            Lecture Hall <span className="text-rose-300">*</span>
          </label>
          <div className="mb-2 flex items-center gap-1 text-xs text-slate-400">
            <Info className="h-3.5 w-3.5" />
            <span id="hallSearchFormatHelp">{getFormatHelpText()}</span>
          </div>
          <div className="relative">
            <input
              id="hallSearch"
              type="text"
              autoComplete="off"
              placeholder="Enter lecture hall code (e.g., A0103, G1210)"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && isValidPartialHallCode(searchQuery) && setShowDropdown(true)}
              maxLength={20}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showDropdown && filteredHalls.length > 0}
              aria-controls="volunteer-hall-results"
              aria-invalid={Boolean(errors.hallId)}
              aria-describedby="hallSearchFormatHelp"
              className={`w-full cursor-text rounded-lg border bg-slate-900/70 px-3 py-2 pr-10 text-sm uppercase text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                errors.hallId
                  ? 'border-rose-300/60 bg-rose-400/10'
                  : searchQuery && !hallCodeValidation.isValid && hallCodeValidation.error !== 'Lecture hall code is required'
                  ? 'border-amber-300/60 bg-amber-300/10'
                  : searchQuery && hallCodeValidation.isValid && resolvedHall
                  ? 'border-emerald-300/60 bg-emerald-300/10'
                  : 'border-white/20'
              }`}
            />
            
            {/* Loading indicator while searching or resolving */}
            {(searchLoading || resolving) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              </div>
            )}

            {/* Valid indicator - only show when code is resolved */}
            {searchQuery && hallCodeValidation.isValid && resolvedHall && !searchLoading && !resolving && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
            )}

            {/* Warning indicator for invalid/incomplete input */}
            {searchQuery && !hallCodeValidation.isValid && !searchLoading && !resolving && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-amber-300" />
              </div>
            )}
          </div>
          
          {/* Live validation error message */}
          {searchQuery && hallCodeValidation.error && (
            <p className={`mt-2 text-xs ${hallCodeValidation.isValid ? 'text-emerald-300' : 'text-amber-300'}`}>
              {hallCodeValidation.error}
            </p>
          )}

          {/* Resolved hall confirmation */}
          {resolvedHall && hallCodeValidation.isValid && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                Found: {resolvedHall.hall_name}
                {resolvedHall.building && ` (${resolvedHall.building}`}
                {resolvedHall.floor && `, Floor ${resolvedHall.floor}`}
                {resolvedHall.building && ')'})
              </span>
            </p>
          )}
          
          {/* Dropdown Results */}
          {showDropdown && searchQuery && isValidPartialHallCode(searchQuery) && (
            <div id="volunteer-hall-results" role="listbox" className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/20 bg-slate-950 shadow-lg">
              {searchLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="inline-block h-4 w-4 animate-spin text-cyan-300" />
                  <span className="ml-2 text-sm text-slate-200">Searching...</span>
                </div>
              ) : filteredHalls.length > 0 ? (
                filteredHalls.map((hall, index) => (
                  <button
                    key={hall.hall_id}
                    type="button"
                    onClick={(e) => handleSelectButtonClick(e, hall)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={formData.hallId === hall.hall_id}
                    className={`flex w-full items-center justify-between border-b border-white/10 px-3 py-2 text-left transition last:border-b-0 ${
                      highlightedIndex === index
                        ? 'bg-cyan-400/25'
                        : formData.hallId === hall.hall_id
                          ? 'bg-cyan-400/15'
                          : 'hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{hall.hall_name}</p>
                      {hall.building && (
                        <p className="text-xs text-slate-300">
                          {hall.building}
                          {hall.floor && ` • Floor ${hall.floor}`}
                          {hall.capacity && ` • Capacity: ${hall.capacity}`}
                        </p>
                      )}
                    </div>
                    {formData.hallId === hall.hall_id && (
                      <span className="text-lg font-semibold text-emerald-300">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-300">
                  <p>No lecture halls match "{searchQuery}"</p>
                  <p className="mt-1 text-xs text-slate-400">Check the hall code format: {getFormatHelpText()}</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Hall Display */}
          {formData.hallId && isValidHallCode(formData.hallName) && (
            <div className="mt-2 rounded-lg border border-emerald-300/35 bg-emerald-300/10 p-3">
              <p className="text-sm text-emerald-100">
                <span className="inline-block mr-2">✓</span>
                <span>Selected: <span className="font-semibold">{formData.hallName}</span></span>
              </p>
            </div>
          )}

          {errors.hallId && (
            <p className="mt-1 text-xs text-rose-300">{errors.hallId}</p>
          )}
        </div>

        <VolunteerStatusSelector
          label="Availability Status"
          required
          value={formData.availabilityStatus}
          error={errors.availabilityStatus}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, availabilityStatus: value }))
            if (errors.availabilityStatus) {
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.availabilityStatus
                return newErrors
              })
            }
          }}
          options={[
            { label: 'Free', value: 'Free', colorClass: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100' },
            { label: 'Partially Busy', value: 'Partially Busy', colorClass: 'border-amber-300/40 bg-amber-400/20 text-amber-100' },
            { label: 'Busy', value: 'Busy', colorClass: 'border-rose-300/40 bg-rose-400/20 text-rose-100' },
          ]}
        />

        <VolunteerStatusSelector
          label="Occupancy Level"
          required
          value={formData.occupancyLevel}
          error={errors.occupancyLevel}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, occupancyLevel: value }))
            if (errors.occupancyLevel) {
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.occupancyLevel
                return newErrors
              })
            }
          }}
          options={[
            { label: 'Empty', value: 'Empty', colorClass: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100' },
            { label: 'Low', value: 'Low', colorClass: 'border-sky-300/40 bg-sky-400/20 text-sky-100' },
            { label: 'Medium', value: 'Medium', colorClass: 'border-amber-300/40 bg-amber-400/20 text-amber-100' },
            { label: 'High', value: 'High', colorClass: 'border-orange-300/40 bg-orange-400/20 text-orange-100' },
            { label: 'Full', value: 'Full', colorClass: 'border-rose-300/40 bg-rose-400/20 text-rose-100' },
          ]}
        />

        {/* Available Seats */}
        <div>
          <label htmlFor="availableSeats" className="mb-1.5 block text-sm font-medium text-slate-200">
            Available Seats <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="number"
            id="availableSeats"
            name="availableSeats"
            value={formData.availableSeats}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
            className={`w-full rounded-lg border bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              errors.availableSeats
                ? 'border-rose-300/60 bg-rose-300/10'
                : 'border-white/20'
            }`}
          />
          {errors.availableSeats && (
            <p className="mt-1 text-sm text-rose-300">{errors.availableSeats}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-200">
            Note <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Add any additional information about the hall condition..."
            rows={3}
            className="w-full resize-none rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
        </div>

        {/* Expiry Duration */}
        <div>
          <label htmlFor="expiryDuration" className="mb-1.5 block text-sm font-medium text-slate-200">
            Valid For <span className="text-rose-300">*</span>
          </label>
          <select
            id="expiryDuration"
            name="expiryDuration"
            value={formData.expiryDuration}
            onChange={handleInputChange}
            className={`w-full rounded-lg border bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              errors.expiryDuration
                ? 'border-rose-300/60 bg-rose-300/10'
                : 'border-white/20'
            }`}
          >
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="2h">2 Hours</option>
            <option value="custom">Custom Time</option>
          </select>
          {errors.expiryDuration && (
            <p className="mt-1 text-sm text-rose-300">{errors.expiryDuration}</p>
          )}
        </div>

        {/* Custom Expiry Time */}
        {formData.expiryDuration === 'custom' && (
          <div>
            <label htmlFor="expiryTime" className="mb-1.5 block text-sm font-medium text-slate-200">
              Expiry Date & Time <span className="text-rose-300">*</span>
            </label>
            <input
              type="datetime-local"
              id="expiryTime"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleInputChange}
              className={`w-full rounded-lg border bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                errors.expiryTime
                  ? 'border-rose-300/60 bg-rose-300/10'
                  : 'border-white/20'
              }`}
            />
            {errors.expiryTime && (
              <p className="mt-1 text-sm text-rose-300">{errors.expiryTime}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <AppButton
          type="submit"
          disabled={submitting}
          fullWidth
          variant="primary"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {editingSubmission ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            editingSubmission ? 'Update Submission' : 'Submit Update'
          )}
        </AppButton>
      </form>
      </motion.div>
    </VolunteerPanelSection>
  )
}

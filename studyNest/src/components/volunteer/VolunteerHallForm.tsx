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

interface EditingSubmission {
  hall_id?: string
  hall_update_id?: string | number
  availability_status?: string
  occupancy_level?: string
  available_seats?: number
  note?: string
  lecture_halls?: {
    hall_name?: string
  }
}

interface VolunteerHallFormProps {
  volunteerId: string
  onSubmitSuccess?: (submission: unknown) => void
  editingSubmission?: EditingSubmission
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

  useEffect(() => {
    if (!searchQuery.trim() || !shouldTriggerSearch(searchQuery)) {
      setFilteredHalls([])
      setHighlightedIndex(-1)
      return
    }

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
      } catch (searchError) {
        console.error('Error searching halls:', searchError)
        setFilteredHalls([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

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
    value = value.toUpperCase()

    setSearchQuery(value)
    setHighlightedIndex(-1)

    const validation = validateHallCode(value)
    setHallCodeValidation(validation)
    setResolvedHall(null)

    if (value && isValidPartialHallCode(value)) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }

    if (value && validation.isValid && value.length === 5) {
      resolveHallCode(value)
    }

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
      const response = await fetch(`/api/lecture-halls/resolve?code=${encodeURIComponent(code)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.hall) {
          setResolvedHall(data.hall)
          setFormData((prev) => ({
            ...prev,
            hallId: data.hall.hall_id,
            hallName: data.hall.hall_name,
          }))
        } else {
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
    } catch (resolveError) {
      console.error('Error resolving hall code:', resolveError)
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
        setHighlightedIndex((prev) => (prev < filteredHalls.length - 1 ? prev + 1 : prev))
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
    setResolvedHall(hall)
    setShowDropdown(false)
    setHighlightedIndex(-1)
    setHallCodeValidation({
      isValid: true,
      error: '',
    })
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.hallId
      return newErrors
    })
  }

  const handleSelectButtonClick = (e: React.MouseEvent, hall: LectureHall) => {
    e.preventDefault()
    e.stopPropagation()
    handleHallSelect(hall)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const hasValidHall = formData.hallId || (resolvedHall && hallCodeValidation.isValid)

    if (!hasValidHall) {
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
          text: editingSubmission ? 'Submission updated successfully!' : 'Submission created successfully!',
        })

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

        if (onSubmitSuccess) {
          onSubmitSuccess(data.submission)
        }

        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({
          type: 'error',
          text: data.message || data.error || 'Failed to submit',
        })
      }
    } catch (submitError) {
      console.error('Error submitting form:', submitError)
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
      subtitle={editingSubmission ? 'Update hall availability information' : 'Help keep hall information up-to-date'}
      rightSlot={
        editingSubmission && onEditCancel ? (
          <button
            onClick={onEditCancel}
            className="text-[var(--text-soft)] transition-colors hover:text-[var(--text-main)]"
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
        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            aria-live={message.type === 'error' ? 'assertive' : 'polite'}
            className={`mb-6 flex items-start gap-3 rounded-lg p-4 ${message.type === 'success' ? 'themed-panel-success' : 'themed-panel-danger'}`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="hallSearch" className="mb-1.5 block text-sm font-medium text-[var(--text-main)]">
              Lecture Hall <span className="text-rose-500">*</span>
            </label>
            <div className="mb-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
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
                className={`w-full cursor-text rounded-lg border px-3 py-2 pr-10 text-sm uppercase transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                  errors.hallId
                    ? 'border-rose-500/25 bg-rose-500/10 text-[var(--text-main)]'
                    : searchQuery && !hallCodeValidation.isValid && hallCodeValidation.error !== 'Lecture hall code is required'
                      ? 'border-amber-500/25 bg-amber-500/10 text-[var(--text-main)]'
                      : searchQuery && hallCodeValidation.isValid && resolvedHall
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-[var(--text-main)]'
                        : 'themed-input'
                }`}
              />

              {(searchLoading || resolving) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-text)]" />
                </div>
              )}

              {searchQuery && hallCodeValidation.isValid && resolvedHall && !searchLoading && !resolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              )}

              {searchQuery && !hallCodeValidation.isValid && !searchLoading && !resolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
              )}
            </div>

            {searchQuery && hallCodeValidation.error && (
              <p className={`mt-2 text-xs ${hallCodeValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {hallCodeValidation.error}
              </p>
            )}

            {resolvedHall && hallCodeValidation.isValid && (
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  Found: {resolvedHall.hall_name}
                  {resolvedHall.building && ` (${resolvedHall.building}`}
                  {resolvedHall.floor && `, Floor ${resolvedHall.floor}`}
                  {resolvedHall.building && ')'}
                </span>
              </p>
            )}

            {showDropdown && searchQuery && isValidPartialHallCode(searchQuery) && (
              <div id="volunteer-hall-results" role="listbox" className="themed-surface absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg shadow-lg">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="inline-block h-4 w-4 animate-spin text-[var(--accent-text)]" />
                    <span className="ml-2 text-sm text-[var(--text-soft)]">Searching...</span>
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
                      className={`flex w-full items-center justify-between border-b border-[var(--surface-border)] px-3 py-2 text-left transition last:border-b-0 ${
                        highlightedIndex === index
                          ? 'bg-[var(--accent-bg)]'
                          : formData.hallId === hall.hall_id
                            ? 'bg-[var(--accent-bg)]/70'
                            : 'hover:bg-[var(--surface-card-muted)]'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-[var(--text-main)]">{hall.hall_name}</p>
                        {hall.building && (
                          <p className="text-xs text-[var(--text-soft)]">
                            {hall.building}
                            {hall.floor && ` • Floor ${hall.floor}`}
                            {hall.capacity && ` • Capacity: ${hall.capacity}`}
                          </p>
                        )}
                      </div>
                      {formData.hallId === hall.hall_id && (
                        <span className="text-lg font-semibold text-emerald-600">✓</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-[var(--text-soft)]">
                    <p>No lecture halls match <span className="font-medium">{searchQuery}</span></p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Check the hall code format: {getFormatHelpText()}</p>
                  </div>
                )}
              </div>
            )}

            {formData.hallId && isValidHallCode(formData.hallName) && (
              <div className="mt-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
                <p className="text-sm text-emerald-600">
                  <span className="mr-2 inline-block">✓</span>
                  <span>Selected: <span className="font-semibold">{formData.hallName}</span></span>
                </p>
              </div>
            )}

            {errors.hallId && <p className="mt-1 text-xs text-rose-600">{errors.hallId}</p>}
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
              { label: 'Free', value: 'Free', colorClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' },
              { label: 'Partially Busy', value: 'Partially Busy', colorClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600' },
              { label: 'Busy', value: 'Busy', colorClass: 'border-rose-500/25 bg-rose-500/10 text-rose-600' },
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
              { label: 'Empty', value: 'Empty', colorClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' },
              { label: 'Low', value: 'Low', colorClass: 'border-sky-500/25 bg-sky-500/10 text-sky-600' },
              { label: 'Medium', value: 'Medium', colorClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600' },
              { label: 'High', value: 'High', colorClass: 'border-orange-500/25 bg-orange-500/10 text-orange-600' },
              { label: 'Full', value: 'Full', colorClass: 'border-rose-500/25 bg-rose-500/10 text-rose-600' },
            ]}
          />

          <div>
            <label htmlFor="availableSeats" className="mb-1.5 block text-sm font-medium text-[var(--text-main)]">
              Available Seats <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              type="number"
              id="availableSeats"
              name="availableSeats"
              value={formData.availableSeats}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                errors.availableSeats
                  ? 'border-rose-500/25 bg-rose-500/10 text-[var(--text-main)]'
                  : 'themed-input'
              }`}
            />
            {errors.availableSeats && <p className="mt-1 text-sm text-rose-600">{errors.availableSeats}</p>}
          </div>

          <div>
            <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-[var(--text-main)]">
              Note <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Add any additional information about the hall condition..."
              rows={3}
              className="themed-input w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label htmlFor="expiryDuration" className="mb-1.5 block text-sm font-medium text-[var(--text-main)]">
              Valid For <span className="text-rose-500">*</span>
            </label>
            <select
              id="expiryDuration"
              name="expiryDuration"
              value={formData.expiryDuration}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                errors.expiryDuration
                  ? 'border-rose-500/25 bg-rose-500/10 text-[var(--text-main)]'
                  : 'themed-input'
              }`}
            >
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="2h">2 Hours</option>
              <option value="custom">Custom Time</option>
            </select>
            {errors.expiryDuration && <p className="mt-1 text-sm text-rose-600">{errors.expiryDuration}</p>}
          </div>

          {formData.expiryDuration === 'custom' && (
            <div>
              <label htmlFor="expiryTime" className="mb-1.5 block text-sm font-medium text-[var(--text-main)]">
                Expiry Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="expiryTime"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                  errors.expiryTime
                    ? 'border-rose-500/25 bg-rose-500/10 text-[var(--text-main)]'
                    : 'themed-input'
                }`}
              />
              {errors.expiryTime && <p className="mt-1 text-sm text-rose-600">{errors.expiryTime}</p>}
            </div>
          )}

          <AppButton type="submit" disabled={submitting} fullWidth variant="primary">
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

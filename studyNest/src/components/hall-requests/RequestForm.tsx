'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Check, X, Info, Send } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  validateHallCode,
  shouldTriggerSearch,
  type ValidationResult,
} from '@/lib/validations/hallCodeValidation'
import GlassCard from '@/components/ui/GlassCard'
import AppButton from '@/components/ui/AppButton'

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
  const shouldReduceMotion = useReducedMotion()
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([])
  const [selectedHallId, setSelectedHallId] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
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
    if (filteredHalls.length > 0 && searchQuery) {
      setShowDropdown(true)
    }
  }, [filteredHalls, searchQuery])

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

    const validation = validateHallCode(value)
    setHallCodeValidation(validation)

    if (value !== hallName) {
      setSelectedHallId('')
    }

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

    setSubmitting(true)

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
    } catch (submitError) {
      console.error('Error submitting request:', submitError)
      setError('An error occurred while submitting your request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className="mb-4 text-xl font-bold text-[var(--text-main)]">Create Request</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="themed-panel-danger flex items-start gap-3 rounded-lg p-3" role="alert" aria-live="assertive">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="themed-panel-success flex items-start gap-3 rounded-lg p-3" role="status" aria-live="polite">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Request submitted successfully!</p>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="hallSearch" className="block text-sm font-semibold text-[var(--text-main)]">
              Lecture Hall <span className="text-red-500">*</span>
            </label>
            {searchQuery && (
              <div className="flex items-center gap-2">
                {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-text)]" />}
                {selectedHallId && !searchLoading && <Check className="h-4 w-4 text-emerald-500" />}
                {!selectedHallId && searchQuery && !searchLoading && <X className="h-4 w-4 text-amber-500" />}
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
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showDropdown && filteredHalls.length > 0}
              aria-controls="hallSearch-results"
              aria-invalid={Boolean(searchQuery && hallCodeValidation.error && !selectedHallId)}
              aria-describedby="hallSearch-help"
              className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition focus:ring-2 ${
                selectedHallId
                  ? 'border-emerald-500/25 bg-emerald-500/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-emerald-500/20'
                  : searchQuery && hallCodeValidation.error
                    ? 'border-amber-500/25 bg-amber-500/10 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-amber-500/20'
                    : 'themed-input focus:border-[var(--surface-border-strong)] focus:ring-[var(--focus-ring)]'
              }`}
            />

            {searchQuery && hallCodeValidation.error && (
              <div className="mt-1 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs text-amber-600">{hallCodeValidation.error}</p>
              </div>
            )}

            {showDropdown && filteredHalls.length > 0 && (
              <div id="hallSearch-results" role="listbox" className="themed-surface absolute left-0 right-0 top-12 z-50 max-h-64 overflow-y-auto rounded-lg shadow-xl">
                {filteredHalls.map((hall, index) => (
                  <button
                    key={hall.hall_id}
                    type="button"
                    onClick={() => handleSelectHall(hall)}
                    role="option"
                    aria-selected={selectedHallId === hall.hall_id}
                    className={`w-full px-4 py-2.5 text-left transition ${
                      index === highlightedIndex
                        ? 'border-l-4 border-[var(--button-primary-bg)] bg-[var(--accent-bg)]'
                        : 'hover:bg-[var(--surface-card-muted)]'
                    }`}
                  >
                    <div className="font-medium text-[var(--text-main)]">{hall.hall_name}</div>
                    <div className="text-xs text-[var(--text-soft)]">
                      {hall.building && `${hall.building}`}
                      {hall.floor && ` • Floor ${hall.floor}`}
                      {hall.capacity && ` • Capacity: ${hall.capacity}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p id="hallSearch-help" className="mt-1 text-xs text-[var(--text-muted)]">
            {selectedHallId ? 'Hall selected' : 'Type to search for a lecture hall'}
          </p>
        </div>

        <div>
          <label htmlFor="requestNote" className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
            Message (Optional)
          </label>
          <textarea
            id="requestNote"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder="E.g., Need to know if there are seats available now"
            className="themed-input w-full resize-none rounded-lg px-4 py-2 text-sm outline-none transition focus:border-[var(--surface-border-strong)] focus:ring-2 focus:ring-[var(--focus-ring)]"
            rows={3}
            maxLength={300}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">{note.length}/300 characters</p>
        </div>

        <div className="themed-inset rounded-lg p-3">
          <p className="text-xs text-[var(--text-soft)]">This request will be sent as:</p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">{userName}</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {userRole === 'student' ? 'Student' : 'Volunteer'} ID: {userIdNumber}
          </p>
        </div>

        <motion.div whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
          <AppButton
            type="submit"
            disabled={submitting || !selectedHallId}
            fullWidth
            variant="primary"
            className="py-2.5"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Sending...' : 'Send Request'}
          </AppButton>
        </motion.div>
      </form>
    </GlassCard>
  )
}

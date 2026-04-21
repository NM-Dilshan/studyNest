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
    } catch (err) {
      console.error('Error submitting request:', err)
      setError('An error occurred while submitting your request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard className="border-white/15 bg-slate-950/55 p-6">
      <h2 className="mb-4 text-xl font-bold text-white">Create Request</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-300/35 bg-rose-400/10 p-3" role="alert" aria-live="assertive">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-200" />
            <p className="text-sm text-rose-100">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-300/35 bg-emerald-400/10 p-3" role="status" aria-live="polite">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-200" />
            <p className="text-sm text-emerald-100">Request submitted successfully!</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="hallSearch" className="block text-sm font-semibold text-slate-100">
              Lecture Hall <span className="text-red-500">*</span>
            </label>
            {searchQuery && (
              <div className="flex items-center gap-2">
                {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />}
                {selectedHallId && !searchLoading && (
                  <Check className="h-4 w-4 text-emerald-300" />
                )}
                {!selectedHallId && searchQuery && !searchLoading && (
                  <X className="h-4 w-4 text-amber-200" />
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
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showDropdown && filteredHalls.length > 0}
              aria-controls="hallSearch-results"
              aria-invalid={Boolean(searchQuery && hallCodeValidation.error && !selectedHallId)}
              aria-describedby="hallSearch-help"
              className={`w-full rounded-lg border px-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                selectedHallId
                  ? 'border-emerald-300/50 bg-emerald-500/10 focus:ring-emerald-300/30'
                  : searchQuery && hallCodeValidation.error
                    ? 'border-amber-300/50 bg-amber-500/10 focus:ring-amber-300/30'
                    : 'border-white/20 bg-slate-900/80 focus:border-cyan-300/70 focus:ring-cyan-300/25'
              }`}
            />

            {searchQuery && hallCodeValidation.error && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="h-3.5 w-3.5 text-amber-200" />
                <p className="text-xs text-amber-100">{hallCodeValidation.error}</p>
              </div>
            )}

            {showDropdown && filteredHalls.length > 0 && (
              <div id="hallSearch-results" role="listbox" className="absolute left-0 right-0 top-12 z-50 max-h-64 overflow-y-auto rounded-lg border border-white/20 bg-slate-900/95 shadow-xl">
                {filteredHalls.map((hall, index) => (
                  <button
                    key={hall.hall_id}
                    type="button"
                    onClick={() => handleSelectHall(hall)}
                    role="option"
                    aria-selected={selectedHallId === hall.hall_id}
                    className={`w-full px-4 py-2.5 text-left transition ${
                      index === highlightedIndex
                        ? 'border-l-4 border-cyan-300 bg-cyan-400/15'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-white">{hall.hall_name}</div>
                    <div className="text-xs text-slate-300">
                      {hall.building && `${hall.building}`}
                      {hall.floor && ` • Floor ${hall.floor}`}
                      {hall.capacity && ` • Capacity: ${hall.capacity}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p id="hallSearch-help" className="mt-1 text-xs text-slate-300">
            {selectedHallId
              ? '✓ Hall selected'
              : 'Type to search for a lecture hall'}
          </p>
        </div>

        <div>
          <label htmlFor="requestNote" className="mb-2 block text-sm font-semibold text-slate-100">
            Message (Optional)
          </label>
          <textarea
            id="requestNote"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            placeholder="E.g., Need to know if there are seats available now"
            className="w-full resize-none rounded-lg border border-white/20 bg-slate-900/80 px-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25"
            rows={3}
            maxLength={300}
          />
          <p className="mt-1 text-xs text-slate-300">
            {note.length}/300 characters
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/5 p-3">
          <p className="text-xs text-slate-300">
            This request will be sent as:
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{userName}</p>
          <p className="mt-0.5 text-xs text-slate-300">
            {userRole === 'student' ? 'Student' : 'Volunteer'} ID: {userIdNumber}
          </p>
        </div>

        <motion.div whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
        <AppButton
          type="submit"
          disabled={submitting || !selectedHallId}
          fullWidth
          variant="primary"
          className="py-2.5 text-slate-950"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Sending...' : 'Send Request'}
        </AppButton>
        </motion.div>
      </form>
    </GlassCard>
  )
}

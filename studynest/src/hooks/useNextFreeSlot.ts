'use client'

/**
 * useNextFreeSlot — Fetch next free time slot via RPC
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { NextFreeSlot } from '@/types/halls'

interface UseNextFreeSlotReturn {
  nextSlots: NextFreeSlot[]
  loading: boolean
  error: string | null
}

export function useNextFreeSlot(hoursAhead: number = 3, stepMinutes: number = 30): UseNextFreeSlotReturn {
  const [nextSlots, setNextSlots] = useState<NextFreeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNextSlots = async () => {
      try {
        setLoading(true)
        setError(null)

        const fromTime = new Date().toISOString()
        const { data, error: rpcError } = await supabase.rpc('get_next_free_slot', {
          p_from_time: fromTime,
          p_hours_ahead: hoursAhead,
          p_step_minutes: stepMinutes,
        })

        if (rpcError) {
          setError('Could not load next free slots. Please try again.')
          setNextSlots([])
          return
        }

        setNextSlots(data || [])
      } catch (err) {
        console.error('useNextFreeSlot error:', err)
        setError('Failed to load next free slots')
        setNextSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchNextSlots()
  }, [hoursAhead, stepMinutes])

  return {
    nextSlots,
    loading,
    error,
  }
}

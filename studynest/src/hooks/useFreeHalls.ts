'use client'

/**
 * useFreeHalls — Fetch free halls now via RPC with auto-refresh
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FreeHallResult } from '@/types/halls'

interface UseFreeHallsReturn {
  hallsNow: FreeHallResult[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFreeHalls(): UseFreeHallsReturn {
  const [hallsNow, setHallsNow] = useState<FreeHallResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFreeHalls = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const checkTime = new Date().toISOString()
      const { data, error: rpcError } = await supabase.rpc('get_free_halls_now', {
        p_check_time: checkTime,
      })

      if (rpcError) {
        setError('Could not load free halls. Please try again.')
        setHallsNow([])
        return
      }

      setHallsNow(data || [])
    } catch (err) {
      console.error('useFreeHalls error:', err)
      setError('Failed to load free halls')
      setHallsNow([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFreeHalls()
  }, [fetchFreeHalls])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFreeHalls()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchFreeHalls])

  return {
    hallsNow,
    loading,
    error,
    refetch: fetchFreeHalls,
  }
}

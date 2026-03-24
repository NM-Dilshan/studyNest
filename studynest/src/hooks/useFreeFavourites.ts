'use client'

/**
 * useFreeFavourites — Fetch free favourite halls via RPC
 */

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FreeHallResult } from '@/types/halls'

interface UseFreeFavouritesReturn {
  freeFavourites: FreeHallResult[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFreeFavourites(userId: string): UseFreeFavouritesReturn {
  const [freeFavourites, setFreeFavourites] = useState<FreeHallResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFreeFavourites = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const checkTime = new Date().toISOString()
      const { data, error: rpcError } = await supabase.rpc('get_free_favourites', {
        p_student_id: userId,
        p_check_time: checkTime,
      })

      if (rpcError) {
        setError('Could not load free favourites. Please try again.')
        setFreeFavourites([])
        return
      }

      setFreeFavourites(data || [])
    } catch (err) {
      console.error('useFreeFavourites error:', err)
      setError('Failed to load free favourites')
      setFreeFavourites([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  return {
    freeFavourites,
    loading,
    error,
    refetch: fetchFreeFavourites,
  }
}

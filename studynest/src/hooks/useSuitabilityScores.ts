'use client'

/**
 * useSuitabilityScores — Compute and fetch suitability scores for halls
 */

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { SuitabilityScore, StudyPurpose } from '@/types/halls'

interface UseSuitabilityScoresReturn {
  scores: Map<string, SuitabilityScore>
  loading: boolean
  error: string | null
  computeScores: (hallIds: string[], purpose: StudyPurpose, groupSize: number) => void
}

export function useSuitabilityScores(): UseSuitabilityScoresReturn {
  const [scores, setScores] = useState<Map<string, SuitabilityScore>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const computeScores = useCallback(async (hallIds: string[], purpose: StudyPurpose, groupSize: number) => {
    if (!hallIds.length || !purpose || !groupSize) return

    try {
      setLoading(true)
      setError(null)

      const checkTime = new Date().toISOString()
      const newScores = new Map<string, SuitabilityScore>()

      // Compute score for each hall
      for (const hallId of hallIds) {
        try {
          const { data, error: rpcError } = await supabase.rpc('compute_suitability_score', {
            p_hall_id: hallId,
            p_purpose: purpose,
            p_group_size: groupSize,
            p_check_time: checkTime,
          })

          if (rpcError) {
            console.error(`Error computing score for hall ${hallId}:`, rpcError)
            continue
          }

          if (data) {
            newScores.set(hallId, data)
          }
        } catch (err) {
          console.error(`Error computing score for hall ${hallId}:`, err)
        }
      }

      setScores(newScores)
    } catch (err) {
      console.error('useSuitabilityScores error:', err)
      setError('Failed to compute suitability scores')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    scores,
    loading,
    error,
    computeScores,
  }
}

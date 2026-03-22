'use client'

/**
 * useUserPreferences — Load and save user preferences with persistence
 */

import { useState, useEffect, useCallback } from 'react'
import { getUserPreferences, saveUserPreferences, createDefaultPreferences } from '@/services/preferencesService'
import { UserPreferences } from '@/types/halls'

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null
  loading: boolean
  error: string | null
  updatePreferences: (updates: Partial<UserPreferences>) => void
}

export function useUserPreferences(userId: string): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let userPrefs = await getUserPreferences(userId)
        if (!userPrefs) {
          // Create default preferences if not found
          userPrefs = await createDefaultPreferences(userId)
        }

        setPreferences(userPrefs)
      } catch (err) {
        console.error('Failed to load preferences:', err)
        setError('Could not load your preferences')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!userId || !preferences) return

      try {
        const updated = await saveUserPreferences({
          ...preferences,
          ...updates,
          user_id: userId,
          updated_at: new Date().toISOString(),
        })

        setPreferences(updated)
      } catch (err) {
        console.error('Failed to save preferences:', err)
        setError('Could not save your preferences')
      }
    },
    [userId, preferences]
  )

  return {
    preferences,
    loading,
    error,
    updatePreferences,
  }
}

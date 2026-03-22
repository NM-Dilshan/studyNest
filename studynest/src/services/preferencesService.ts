/**
 * Preferences Service — Load and save user preferences
 */

import { supabase } from '@/lib/supabase'
import { UserPreferences } from '@/types/halls'

/**
 * Load user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

/**
 * Save or update user preferences (upsert)
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([preferences], { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update specific preference fields
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create default preferences for new user
 */
export async function createDefaultPreferences(userId: string): Promise<UserPreferences> {
  const defaultPrefs: UserPreferences = {
    user_id: userId,
    preferred_building: undefined,
    preferred_floor: undefined,
    min_capacity: 1,
    preferred_facilities: [],
    prefer_quiet: false,
    quiet_threshold: 2.5,
    sort_by_proximity: false,
    default_purpose: 'individual_study',
    default_group_size: 1,
    updated_at: new Date().toISOString(),
  }

  return saveUserPreferences(defaultPrefs)
}

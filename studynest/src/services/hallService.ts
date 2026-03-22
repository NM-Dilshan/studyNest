/**
 * Hall Service — CRUD operations for lecture_halls table
 */

import { supabase } from '@/lib/supabase'
import { LectureHall } from '@/types/halls'

/**
 * Get all lecture halls with optional filters
 */
export async function getLectureHalls(): Promise<LectureHall[]> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .select('*')
    .order('building')
    .order('floor')

  if (error) throw error
  return data || []
}

/**
 * Get a single hall by ID
 */
export async function getHallById(hallId: string): Promise<LectureHall | null> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .select('*')
    .eq('hall_id', hallId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  return data || null
}

/**
 * Create a new lecture hall
 */
export async function createHall(hall: Omit<LectureHall, 'hall_id' | 'created_at'>): Promise<LectureHall> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .insert([hall])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a lecture hall
 */
export async function updateHall(hallId: string, updates: Partial<LectureHall>): Promise<LectureHall> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .update(updates)
    .eq('hall_id', hallId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete a hall (mark as inactive)
 */
export async function softDeleteHall(hallId: string): Promise<LectureHall> {
  return updateHall(hallId, { is_active: false })
}

/**
 * Update a single facility on a hall
 */
export async function updateHallFacility(
  hallId: string,
  facilityKey: keyof LectureHall,
  value: boolean
): Promise<void> {
  const { error } = await supabase
    .from('lecture_halls')
    .update({ [facilityKey]: value })
    .eq('hall_id', hallId)

  if (error) throw error
}

/**
 * Get facilities for a specific hall
 */
export async function getHallFacilities(
  hallId: string
): Promise<
  Pick<
    LectureHall,
    'projector' | 'wifi' | 'ac' | 'whiteboard' | 'wheelchair_accessible' | 'power_sockets'
  >
> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .select('projector, wifi, ac, whiteboard, wheelchair_accessible, power_sockets')
    .eq('hall_id', hallId)
    .single()

  if (error) throw error
  return data
}

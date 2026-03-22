/**
 * Favourite Service — CRUD operations for favorite_halls table
 */

import { supabase } from '@/lib/supabase'
import { LectureHall } from '@/types/halls'

/**
 * Add a hall to student's favourites
 */
export async function addFavourite(studentId: string, hallId: string): Promise<void> {
  const { error } = await supabase
    .from('favorite_halls')
    .insert([{ student_id: studentId, hall_id: hallId }])

  if (error && error.code !== '23505') throw error // 23505 = unique violation (ignore if already favourite)
}

/**
 * Remove a hall from student's favourites
 */
export async function removeFavourite(studentId: string, hallId: string): Promise<void> {
  const { error } = await supabase
    .from('favorite_halls')
    .delete()
    .eq('student_id', studentId)
    .eq('hall_id', hallId)

  if (error) throw error
}

/**
 * Get all favourite halls for a student with full hall details
 */
export async function getUserFavourites(studentId: string): Promise<LectureHall[]> {
  const { data, error } = await supabase
    .from('favorite_halls')
    .select('hall_id, lecture_halls(*)')
    .eq('student_id', studentId)

  if (error) throw error

  // Extract hall objects from nested response
  return data?.map((fav: any) => fav.lecture_halls).filter(Boolean) || []
}

/**
 * Check if a specific hall is favourited by a student
 */
export async function isFavourited(studentId: string, hallId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorite_halls')
    .select('hall_id')
    .eq('student_id', studentId)
    .eq('hall_id', hallId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Get favourite hall IDs for a student (for quick lookups)
 */
export async function getFavouriteHallIds(studentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorite_halls')
    .select('hall_id')
    .eq('student_id', studentId)

  if (error) throw error
  return data?.map((fav: any) => fav.hall_id) || []
}

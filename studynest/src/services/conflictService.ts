/**
 * Conflict Service — Update and manage maintenance/conflict status for halls
 */

import { supabase } from '@/lib/supabase'
import { LectureHall } from '@/types/halls'

export type ConflictStatus = 'available' | 'under_maintenance' | 'reserved_exam' | 'reserved_event' | 'closed'
export type ConflictSeverity = 'warning' | 'blocked'

/**
 * Update maintenance status and conflict severity for a hall
 */
export async function updateConflictStatus(
  hallId: string,
  status: ConflictStatus,
  severity: ConflictSeverity = 'warning'
): Promise<LectureHall> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .update({
      maintenance_status: status,
      conflict_severity: severity,
    })
    .eq('hall_id', hallId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Clear conflict status (restore hall to available)
 */
export async function clearConflict(hallId: string): Promise<LectureHall> {
  return updateConflictStatus(hallId, 'available', 'warning')
}

/**
 * Get all halls with active conflicts (not available)
 */
export async function getConflictedHalls(): Promise<
  Pick<LectureHall, 'hall_id' | 'hall_name' | 'maintenance_status' | 'conflict_severity'>[]
> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .select('hall_id, hall_name, maintenance_status, conflict_severity')
    .neq('maintenance_status', 'available')

  if (error) throw error
  return data || []
}

/**
 * Get conflict details for a specific hall
 */
export async function getHallConflictStatus(
  hallId: string
): Promise<Pick<LectureHall, 'maintenance_status' | 'conflict_severity'> | null> {
  const { data, error } = await supabase
    .from('lecture_halls')
    .select('maintenance_status, conflict_severity')
    .eq('hall_id', hallId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

/**
 * Mark hall as under maintenance
 */
export async function markUnderMaintenance(hallId: string, severity: ConflictSeverity = 'blocked'): Promise<LectureHall> {
  return updateConflictStatus(hallId, 'under_maintenance', severity)
}

/**
 * Mark hall as reserved for exam
 */
export async function markReservedForExam(hallId: string, severity: ConflictSeverity = 'blocked'): Promise<LectureHall> {
  return updateConflictStatus(hallId, 'reserved_exam', severity)
}

/**
 * Mark hall as reserved for event
 */
export async function markReservedForEvent(hallId: string, severity: ConflictSeverity = 'warning'): Promise<LectureHall> {
  return updateConflictStatus(hallId, 'reserved_event', severity)
}

/**
 * Mark hall as closed
 */
export async function markClosed(hallId: string): Promise<LectureHall> {
  return updateConflictStatus(hallId, 'closed', 'blocked')
}

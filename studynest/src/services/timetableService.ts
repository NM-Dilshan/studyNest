/**
 * Timetable Service — CRUD operations for timetable table
 */

import { supabase } from '@/lib/supabase'
import { TimetableSlot } from '@/types/halls'

/**
 * Get all timetable slots
 */
export async function getTimetableSlots(): Promise<TimetableSlot[]> {
  const { data, error } = await supabase.from('timetable').select('*, lecture_halls(hall_name)')

  if (error) throw error
  return data || []
}

/**
 * Get timetable slots for a specific hall
 */
export async function getHallTimetable(hallId: string): Promise<TimetableSlot[]> {
  const { data, error } = await supabase
    .from('timetable')
    .select('*, lecture_halls(hall_name)')
    .eq('hall_id', hallId)

  if (error) throw error
  return data || []
}

/**
 * Create a new timetable slot
 */
export async function createTimetableSlot(slot: Omit<TimetableSlot, 'timetable_id'>): Promise<TimetableSlot> {
  const { data, error } = await supabase
    .from('timetable')
    .insert([{ ...slot, is_reserved: true }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a timetable slot
 */
export async function updateTimetableSlot(
  timetableId: number,
  updates: Partial<TimetableSlot>
): Promise<TimetableSlot> {
  const { data, error } = await supabase
    .from('timetable')
    .update(updates)
    .eq('timetable_id', timetableId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a timetable slot
 */
export async function deleteTimetableSlot(timetableId: number): Promise<void> {
  const { error } = await supabase.from('timetable').delete().eq('timetable_id', timetableId)

  if (error) throw error
}

/**
 * Bulk insert timetable slots from CSV
 * Expected format: Array of slot objects matching TimetableSlot (minus timetable_id)
 */
export async function bulkInsertTimetableSlots(
  slots: Omit<TimetableSlot, 'timetable_id'>[]
): Promise<TimetableSlot[]> {
  const slotsWithReserved = slots.map((slot) => ({
    ...slot,
    is_reserved: true,
  }))

  const { data, error } = await supabase.from('timetable').insert(slotsWithReserved).select()

  if (error) throw error
  return data || []
}

/**
 * Parse CSV and bulk insert
 * CSV should have headers: hall_id,day_of_week,start_time,end_time,subject_code,subject_name,group_name,lecturer_name
 */
export async function parseAndInsertCSV(csvText: string): Promise<TimetableSlot[]> {
  const lines = csvText.split('\n').filter((line) => line.trim())
  if (lines.length < 2) throw new Error('CSV must have header and at least one data row')

  const headers = lines[0].split(',').map((h) => h.trim())
  const expectedHeaders = [
    'hall_id',
    'day_of_week',
    'start_time',
    'end_time',
    'subject_code',
    'subject_name',
    'group_name',
    'lecturer_name',
  ]

  // Validate headers
  if (!expectedHeaders.every((h) => headers.includes(h))) {
    throw new Error(`CSV headers must include: ${expectedHeaders.join(', ')}`)
  }

  // Parse data rows
  const slots: Omit<TimetableSlot, 'timetable_id'>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    if (values.filter((v) => v).length === 0) continue // Skip empty rows

    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx] || ''
    })

    slots.push({
      hall_id: row.hall_id,
      day_of_week: row.day_of_week as any,
      start_time: row.start_time,
      end_time: row.end_time,
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      group_name: row.group_name,
      lecturer_name: row.lecturer_name,
      is_reserved: true,
    })
  }

  return bulkInsertTimetableSlots(slots)
}

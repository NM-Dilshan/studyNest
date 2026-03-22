/**
 * TypeScript interfaces for Function 01: Free Lecture Hall Finder
 */

export interface LectureHall {
  hall_id: string
  hall_name: string
  building: string
  floor: number
  capacity: number
  hall_type: string
  projector: boolean
  wifi: boolean
  ac: boolean
  whiteboard: boolean
  wheelchair_accessible: boolean
  power_sockets: boolean
  is_active: boolean
  maintenance_status: 'available' | 'under_maintenance' | 'reserved_exam' | 'reserved_event' | 'closed'
  conflict_severity: 'warning' | 'blocked'
  latitude?: number
  longitude?: number
  created_at: string
}

export interface TimetableSlot {
  timetable_id: number
  hall_id: string
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  start_time: string
  end_time: string
  subject_code: string
  subject_name: string
  group_name: string
  lecturer_name: string
  is_reserved: boolean
}

export interface FreeHallResult {
  hall_id: string
  hall_name: string
  building: string
  floor: number
  capacity: number
  projector: boolean
  wifi: boolean
  ac: boolean
  whiteboard: boolean
  wheelchair_accessible: boolean
  power_sockets: boolean
  maintenance_status: string
  has_conflict: boolean
  conflict_type?: string
  conflict_severity?: 'warning' | 'blocked'
  distanceKm?: number
}

export interface NextFreeSlot {
  hall_id: string
  hall_name: string
  building_name: string
  next_free_at: string
  free_until: string
  suitability_score: number
}

export interface SuitabilityScore {
  hall_id: string
  purpose: 'individual_study' | 'group_study' | 'presentation'
  score: number
  score_breakdown: {
    capacity_score: number
    noise_score: number
    facility_score: number
    pattern_score: number
    group_size: number
    hall_capacity: number
  }
  computed_at: string
}

export interface UserPreferences {
  user_id: string
  preferred_building?: string
  preferred_floor?: number
  min_capacity: number
  preferred_facilities: string[]
  prefer_quiet: boolean
  quiet_threshold: number
  sort_by_proximity: boolean
  default_purpose: 'individual_study' | 'group_study' | 'presentation'
  default_group_size: number
  updated_at: string
}

export interface UsagePattern {
  hall_id: string
  day_of_week: number
  hour_of_day: number
  avg_occupancy: number
  sample_count: number
}

export type StudyPurpose = 'individual_study' | 'group_study' | 'presentation'

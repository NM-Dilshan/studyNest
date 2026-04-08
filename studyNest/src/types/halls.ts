export type StudyPurpose = 'general' | 'discussion' | 'presentation' | 'quiet';

export interface LectureHall {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  is_active: boolean;
  maintenance_status: 'available' | 'under_maintenance' | 'reserved_exam' | 'reserved_event' | 'closed';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  
  // Facilities
  projector: boolean;
  wifi: boolean;
  ac: boolean;
  whiteboard: boolean;
  wheelchair_accessible: boolean;
  power_sockets: boolean;
}

export interface TimetableSlot {
  id: number;
  hall_id: string | null;
  academic_year: number | null;
  semester: number | null;
  day_of_week: string;           // 'Monday', 'Tuesday', etc.
  start_time: string;            // 'HH:MM:SS'
  end_time: string;              // 'HH:MM:SS'
  subject_code: string | null;
  subject_name: string | null;
  group_name: string | null;
  lecturer_name: string | null;
  raw_hall_name: string | null;
  is_reserved: boolean;
  created_at: string;
  hall_name?: string | null;
  building?: string | null;
}

export interface FreeHallResult extends LectureHall {
  is_free_now: boolean;
  score?: number;
  distance_km?: number | null;
}

export interface NextFreeSlot {
  hall_id: string;
  start_time: string;
  end_time: string;
}

export interface SuitabilityScore {
  hall_id: string;
  score: number;
  breakdown: Record<string, number | boolean | string>;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_buildings: string[];
  preferred_purpose: StudyPurpose;
  group_size: number;
  require_projector: boolean;
  require_wifi: boolean;
  require_ac: boolean;
  require_whiteboard: boolean;
  require_accessibility: boolean;
  require_power: boolean;
  quiet_zone: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsagePattern {
  hall_id: string;
  day_of_week: number;
  hour_of_day: number;
  availability_percentage: number;
}

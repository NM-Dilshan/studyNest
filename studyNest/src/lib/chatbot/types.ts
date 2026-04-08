export enum ChatbotIntent {
  MOST_COMPLAINED_HALL = 'MOST_COMPLAINED_HALL',
  COMPLAINT_SUMMARY = 'COMPLAINT_SUMMARY',
  PENDING_COUNT = 'PENDING_COUNT',
  RESOLVED_COUNT = 'RESOLVED_COUNT',
  COMPLAINT_STATUS_BY_ID = 'COMPLAINT_STATUS_BY_ID',
  MY_COMPLAINT_STATUS = 'MY_COMPLAINT_STATUS',
  COMPLAINTS_BY_HALL = 'COMPLAINTS_BY_HALL',
  FREE_LECTURE_HALLS = 'FREE_LECTURE_HALLS',
  MOST_CROWDED_STUDY_AREA = 'MOST_CROWDED_STUDY_AREA',
  TODAY_SUMMARY = 'TODAY_SUMMARY',
  UNKNOWN = 'UNKNOWN',
}

export type UserRole = 'admin' | 'student' | 'volunteer' | 'unknown'

export interface ChatbotContext {
  studentId?: string
  role?: UserRole | string
}

export interface IntentEntities {
  complaintId?: number
  hallQuery?: string
  asksMyComplaintStatus?: boolean
}

export interface IntentDetectionResult {
  intent: ChatbotIntent
  confidence: number
  normalizedMessage: string
  entities: IntentEntities
}

export interface ChatbotRequestBody {
  message?: string
  context?: ChatbotContext
}

export interface ChatbotReply {
  intent: ChatbotIntent
  response: string
  confidence: number
}

export interface ComplaintStatusItem {
  complaintId: number
  status: string
  issueCategory: string
  createdAt: Date | null
}

export interface ComplaintSummary {
  total: number
  pending: number
  viewed: number
  inProgress: number
  resolved: number
}

export interface TodaySummary extends ComplaintSummary {
  createdToday: number
}

export interface HallCountInfo {
  hallId: string
  hallName: string
  complaintCount: number
}

export interface CrowdedStudyAreaInfo {
  studyAreaId: string
  areaName: string
  currentCount: number
  capacity: number
  occupancyPercentage: number
}

export interface FreeHallInfo {
  hallId: string
  hallName: string
  building: string | null
  floor: number | null
}

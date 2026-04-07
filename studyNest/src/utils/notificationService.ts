import { ComplaintNotification } from '@/contexts/NotificationContext'

type ComplaintLike = {
  complaint_id: number
  issue_category: string
  description: string
  complaint_count?: number
  lecture_halls?: { hall_name?: string } | null
  study_areas?: { area_name?: string } | null
  hall_id?: string | null
  study_area_id?: string | null
}

export function buildComplaintNotification(
  complaint: ComplaintLike
): Omit<ComplaintNotification, 'id' | 'timestamp' | 'isRead'> {
  const location =
    complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name || 'Unknown location'

  const isHall = Boolean(complaint.lecture_halls?.hall_name)
  const title = isHall
    ? `New complaint submitted for Hall ${location}`
    : `${complaint.issue_category} issue reported in ${location}`

  return {
    complaint_id: complaint.complaint_id,
    title,
    location,
    category: complaint.issue_category,
    description: complaint.description,
    isImmediateFix: (complaint.complaint_count || 0) > 10,
    hall_id: complaint.hall_id ?? undefined,
    study_area_id: complaint.study_area_id ?? undefined,
  }
}

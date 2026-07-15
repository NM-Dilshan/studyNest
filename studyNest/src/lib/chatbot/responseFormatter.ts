import {
  ChatbotIntent,
  ComplaintStatusItem,
  ComplaintSummary,
  CrowdedStudyAreaInfo,
  FreeHallInfo,
  HallCountInfo,
  TodaySummary,
} from './types'

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

function formatComplaintStatus(item: ComplaintStatusItem): string {
  const created = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'unknown date'
  return `Complaint #${item.complaintId} is ${item.status}. Category: ${item.issueCategory}. Created: ${created}.`
}

export function fallbackResponse(): string {
  return 'I can help with complaint summaries, hall complaints, complaint status, free lecture halls, and study area information.'
}

export function formatMostComplainedHall(info: HallCountInfo | null): string {
  if (!info) {
    return 'I could not find hall complaint data yet.'
  }

  return `The most complained lecture hall is ${info.hallName} with ${formatNumber(info.complaintCount)} complaint(s).`
}

export function formatComplaintSummary(summary: ComplaintSummary): string {
  return [
    'Complaint summary:',
    `- Total: ${formatNumber(summary.total)}`,
    `- Pending: ${formatNumber(summary.pending)}`,
    `- Viewed: ${formatNumber(summary.viewed)}`,
    `- In Progress: ${formatNumber(summary.inProgress)}`,
    `- Resolved: ${formatNumber(summary.resolved)}`,
  ].join('\n')
}

export function formatPendingCount(count: number): string {
  return `There are ${formatNumber(count)} pending complaint(s).`
}

export function formatResolvedCount(count: number): string {
  return `There are ${formatNumber(count)} resolved complaint(s).`
}

export function formatComplaintStatusById(item: ComplaintStatusItem | null): string {
  if (!item) {
    return 'I could not find that complaint ID. Please check the number and try again.'
  }

  return formatComplaintStatus(item)
}

export function formatMyComplaintStatus(items: ComplaintStatusItem[]): string {
  if (items.length === 0) {
    return 'I could not find complaints for your student account yet.'
  }

  return ['Your latest complaint statuses:', ...items.map((item) => `- ${formatComplaintStatus(item)}`)].join('\n')
}

export function formatComplaintsByHall(info: HallCountInfo | null): string {
  if (!info) {
    return 'I could not find that lecture hall. Try using a hall code like G0202 or the hall name.'
  }

  return `${info.hallName} has ${formatNumber(info.complaintCount)} complaint(s).`
}

export function formatFreeLectureHalls(items: FreeHallInfo[]): string {
  if (items.length === 0) {
    return 'I could not find free lecture halls right now.'
  }

  const lines = items.map((hall) => {
    const floorLabel = hall.floor === null ? 'N/A' : hall.floor
    return `- ${hall.hallName} (${hall.building || 'Unknown Building'}, Floor ${floorLabel})`
  })

  return ['Free lecture halls right now:', ...lines].join('\n')
}

export function formatMostCrowdedStudyArea(info: CrowdedStudyAreaInfo | null): string {
  if (!info) {
    return 'I could not find live study area occupancy data yet.'
  }

  return `${info.areaName} is the most crowded study area now with ${formatNumber(info.currentCount)} students (${info.occupancyPercentage}% occupancy).`
}

export function formatTodaySummary(summary: TodaySummary): string {
  return [
    "Today's complaint summary:",
    `- Created today: ${formatNumber(summary.createdToday)}`,
    `- Pending: ${formatNumber(summary.pending)}`,
    `- Viewed: ${formatNumber(summary.viewed)}`,
    `- In Progress: ${formatNumber(summary.inProgress)}`,
    `- Resolved: ${formatNumber(summary.resolved)}`,
  ].join('\n')
}

export function formatMissingComplaintId(): string {
  return 'Please share the complaint ID. Example: "status of complaint #123".'
}

export function formatMissingHallName(): string {
  return 'Please provide the hall name or code. Example: "show complaints for Hall G0202".'
}

export function formatRoleRestricted(intent: ChatbotIntent): string {
  if (intent === ChatbotIntent.COMPLAINT_SUMMARY || intent === ChatbotIntent.TODAY_SUMMARY) {
    return 'Detailed analytics are available for admin users. Students can ask about their complaint status and free halls.'
  }

  return fallbackResponse()
}

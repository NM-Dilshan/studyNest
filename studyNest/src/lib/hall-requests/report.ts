import type { jsPDF } from 'jspdf'
import type { UserOptions } from 'jspdf-autotable'

export interface HallRequestReportResponse {
  update_id: string
  responder_id: string
  availability_status: string
  occupancy_level: string
  available_seats?: number | null
  volunteer_note?: string | null
  confidence_level?: string | null
  created_at: string
  expires_at?: string | null
  responder?: {
    user_id: string
    name: string
    volunteer_id?: string | null
  } | null
}

export interface HallRequestReportData {
  request_id: string
  request_note?: string | null
  request_status: string
  created_at: string
  updated_at: string
  expires_at?: string | null
  lecture_halls: {
    hall_name: string
    building?: string | null
    floor?: number | null
    capacity?: number | null
  }
  hall_request_updates: HallRequestReportResponse[]
}

interface BuiltRequestReportData {
  title: string
  requestDetails: Array<[string, string]>
  summary: Array<[string, string]>
  responses: Array<{
    responder: string
    availability: string
    occupancy: string
    seats: string
    confidence: string
    responded: string
    expiry: string
    note: string
    isExpired: boolean
  }>
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type AutoTableDoc = jsPDF & { lastAutoTable?: { finalY: number } }

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return dateFormatter.format(new Date(value))
}

function formatText(value?: string | null) {
  if (!value || !value.trim()) {
    return 'N/A'
  }

  return value.trim()
}

function isExpiredResponse(response: HallRequestReportResponse, now = new Date()) {
  return Boolean(response.expires_at && new Date(response.expires_at) < now)
}

function getResponderLabel(response: HallRequestReportResponse) {
  const name = response.responder?.name?.trim()
  if (name) {
    return response.responder?.volunteer_id
      ? `${name} (${response.responder.volunteer_id})`
      : name
  }

  return response.responder_id
}

function getConfidenceScore(level?: string | null) {
  switch ((level || '').toLowerCase()) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

function getAvailabilityScore(status: string) {
  switch (status.toLowerCase()) {
    case 'free':
      return 3
    case 'partially busy':
      return 2
    case 'busy':
      return 1
    default:
      return 0
  }
}

function getBestAvailableResponse(responses: HallRequestReportResponse[]) {
  const activeResponses = responses.filter((response) => !isExpiredResponse(response))

  if (activeResponses.length === 0) {
    return null
  }

  return [...activeResponses].sort((left, right) => {
    const availabilityDiff = getAvailabilityScore(right.availability_status) - getAvailabilityScore(left.availability_status)
    if (availabilityDiff !== 0) {
      return availabilityDiff
    }

    const seatsDiff = (right.available_seats ?? -1) - (left.available_seats ?? -1)
    if (seatsDiff !== 0) {
      return seatsDiff
    }

    const confidenceDiff = getConfidenceScore(right.confidence_level) - getConfidenceScore(left.confidence_level)
    if (confidenceDiff !== 0) {
      return confidenceDiff
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0]
}

function buildSummaryRows(request: HallRequestReportData) {
  const anyExpired = request.hall_request_updates.some((response) => isExpiredResponse(response))
  const latestResponse = request.hall_request_updates[0]
  const bestResponse = getBestAvailableResponse(request.hall_request_updates)

  return [
    ['Total responses', request.hall_request_updates.length.toString()],
    ['Latest response', latestResponse ? formatDateTime(latestResponse.created_at) : 'No responses yet'],
    ['Any response expired', anyExpired ? 'Yes' : 'No'],
    [
      'Best available response',
      bestResponse
        ? `${getResponderLabel(bestResponse)} | ${bestResponse.availability_status} | ${bestResponse.occupancy_level} | ${bestResponse.available_seats ?? 'N/A'} seats`
        : 'No active response available',
    ],
  ] as Array<[string, string]>
}

function buildResponsesRows(request: HallRequestReportData) {
  return request.hall_request_updates.map((response) => ({
    responder: getResponderLabel(response),
    availability: response.availability_status,
    occupancy: response.occupancy_level,
    seats: response.available_seats === null || response.available_seats === undefined ? 'N/A' : response.available_seats.toString(),
    confidence: response.confidence_level || 'N/A',
    responded: formatDateTime(response.created_at),
    expiry: response.expires_at ? formatDateTime(response.expires_at) : 'No expiry',
    note: formatText(response.volunteer_note),
    isExpired: isExpiredResponse(response),
  }))
}

export function buildRequestReportData(request: HallRequestReportData): BuiltRequestReportData {
  return {
    title: 'Hall Request Response Report',
    requestDetails: [
      ['Request ID', request.request_id],
      ['Hall name', request.lecture_halls.hall_name],
      ['Building', formatText(request.lecture_halls.building)],
      ['Floor', request.lecture_halls.floor?.toString() ?? 'N/A'],
      ['Capacity', request.lecture_halls.capacity?.toString() ?? 'N/A'],
      ['Request note', formatText(request.request_note)],
      ['Request status', request.request_status],
      ['Created time', formatDateTime(request.created_at)],
      ['Updated time', formatDateTime(request.updated_at)],
    ],
    summary: buildSummaryRows(request),
    responses: buildResponsesRows(request),
  }
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

function getFilteredRequest(
  request: HallRequestReportData,
  options?: {
    responseId?: string
  },
) {
  if (!options?.responseId) {
    return request
  }

  const matchedResponse = request.hall_request_updates.find((response) => response.update_id === options.responseId)

  if (!matchedResponse) {
    throw new Error('Requested hall response not found')
  }

  return {
    ...request,
    hall_request_updates: [matchedResponse],
  }
}

export async function generateHallRequestPdf(
  request: HallRequestReportData,
  options?: {
    responseId?: string
  },
) {
  const [{ default: JsPdf }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const sourceRequest = getFilteredRequest(request, options)
  const reportData = buildRequestReportData(sourceRequest)
  const isSingleResponseReport = Boolean(options?.responseId)
  const doc: AutoTableDoc = new JsPdf({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  }) as AutoTableDoc

  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 40
  let cursorY = 48

  doc.setFillColor(17, 24, 39)
  doc.roundedRect(marginX, cursorY, pageWidth - marginX * 2, 74, 18, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(reportData.title, marginX + 18, cursorY + 28)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Generated ${formatDateTime(new Date().toISOString())}`, marginX + 18, cursorY + 48)
  doc.text(sourceRequest.lecture_halls.hall_name, marginX + 18, cursorY + 64)

  cursorY += 98

  const addSectionHeading = (title: string) => {
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(title, marginX, cursorY)
    cursorY += 10
  }

  const baseTableStyles: Partial<UserOptions> = {
    margin: { left: marginX, right: marginX },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
      textColor: [31, 41, 55],
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
  }

  addSectionHeading('Request Details')
  autoTable(doc, {
    ...baseTableStyles,
    startY: cursorY,
    body: reportData.requestDetails,
    theme: 'grid',
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 120 },
      1: { cellWidth: 'auto' },
    },
  })
  cursorY = doc.lastAutoTable?.finalY ?? cursorY
  cursorY += 24

  addSectionHeading('Summary')
  autoTable(doc, {
    ...baseTableStyles,
    startY: cursorY,
    body: reportData.summary,
    theme: 'grid',
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 145 },
      1: { cellWidth: 'auto' },
    },
  })
  cursorY = doc.lastAutoTable?.finalY ?? cursorY
  cursorY += 24

  addSectionHeading(isSingleResponseReport ? 'Volunteer Response' : `Volunteer Responses (${reportData.responses.length})`)
  autoTable(doc, {
    ...baseTableStyles,
    startY: cursorY,
    head: [['Responder', 'Availability', 'Occupancy', 'Seats', 'Confidence', 'Responded', 'Expiry', 'Volunteer note']],
    body: reportData.responses.length
      ? reportData.responses.map((response) => [
          response.isExpired ? `${response.responder} (Expired)` : response.responder,
          response.availability,
          response.occupancy,
          response.seats,
          response.confidence,
          response.responded,
          response.expiry,
          response.note,
        ])
      : [['No volunteer responses recorded for this request yet.', '', '', '', '', '', '', '']],
    theme: 'grid',
    styles: {
      ...baseTableStyles.styles,
      minCellHeight: 22,
    },
    columnStyles: {
      0: { cellWidth: 84 },
      1: { cellWidth: 62 },
      2: { cellWidth: 58 },
      3: { cellWidth: 38, halign: 'center' },
      4: { cellWidth: 54 },
      5: { cellWidth: 72 },
      6: { cellWidth: 70 },
      7: { cellWidth: 'auto' },
    },
  })

  const safeHallName = sanitizeFilePart(sourceRequest.lecture_halls.hall_name)
  const suffix = isSingleResponseReport
    ? `response-${sourceRequest.hall_request_updates[0]?.update_id.slice(0, 8) || 'single'}`
    : 'responses-report'
  doc.save(`${safeHallName || 'hall-request'}-${sourceRequest.request_id.slice(0, 8)}-${suffix}.pdf`)
}

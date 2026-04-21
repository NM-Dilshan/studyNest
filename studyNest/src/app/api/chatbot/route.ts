import { NextRequest, NextResponse } from 'next/server'
import { detectIntent } from '@/lib/chatbot/intentDetection'
import {
  fallbackResponse,
  formatComplaintStatusById,
  formatComplaintSummary,
  formatComplaintsByHall,
  formatFreeLectureHalls,
  formatMissingComplaintId,
  formatMissingHallName,
  formatMostComplainedHall,
  formatMostCrowdedStudyArea,
  formatMyComplaintStatus,
  formatPendingCount,
  formatResolvedCount,
  formatTodaySummary,
} from '@/lib/chatbot/responseFormatter'
import {
  getComplaintStatusById,
  getComplaintSummary,
  getComplaintsByHall,
  getFreeLectureHalls,
  getMostComplainedHall,
  getMostCrowdedStudyArea,
  getMyLatestComplaintStatuses,
  getPendingCount,
  getResolvedCount,
  getTodaySummary,
} from '@/lib/chatbot/queries'
import {
  ChatbotIntent,
  ChatbotReply,
  ChatbotRequestBody,
  ChatbotContext,
  UserRole,
} from '@/lib/chatbot/types'

function normalizeRole(role?: string): UserRole {
  const value = (role || '').trim().toLowerCase()
  if (value === 'admin' || value === 'student' || value === 'volunteer') {
    return value
  }
  return 'unknown'
}

async function buildReply(
  message: string,
  context?: ChatbotContext
): Promise<ChatbotReply> {
  const detection = detectIntent(message)
  const role = normalizeRole(context?.role)
  const studentId = (context?.studentId || '').trim()

  switch (detection.intent) {
    case ChatbotIntent.MOST_COMPLAINED_HALL: {
      const hall = await getMostComplainedHall()
      return {
        intent: detection.intent,
        response: formatMostComplainedHall(hall),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.COMPLAINT_SUMMARY: {
      const summary = await getComplaintSummary()
      return {
        intent: detection.intent,
        response: formatComplaintSummary(summary),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.PENDING_COUNT: {
      const count = await getPendingCount()
      return {
        intent: detection.intent,
        response: formatPendingCount(count),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.RESOLVED_COUNT: {
      const count = await getResolvedCount()
      return {
        intent: detection.intent,
        response: formatResolvedCount(count),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.COMPLAINT_STATUS_BY_ID: {
      if (detection.entities.complaintId) {
        const item = await getComplaintStatusById(detection.entities.complaintId)
        return {
          intent: detection.intent,
          response: formatComplaintStatusById(item),
          confidence: detection.confidence,
        }
      }

      if (detection.entities.asksMyComplaintStatus || message.toLowerCase().includes('my complaint')) {
        if (!studentId) {
          return {
            intent: detection.intent,
            response: 'Please sign in as a student to check your complaint status.',
            confidence: detection.confidence,
          }
        }

        const myStatuses = await getMyLatestComplaintStatuses(studentId)
        return {
          intent: detection.intent,
          response: formatMyComplaintStatus(myStatuses),
          confidence: detection.confidence,
        }
      }

      return {
        intent: detection.intent,
        response: formatMissingComplaintId(),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.MY_COMPLAINT_STATUS: {
      if (!studentId) {
        return {
          intent: detection.intent,
          response: 'Please sign in as a student to check your complaint status.',
          confidence: detection.confidence,
        }
      }

      const myStatuses = await getMyLatestComplaintStatuses(studentId)
      return {
        intent: detection.intent,
        response: formatMyComplaintStatus(myStatuses),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.COMPLAINTS_BY_HALL: {
      const hallQuery = detection.entities.hallQuery
      if (!hallQuery) {
        return {
          intent: detection.intent,
          response: formatMissingHallName(),
          confidence: detection.confidence,
        }
      }

      const info = await getComplaintsByHall(hallQuery)
      return {
        intent: detection.intent,
        response: formatComplaintsByHall(info),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.FREE_LECTURE_HALLS: {
      const halls = await getFreeLectureHalls(6)
      return {
        intent: detection.intent,
        response: formatFreeLectureHalls(halls),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.MOST_CROWDED_STUDY_AREA: {
      const area = await getMostCrowdedStudyArea()
      return {
        intent: detection.intent,
        response: formatMostCrowdedStudyArea(area),
        confidence: detection.confidence,
      }
    }

    case ChatbotIntent.TODAY_SUMMARY: {
      const summary = await getTodaySummary()
      return {
        intent: detection.intent,
        response: formatTodaySummary(summary),
        confidence: detection.confidence,
      }
    }

    default:
      return {
        intent: ChatbotIntent.UNKNOWN,
        response: fallbackResponse(),
        confidence: 0,
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatbotRequestBody
    const message = String(body.message || '').trim()

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required',
        },
        { status: 400 }
      )
    }

    const result = await buildReply(message, body.context)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      {
        success: false,
        intent: ChatbotIntent.UNKNOWN,
        confidence: 0,
        response: 'I ran into an issue while checking complaint data. Please try again.',
      },
      { status: 500 }
    )
  }
}

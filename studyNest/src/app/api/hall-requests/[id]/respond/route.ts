import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/hall-requests/[id]/respond
 * Submit a response/update to a hall request
 * Body: {
 *   responderId,
 *   availabilityStatus,
 *   occupancyLevel,
 *   availableSeats,
 *   volunteerNote,
 *   confidenceLevel,
 *   expiryMinutes
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const body = await request.json()
    const {
      responderId,
      availabilityStatus,
      occupancyLevel,
      availableSeats,
      volunteerNote,
      confidenceLevel,
      expiryMinutes = 60,
    } = body

    // Validate required fields
    const missingFields = [];
    if (!requestId) missingFields.push('requestId');
    if (!responderId) missingFields.push('responderId');
    if (!availabilityStatus) missingFields.push('availabilityStatus');
    if (!occupancyLevel) missingFields.push('occupancyLevel');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields', 
          missingFields,
          received: { requestId, responderId, availabilityStatus, occupancyLevel }
        },
        { status: 400 }
      )
    }

    // Validate available seats
    if (availableSeats !== null && availableSeats !== undefined) {
      if (availableSeats < 0) {
        return NextResponse.json(
          { success: false, error: 'Available seats cannot be negative' },
          { status: 400 }
        )
      }
    }

    // Check if request exists and is still active
    const hallRequest = await prisma.hall_requests.findUnique({
      where: { request_id: requestId },
      include: {
        lecture_halls: {
          select: { capacity: true },
        },
      },
    })

    if (!hallRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    if (hallRequest.request_status === 'Closed') {
      return NextResponse.json(
        { success: false, error: 'This request has been closed' },
        { status: 400 }
      )
    }

    // Validate available seats vs capacity
    if (hallRequest.lecture_halls?.capacity && availableSeats !== null) {
      if (availableSeats > hallRequest.lecture_halls.capacity) {
        return NextResponse.json(
          { success: false, error: 'Available seats cannot exceed hall capacity' },
          { status: 400 }
        )
      }
    }

    // Validate occupancy and seats consistency
    if (occupancyLevel === 'Full' && availableSeats !== 0 && availableSeats !== null) {
      return NextResponse.json(
        { success: false, error: 'If hall is Full, available seats must be 0' },
        { status: 400 }
      )
    }

    // Create the response update
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)
    const hallUpdate = await prisma.hall_request_updates.create({
      data: {
        request_id: requestId,
        responder_id: responderId,
        availability_status: availabilityStatus,
        occupancy_level: occupancyLevel,
        available_seats: availableSeats || null,
        volunteer_note: volunteerNote || null,
        confidence_level: confidenceLevel || 'Medium',
        expires_at: expiresAt,
      },
      include: {
        responder: {
          select: {
            user_id: true,
            name: true,
            volunteer_id: true,
          },
        },
      },
    })

    // Update request status to 'Responded'
    await prisma.hall_requests.update({
      where: { request_id: requestId },
      data: { request_status: 'Responded' },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Response submitted successfully',
        data: hallUpdate,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting response:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit response', details: errorMsg },
      { status: 500 }
    )

  }
}

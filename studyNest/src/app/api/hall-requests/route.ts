import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/hall-requests
 * Create a new hall information request
 * Body: { hallId, note, userId, userRole, userIdNumber }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hallId, note, userId, userRole, userIdNumber } = body

    // Validate required fields
    if (!hallId || !userId || !userRole || !userIdNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate note length
    if (note && note.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Note must be 300 characters or less' },
        { status: 400 }
      )
    }

    // Check for duplicate active request within 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const existingRequest = await prisma.hall_requests.findFirst({
      where: {
        requester_id: userId,
        hall_id: hallId,
        request_status: 'Pending',
        created_at: {
          gte: fifteenMinutesAgo,
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending request for this hall. Please wait before sending another.' },
        { status: 409 }
      )
    }

    // Create the request
    const hallRequest = await prisma.hall_requests.create({
      data: {
        requester_id: userId,
        requester_role: userRole,
        requester_id_number: userIdNumber,
        hall_id: hallId,
        request_note: note || null,
        request_status: 'Pending',
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour expiry
      },
      include: {
        requester: {
          select: {
            user_id: true,
            name: true,
            student_id: true,
            volunteer_id: true,
            role: true,
          },
        },
        lecture_halls: {
          select: {
            hall_id: true,
            hall_name: true,
            building: true,
            capacity: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Request created successfully',
        data: hallRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating hall request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET /api/hall-requests
 * Fetch all pending requests (for volunteer dashboard)
 * Query params: ?skip=0&take=20&status=Pending
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '20')
    const status = searchParams.get('status') || 'Pending'

    const requests = await prisma.hall_requests.findMany({
      where: {
        request_status: status,
      },
      include: {
        requester: {
          select: {
            user_id: true,
            name: true,
            student_id: true,
            volunteer_id: true,
            role: true,
          },
        },
        lecture_halls: {
          select: {
            hall_id: true,
            hall_name: true,
            building: true,
            floor: true,
            capacity: true,
          },
        },
        hall_request_updates: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
          select: {
            update_id: true,
            availability_status: true,
            occupancy_level: true,
            available_seats: true,
            volunteer_note: true,
            confidence_level: true,
            created_at: true,
            expires_at: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take,
    })

    const total = await prisma.hall_requests.count({
      where: { request_status: status },
    })

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        skip,
        take,
        total,
        hasMore: skip + take < total,
      },
    })
  } catch (error) {
    console.error('Error fetching hall requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

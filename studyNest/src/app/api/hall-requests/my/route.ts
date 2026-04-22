import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * GET /api/hall-requests/my
 * Fetch user's own hall requests
 * Query params: ?userId=<id>&skip=0&take=20
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '20')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!UUID_PATTERN.test(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const requests = await prisma.hall_requests.findMany({
      where: {
        requester_id: userId,
      },
      include: {
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
          orderBy: {
            created_at: 'desc',
          },
          select: {
            update_id: true,
            responder_id: true,
            availability_status: true,
            occupancy_level: true,
            available_seats: true,
            volunteer_note: true,
            confidence_level: true,
            created_at: true,
            expires_at: true,
            responder: {
              select: {
                user_id: true,
                name: true,
                volunteer_id: true,
              },
            },
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
      where: { requester_id: userId },
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
    console.error('Error fetching user requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch your requests' },
      { status: 500 }
    )
  }
}

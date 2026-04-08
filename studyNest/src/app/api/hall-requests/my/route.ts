import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Fetch responder details for all updates
    const responderIds = new Set<string>()
    requests.forEach(req => {
      req.hall_request_updates.forEach(update => {
        responderIds.add(update.responder_id)
      })
    })

    const responders = responderIds.size > 0
      ? await prisma.users.findMany({
          where: { user_id: { in: Array.from(responderIds) } },
          select: { user_id: true, name: true, volunteer_id: true },
        })
      : []

    const responderMap = new Map(responders.map(r => [r.user_id, r]))

    // Map responder data to updates
    const enrichedRequests = requests.map(req => ({
      ...req,
      hall_request_updates: req.hall_request_updates.map(update => ({
        ...update,
        responder: responderMap.get(update.responder_id) || null,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: enrichedRequests,
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

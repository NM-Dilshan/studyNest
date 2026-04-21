import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lecture-halls/resolve
 * Resolve a lecture hall code to a full hall record
 * Used when user manually types a hall code instead of selecting from dropdown
 *
 * Query params:
 * - code (required): the hall code to look up (e.g., "F0201")
 *
 * Response:
 * - If found: { success: true, hall: { hall_id, hall_name, building, floor, capacity } }
 * - If not found: { success: false, message: "Lecture hall code not found" }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase().trim()

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Hall code is required' },
        { status: 400 }
      )
    }

    // Try to find the hall by exact hall_name match
    const hall = await prisma.lecture_halls.findUnique({
      where: {
        hall_name: code,
      },
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        floor: true,
        capacity: true,
        is_active: true,
      },
    })

    if (!hall) {
      return NextResponse.json(
        { success: false, message: 'Lecture hall code not found' },
        { status: 404 }
      )
    }

    if (!hall.is_active) {
      return NextResponse.json(
        { success: false, message: 'Lecture hall is no longer active' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      hall,
    })
  } catch (error) {
    console.error('Error resolving lecture hall:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to resolve lecture hall' },
      { status: 500 }
    )
  }
}

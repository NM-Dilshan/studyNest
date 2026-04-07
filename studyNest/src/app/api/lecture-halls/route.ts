import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lecture-halls
 * Fetch all active lecture halls for dropdown selection
 * Query params:
 * - activeOnly (optional, default true): only return active halls
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const query: any = {
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        floor: true,
        capacity: true,
        hall_type: true,
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { hall_name: 'asc' },
      ],
    }

    if (activeOnly) {
      query.where = {
        is_active: true,
      }
    }

    const halls = await prisma.lecture_halls.findMany(query)

    return NextResponse.json({
      success: true,
      count: halls.length,
      halls,
    })
  } catch (error) {
    console.error('Error fetching lecture halls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lecture halls' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lecture-halls
 * Create a new lecture hall
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hall_name, building, floor, capacity, hall_type } = body

    // Validation
    if (!hall_name || !building || floor === undefined || !capacity || !hall_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newHall = await prisma.lecture_halls.create({
      data: {
        hall_name,
        building,
        floor: parseInt(floor, 10),
        capacity: parseInt(capacity, 10),
        hall_type,
        is_active: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Lecture hall created successfully',
        hall: newHall,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lecture hall:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lecture hall' },
      { status: 500 }
    )
  }
}

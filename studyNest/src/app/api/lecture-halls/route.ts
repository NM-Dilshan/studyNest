import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type LectureHallListItem = {
  hall_id: string
  hall_name: string
  building: string | null
  block: string | null
  floor: number | null
}

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

async function getPrismaClient() {
  try {
    const prismaModule = await import('@/lib/prisma')
    return prismaModule.prisma
  } catch (error) {
    console.error('Failed to initialize Prisma client for /api/lecture-halls:', error)
    return null
  }
}

const VALID_STATUSES = new Set([
  'available',
  'under_maintenance',
  'reserved_exam',
  'reserved_event',
  'closed',
])

interface LectureHallPayload {
  hall_name?: unknown
  building?: unknown
  block?: unknown
  floor?: unknown
  hall_number?: unknown
  capacity?: unknown
  hall_type?: unknown
  projector?: unknown
  wifi?: unknown
  ac?: unknown
  whiteboard?: unknown
  maintenance_status?: unknown
  is_active?: unknown
}

function parseNullableInt(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
      return true
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
      return false
    }
  }

  // Keep Boolean(...) style for checkbox-like values.
  return Boolean(value)
}

function normalizeStatus(value: unknown): string {
  const normalized = String(value || 'available').trim().toLowerCase()
  return VALID_STATUSES.has(normalized) ? normalized : 'available'
}

/**
 * GET /api/lecture-halls
 * Fetch all active lecture halls for dropdown selection
 * Query params:
 * - activeOnly (optional, default true): only return active halls
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    if (!prisma) {
      return jsonError('Database is not configured. Check DATABASE_URL environment variable.', 500)
    }

    const { searchParams } = request.nextUrl
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const halls = (await prisma.lecture_halls.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        block: true,
        floor: true,
      },
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { hall_name: 'asc' }],
    })) as LectureHallListItem[]

    // Keep both keys for frontend compatibility: data.halls || data.data
    return NextResponse.json({
      success: true,
      halls,
      data: halls,
      count: halls.length,
    })
  } catch (error) {
    console.error('Error in GET /api/lecture-halls:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    })
    return jsonError('Failed to fetch lecture halls', 500)
  }
}

/**
 * POST /api/lecture-halls
 * Create a new lecture hall
 */
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    if (!prisma) {
      return jsonError('Database is not configured. Check DATABASE_URL environment variable.', 500)
    }

    const body = (await request.json()) as LectureHallPayload
    const hallName = String(body.hall_name || '').trim()
    const building = String(body.building || '').trim()

    // Validation
    if (!hallName || !building) {
      return NextResponse.json(
        { error: 'Hall name and building are required' },
        { status: 400 }
      )
    }

    const duplicate = await prisma.lecture_halls.findUnique({
      where: { hall_name: hallName },
      select: { hall_id: true },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Hall name already exists' },
        { status: 409 }
      )
    }

    const floor = parseNullableInt(body.floor)
    const capacity = parseNullableInt(body.capacity)
    if (body.floor !== undefined && body.floor !== null && body.floor !== '' && floor === null) {
      return NextResponse.json(
        { error: 'Floor must be a valid number' },
        { status: 400 }
      )
    }

    if (body.capacity !== undefined && body.capacity !== null && body.capacity !== '' && capacity === null) {
      return NextResponse.json(
        { error: 'Capacity must be a valid number' },
        { status: 400 }
      )
    }

    const newHall = await prisma.lecture_halls.create({
      data: {
        hall_name: hallName,
        building,
        block: body.block ? String(body.block).trim() : null,
        floor,
        hall_number: body.hall_number ? String(body.hall_number).trim() : null,
        capacity,
        hall_type: body.hall_type ? String(body.hall_type).trim() : 'lecture_hall',
        projector: parseBoolean(body.projector),
        wifi: parseBoolean(body.wifi),
        ac: parseBoolean(body.ac),
        whiteboard: parseBoolean(body.whiteboard),
        maintenance_status: normalizeStatus(body.maintenance_status),
        is_active: body.is_active == null ? true : parseBoolean(body.is_active),
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
    console.error('Error in POST /api/lecture-halls:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    })
    return jsonError(error instanceof Error ? error.message : 'Failed to create lecture hall', 500)
  }
}

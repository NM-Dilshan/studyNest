import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type LectureHallListItem = {
  hall_id: string
  hall_name: string
  building: string | null
  block: string | null
  floor: number | null
  capacity: number | null
  hall_type: string | null
  maintenance_status: string | null
  is_active: boolean | null
  projector: boolean | null
  wifi: boolean | null
  ac: boolean | null
  whiteboard: boolean | null
}

type LectureHallCreatedItem = {
  hall_id: string
  hall_name: string
}

type TimetableUnassignedItem = {
  timetable_id: number
  raw_hall_name: string | null
}

type LectureHallModel = {
  findMany: (args?: unknown) => Promise<LectureHallListItem[]>
  findUnique: (args: unknown) => Promise<{ hall_id: string } | null>
  create: (args: unknown) => Promise<LectureHallCreatedItem>
}

type TimetableModel = {
  findMany: (args?: unknown) => Promise<TimetableUnassignedItem[]>
  updateMany: (args: unknown) => Promise<{ count: number }>
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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
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

function getLectureHallModel(prisma: unknown): LectureHallModel | null {
  const model = (prisma as { lecture_halls?: unknown })?.lecture_halls
  if (!model || typeof model !== 'object') {
    return null
  }

  const delegate = model as Partial<LectureHallModel>
  if (
    typeof delegate.findMany !== 'function' ||
    typeof delegate.findUnique !== 'function' ||
    typeof delegate.create !== 'function'
  ) {
    return null
  }

  return delegate as LectureHallModel
}

function getTimetableModel(prisma: unknown): TimetableModel | null {
  const model = (prisma as { timetable?: unknown })?.timetable
  if (!model || typeof model !== 'object') {
    return null
  }

  const delegate = model as Partial<TimetableModel>
  if (typeof delegate.findMany !== 'function' || typeof delegate.updateMany !== 'function') {
    return null
  }

  return delegate as TimetableModel
}

function normalizeHallKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
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

    const lectureHallModel = getLectureHallModel(prisma)
    if (!lectureHallModel) {
      return jsonError(
        'Prisma model "lecture_halls" is unavailable. Verify schema model name and run prisma generate.',
        500
      )
    }

    const { searchParams } = request.nextUrl
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const halls = await lectureHallModel.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        block: true,
        floor: true,
        capacity: true,
        hall_type: true,
        maintenance_status: true,
        is_active: true,
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
      },
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { hall_name: 'asc' }],
    })

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
    return jsonError('Failed to fetch lecture halls', 500, getErrorMessage(error, 'Unknown error'))
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

    const lectureHallModel = getLectureHallModel(prisma)
    if (!lectureHallModel) {
      return jsonError(
        'Prisma model "lecture_halls" is unavailable. Verify schema model name and run prisma generate.',
        500
      )
    }

    const timetableModel = getTimetableModel(prisma)
    if (!timetableModel) {
      return jsonError(
        'Prisma model "timetable" is unavailable. Verify schema model name and run prisma generate.',
        500
      )
    }

    const body = (await request.json()) as LectureHallPayload
    const hallName = String(body.hall_name || '').trim()
    const building = String(body.building || '').trim()

    // Validation
    if (!hallName || !building) {
      return jsonError('Hall name and building are required', 400)
    }

    const duplicate = await lectureHallModel.findUnique({
      where: { hall_name: hallName },
      select: { hall_id: true },
    })

    if (duplicate) {
      return jsonError('Hall name already exists', 409)
    }

    const floor = parseNullableInt(body.floor)
    const capacity = parseNullableInt(body.capacity)
    if (body.floor !== undefined && body.floor !== null && body.floor !== '' && floor === null) {
      return jsonError('Floor must be a valid number', 400)
    }

    if (body.capacity !== undefined && body.capacity !== null && body.capacity !== '' && capacity === null) {
      return jsonError('Capacity must be a valid number', 400)
    }

    const newHall = await lectureHallModel.create({
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

    // Auto-assign previously unassigned CSV rows that referenced this hall name.
    const targetKey = normalizeHallKey(hallName)
    const unassignedRows = await timetableModel.findMany({
      where: {
        hall_id: null,
        raw_hall_name: {
          not: null,
        },
      },
      select: {
        timetable_id: true,
        raw_hall_name: true,
      },
    })

    const matchingIds = unassignedRows
      .filter((row) => row.raw_hall_name && normalizeHallKey(row.raw_hall_name) === targetKey)
      .map((row) => row.timetable_id)

    let autoAssignedCount = 0
    if (matchingIds.length > 0) {
      const updateResult = await timetableModel.updateMany({
        where: {
          timetable_id: {
            in: matchingIds,
          },
        },
        data: {
          hall_id: newHall.hall_id,
          raw_hall_name: null,
        },
      })
      autoAssignedCount = updateResult.count
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lecture hall created successfully',
        auto_assigned_count: autoAssignedCount,
        hall: newHall,
        data: newHall,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/lecture-halls:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    })
    return jsonError('Failed to create lecture hall', 500, getErrorMessage(error, 'Unknown error'))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '../../../lib/prisma'

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
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const query: Prisma.lecture_hallsFindManyArgs = {
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        block: true,
        floor: true,
        hall_number: true,
        capacity: true,
        hall_type: true,
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        maintenance_status: true,
        is_active: true,
        created_at: true,
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
    console.error('Error creating lecture hall:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lecture hall' },
      { status: 500 }
    )
  }
}

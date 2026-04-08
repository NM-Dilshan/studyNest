import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function jsonSuccess(payload, status = 200) {
  return NextResponse.json({ success: true, ...payload }, { status })
}

function jsonError(message, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}

const ALLOWED_HALL_TYPES = new Set(['lecture_hall', 'lab'])
const ALLOWED_MAINTENANCE = new Set(['available', 'under_maintenance', 'reserved_exam', 'reserved_event', 'closed'])

function normalizeString(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

async function parseRequestBody(request) {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Request body must be valid JSON')
  }
}

// GET all lecture halls
export async function GET() {
  try {
    const halls = await prisma.lecture_halls.findMany({
      orderBy: { created_at: 'desc' },
    })

    return jsonSuccess({ data: halls })
  } catch (error) {
    console.error('[GET /api/lecture-halls]', error)
    return jsonError(error?.message || 'Failed to fetch lecture halls')
  }
}

// POST create lecture hall
export async function POST(request) {
  try {
    const body = await parseRequestBody(request)

    const building = normalizeString(body.building)
    const block = normalizeString(body.block).toUpperCase()
    const hallNumber = normalizeString(body.hall_number)
    const hallName = normalizeString(body.hall_name).toUpperCase()
    const hallType = normalizeString(body.hall_type || 'lecture_hall')
    const maintenanceStatus = normalizeString(body.maintenance_status || 'available')

    const floorRaw = normalizeString(body.floor)
    const capacityRaw = normalizeString(body.capacity)
    const floor = floorRaw ? Number(floorRaw) : null
    const capacity = capacityRaw ? Number(capacityRaw) : null

    // Validation
    if (!building) {
      return jsonError('Building is required', 400)
    }

    if (!block) {
      return jsonError('Block is required', 400)
    }

    if (!floorRaw) {
      return jsonError('Floor is required', 400)
    }

    if (!Number.isInteger(floor)) {
      return jsonError('Floor must be a whole number', 400)
    }

    if (building === 'New Building' && (floor < 1 || floor > 14)) {
      return jsonError('New Building floor must be between 1 and 14', 400)
    }

    if (building === 'Main Building' && (floor < 1 || floor > 8)) {
      return jsonError('Main Building floor must be between 1 and 8', 400)
    }

    if (!hallNumber) {
      return jsonError('Hall number is required', 400)
    }

    if (!/^\d{1,2}$/.test(hallNumber)) {
      return jsonError('Hall number must be 1-2 digits', 400)
    }

    if (!hallName) {
      return jsonError('Hall name is required', 400)
    }

    const expectedHallName = `${block}${String(floor).padStart(2, '0')}${hallNumber.padStart(2, '0')}`
    if (hallName !== expectedHallName) {
      return jsonError(`Hall name must be ${expectedHallName}`, 400)
    }

    if (!ALLOWED_HALL_TYPES.has(hallType)) {
      return jsonError('Invalid hall type', 400)
    }

    if (!ALLOWED_MAINTENANCE.has(maintenanceStatus)) {
      return jsonError('Invalid maintenance status', 400)
    }

    if (capacityRaw) {
      if (!Number.isInteger(capacity)) {
        return jsonError('Capacity must be a whole number', 400)
      }

      if (capacity < 1 || capacity > 1000) {
        return jsonError('Capacity must be between 1 and 1000', 400)
      }
    }

    // Check for unique hall_name
    const existingHall = await prisma.lecture_halls.findUnique({
      where: { hall_name: hallName },
    })

    if (existingHall) {
      return jsonError('Hall name must be unique', 400)
    }

    // Create lecture hall
    const newHall = await prisma.lecture_halls.create({
      data: {
        hall_name: hallName,
        building,
        block,
        floor,
        hall_number: hallNumber,
        capacity,
        hall_type: hallType,
        projector: body.projector || false,
        wifi: body.wifi || false,
        ac: body.ac || false,
        whiteboard: body.whiteboard || false,
        maintenance_status: maintenanceStatus,
        is_active: true,
      },
    })

    return jsonSuccess(
      {
        message: 'Lecture hall created successfully',
        data: newHall,
      },
      201
    )
  } catch (error) {
    const status = error?.message === 'Request body must be valid JSON' ? 400 : 500
    console.error('[POST /api/lecture-halls]', error)
    return jsonError(error?.message || 'Failed to create lecture hall', status)
  }
}

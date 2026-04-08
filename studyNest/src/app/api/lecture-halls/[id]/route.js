import { prisma } from '@/lib/prisma'

const VALID_STATUSES = new Set([
  'available',
  'under_maintenance',
  'reserved_exam',
  'reserved_event',
  'closed',
])

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
  }
  if (typeof value === 'number') return value === 1
  return false
}

function toNullableInt(value) {
  if (value == null || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

// GET single lecture hall
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall ID is required',
        },
        { status: 400 }
      )
    }

    const hall = await prisma.lecture_halls.findUnique({
      where: { hall_id: id },
    })

    if (!hall) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall not found',
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: hall,
    })
  } catch (error) {
    console.error('Error fetching lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch lecture hall',
      },
      { status: 500 }
    )
  }
}

// PUT update lecture hall
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    
    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall ID is required',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const maintenanceStatusRaw = String(body?.maintenance_status || 'available').trim()
    const maintenanceStatus = VALID_STATUSES.has(maintenanceStatusRaw)
      ? maintenanceStatusRaw
      : 'available'

    // Validation
    if (!body.hall_name || body.hall_name.trim() === '') {
      return Response.json(
        {
          success: false,
          error: 'Hall name is required',
        },
        { status: 400 }
      )
    }

    // Check if lecture hall exists
    const existingHall = await prisma.lecture_halls.findUnique({
      where: { hall_id: id },
    })

    if (!existingHall) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall not found',
        },
        { status: 404 }
      )
    }

    // Check for unique hall_name (excluding current record)
    if (body.hall_name !== existingHall.hall_name) {
      const duplicateName = await prisma.lecture_halls.findUnique({
        where: { hall_name: body.hall_name },
      })

      if (duplicateName) {
        return Response.json(
          {
            success: false,
            error: 'Hall name must be unique',
          },
          { status: 400 }
        )
      }
    }

    // Update lecture hall
    const updatedHall = await prisma.lecture_halls.update({
      where: { hall_id: id },
      data: {
        hall_name: body.hall_name,
        building: body.building || null,
        block: body.block || null,
        hall_number: body.hall_number || null,
        floor: toNullableInt(body.floor),
        capacity: toNullableInt(body.capacity),
        hall_type: body.hall_type || 'lecture_hall',
        projector: toBoolean(body.projector),
        wifi: toBoolean(body.wifi),
        ac: toBoolean(body.ac),
        whiteboard: toBoolean(body.whiteboard),
        maintenance_status: maintenanceStatus,
      },
    })

    return Response.json({
      success: true,
      message: 'Lecture hall updated successfully',
      data: updatedHall,
    })
  } catch (error) {
    console.error('Error updating lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to update lecture hall',
      },
      { status: 500 }
    )
  }
}

// DELETE lecture hall
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall ID is required',
        },
        { status: 400 }
      )
    }

    // Check if lecture hall exists
    const existingHall = await prisma.lecture_halls.findUnique({
      where: { hall_id: id },
    })

    if (!existingHall) {
      return Response.json(
        {
          success: false,
          error: 'Lecture hall not found',
        },
        { status: 404 }
      )
    }

    // Delete lecture hall
    await prisma.lecture_halls.delete({
      where: { hall_id: id },
    })

    return Response.json({
      success: true,
      message: 'Lecture hall deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to delete lecture hall',
      },
      { status: 500 }
    )
  }
}

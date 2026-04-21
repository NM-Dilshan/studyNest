import { prisma } from '@/lib/prisma'

const VALID_STATUSES = new Set([
  'available',
  'under_maintenance',
  'reserved_exam',
  'reserved_event',
  'closed',
])

function parseNullableInt(value) {
  if (value == null || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseBoolean(value) {
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
  return Boolean(value)
}

function normalizeStatus(value) {
  const normalized = String(value || 'available').trim().toLowerCase()
  return VALID_STATUSES.has(normalized) ? normalized : 'available'
}

async function deleteLectureHallDependencies(tx, hallId) {
  const hallUpdateIds = await tx.volunteer_hall_updates.findMany({
    where: { hall_id: hallId },
    select: { hall_update_id: true },
  })

  const dependentUpdateIds = hallUpdateIds.map((item) => item.hall_update_id)

  if (dependentUpdateIds.length > 0) {
    await tx.volunteer_reviews.deleteMany({
      where: {
        hall_update_id: {
          in: dependentUpdateIds,
        },
      },
    })
  }

  await tx.complaints.updateMany({
    where: { hall_id: hallId },
    data: { hall_id: null },
  })

  await tx.timetable.updateMany({
    where: { hall_id: hallId },
    data: { hall_id: null },
  })

  await tx.update_request_pings.updateMany({
    where: { hall_id: hallId },
    data: { hall_id: null },
  })

  await tx.favorite_halls.deleteMany({
    where: { hall_id: hallId },
  })

  await tx.hall_usage_logs.deleteMany({
    where: { hall_id: hallId },
  })

  await tx.volunteer_hall_updates.deleteMany({
    where: { hall_id: hallId },
  })

  await tx.hall_requests.deleteMany({
    where: { hall_id: hallId },
  })
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lecture hall'
    console.error('Error fetching lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: errorMessage,
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

    const floor = parseNullableInt(body.floor)
    const capacity = parseNullableInt(body.capacity)

    if (body.floor !== undefined && body.floor !== null && body.floor !== '' && floor === null) {
      return Response.json(
        {
          success: false,
          error: 'Floor must be a valid number',
        },
        { status: 400 }
      )
    }

    if (body.capacity !== undefined && body.capacity !== null && body.capacity !== '' && capacity === null) {
      return Response.json(
        {
          success: false,
          error: 'Capacity must be a valid number',
        },
        { status: 400 }
      )
    }

    // Update lecture hall
    const updatedHall = await prisma.lecture_halls.update({
      where: { hall_id: id },
      data: {
        hall_name: String(body.hall_name).trim(),
        building: body.building || null,
        block: body.block || null,
        floor,
        hall_number: body.hall_number || null,
        capacity,
        hall_type: body.hall_type || 'lecture_hall',
        projector: parseBoolean(body.projector),
        wifi: parseBoolean(body.wifi),
        ac: parseBoolean(body.ac),
        whiteboard: parseBoolean(body.whiteboard),
        maintenance_status: normalizeStatus(body.maintenance_status),
        is_active: body?.is_active == null ? true : parseBoolean(body.is_active),
      },
    })

    return Response.json({
      success: true,
      message: 'Lecture hall updated successfully',
      data: updatedHall,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update lecture hall'
    console.error('Error updating lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: errorMessage,
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

    await prisma.$transaction(async (tx) => {
      await deleteLectureHallDependencies(tx, id)

      await tx.lecture_halls.delete({
        where: { hall_id: id },
      })
    })

    return Response.json({
      success: true,
      message: 'Lecture hall deleted successfully',
    })
  } catch (error) {
    const errorMessage =
      error?.code === 'P2003'
        ? 'This lecture hall is still linked to protected records and could not be deleted automatically.'
        : error instanceof Error
          ? error.message
          : 'Failed to delete lecture hall'
    console.error('Error deleting lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

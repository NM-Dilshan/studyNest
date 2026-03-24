import { prisma } from '@/lib/prisma'

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
        floor: body.floor ? parseInt(body.floor) : null,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        hall_type: body.hall_type || 'lecture_hall',
        projector: body.projector || false,
        wifi: body.wifi || false,
        ac: body.ac || false,
        whiteboard: body.whiteboard || false,
        maintenance_status: body.maintenance_status || 'available',
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

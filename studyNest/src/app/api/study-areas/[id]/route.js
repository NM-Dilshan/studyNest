import { prisma } from '@/lib/prisma'

// GET single study area
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Study area ID is required',
        },
        { status: 400 }
      )
    }

    const studyArea = await prisma.study_areas.findUnique({
      where: { study_area_id: id },
    })

    if (!studyArea) {
      return Response.json(
        {
          success: false,
          error: 'Study area not found',
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: studyArea,
    })
  } catch (error) {
    console.error('Error fetching study area:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch study area',
      },
      { status: 500 }
    )
  }
}

// PUT update study area
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    
    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Study area ID is required',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validation
    if (!body.area_name || body.area_name.trim() === '') {
      return Response.json(
        {
          success: false,
          error: 'Area name is required',
        },
        { status: 400 }
      )
    }

    // Check if study area exists
    const existingArea = await prisma.study_areas.findUnique({
      where: { study_area_id: id },
    })

    if (!existingArea) {
      return Response.json(
        {
          success: false,
          error: 'Study area not found',
        },
        { status: 404 }
      )
    }

    // Check for unique area_name (excluding current record)
    if (body.area_name !== existingArea.area_name) {
      const duplicateName = await prisma.study_areas.findUnique({
        where: { area_name: body.area_name },
      })

      if (duplicateName) {
        return Response.json(
          {
            success: false,
            error: 'Area name must be unique',
          },
          { status: 400 }
        )
      }
    }

    // Update study area
    const updatedArea = await prisma.study_areas.update({
      where: { study_area_id: id },
      data: {
        area_name: body.area_name,
        building: body.building || null,
        floor: body.floor || null,
        capacity: body.capacity || null,
        wifi: body.wifi || false,
        charging_ports: body.charging_ports || false,
        silent_zone: body.silent_zone || false,
        ac: body.ac || false,
        area_status: body.area_status || 'available',
      },
    })

    return Response.json({
      success: true,
      message: 'Study area updated successfully',
      data: updatedArea,
    })
  } catch (error) {
    console.error('Error updating study area:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to update study area',
      },
      { status: 500 }
    )
  }
}

// DELETE study area
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return Response.json(
        {
          success: false,
          error: 'Study area ID is required',
        },
        { status: 400 }
      )
    }

    // Check if study area exists
    const existingArea = await prisma.study_areas.findUnique({
      where: { study_area_id: id },
    })

    if (!existingArea) {
      return Response.json(
        {
          success: false,
          error: 'Study area not found',
        },
        { status: 404 }
      )
    }

    // Delete study area
    await prisma.study_areas.delete({
      where: { study_area_id: id },
    })

    return Response.json({
      success: true,
      message: 'Study area deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting study area:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to delete study area',
      },
      { status: 500 }
    )
  }
}

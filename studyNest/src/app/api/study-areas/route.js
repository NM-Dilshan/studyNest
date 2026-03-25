import { prisma } from '@/lib/prisma'

// GET all study areas
export async function GET(request) {
  try {
    const studyAreas = await prisma.study_areas.findMany({
      orderBy: {
        created_at: 'desc',
      },
    })

    return Response.json({
      success: true,
      data: studyAreas,
    })
  } catch (error) {
    console.error('Error fetching study areas:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch study areas',
      },
      { status: 500 }
    )
  }
}

// POST create study area
export async function POST(request) {
  try {
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

    // Check for unique area_name
    const existingArea = await prisma.study_areas.findUnique({
      where: { area_name: body.area_name },
    })

    if (existingArea) {
      return Response.json(
        {
          success: false,
          error: 'Area name must be unique',
        },
        { status: 400 }
      )
    }

    // Create study area
    const newArea = await prisma.study_areas.create({
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
        is_active: true,
      },
    })

    return Response.json(
      {
        success: true,
        message: 'Study area created successfully',
        data: studyArea,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating study area:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to create study area',
      },
      { status: 500 }
    )
  }
}

import { prisma } from '@/lib/prisma'

// GET study areas by building
export async function GET(request, { params }) {
  try {
    const { building } = params

    if (!building) {
      return Response.json(
        {
          success: false,
          error: 'Building parameter is required',
        },
        { status: 400 }
      )
    }

    // Decode the building name
    const decodedBuilding = decodeURIComponent(building)

    const areas = await prisma.study_areas.findMany({
      where: {
        building: decodedBuilding,
        is_active: true,
      },
      select: {
        study_area_id: true,
        area_name: true,
        floor: true,
        capacity: true,
        wifi: true,
        ac: true,
      },
      orderBy: { area_name: 'asc' },
    })

    return Response.json({
      success: true,
      data: areas,
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

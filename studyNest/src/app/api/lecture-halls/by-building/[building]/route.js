import { prisma } from '@/lib/prisma'

// GET lecture halls by building
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

    const halls = await prisma.lecture_halls.findMany({
      where: {
        building: decodedBuilding,
        is_active: true,
      },
      select: {
        hall_id: true,
        hall_name: true,
        floor: true,
        capacity: true,
      },
      orderBy: { hall_name: 'asc' },
    })

    return Response.json({
      success: true,
      data: halls,
    })
  } catch (error) {
    console.error('Error fetching lecture halls:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch lecture halls',
      },
      { status: 500 }
    )
  }
}
import { prisma } from '@/lib/prisma'

// GET unique buildings
export async function GET() {
  try {
    // Get unique buildings from lecture halls
    const lectureHallBuildings = await prisma.lecture_halls.findMany({
      distinct: ['building'],
      select: { building: true },
      where: { building: { not: null } },
    })

    // Get unique buildings from study areas
    const studyAreaBuildings = await prisma.study_areas.findMany({
      distinct: ['building'],
      select: { building: true },
      where: { building: { not: null } },
    })

    // Combine and deduplicate
    const allBuildings = new Set()
    lectureHallBuildings.forEach(b => {
      if (b.building) allBuildings.add(b.building)
    })
    studyAreaBuildings.forEach(b => {
      if (b.building) allBuildings.add(b.building)
    })

    const buildings = Array.from(allBuildings).sort()

    return Response.json({
      success: true,
      data: buildings,
    })
  } catch (error) {
    console.error('Error fetching buildings:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch buildings',
      },
      { status: 500 }
    )
  }
}

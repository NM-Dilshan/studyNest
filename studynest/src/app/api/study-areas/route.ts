import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch study areas using Prisma
    const areas = await prisma.study_areas.findMany({
      where: {
        is_active: true,
      },
      include: {
        area_occupancy: {
          select: {
            current_count: true,
            updated_at: true,
          },
        },
      },
    })

    // Transform the data to match the expected format
    const transformedAreas = areas.map((area) => ({
      ...area,
      occupancy: area.area_occupancy ? [area.area_occupancy] : [],
    }))

    return NextResponse.json({ areas: transformedAreas })
  } catch (error) {
    console.error('Error fetching study areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study areas' },
      { status: 500 }
    )
  }
}

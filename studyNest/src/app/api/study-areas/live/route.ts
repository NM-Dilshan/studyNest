import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activeLocations = await prisma.live_locations.findMany({
      where: {
        updated_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      select: {
        user_id: true,
        study_area_id: true,
        lat: true,
        lng: true,
        updated_at: true,
      },
    })

    return NextResponse.json({
      success: true,
      students: activeLocations.map((location) => ({
        user_id: location.user_id,
        study_area_id: location.study_area_id,
        latitude: location.lat,
        longitude: location.lng,
        updated_at: location.updated_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching live student locations:', error)
    return NextResponse.json(
      {
        success: false,
        students: [],
        error: 'Failed to fetch live student locations',
      },
      { status: 500 }
    )
  }
}
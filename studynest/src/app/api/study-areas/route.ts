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
      study_area_id: area.study_area_id,
      area_name: area.area_name,
      building: area.building,
      floor: area.floor,
      capacity: area.capacity,
      wifi: area.wifi,
      charging_ports: area.charging_ports,
      silent_zone: area.silent_zone,
      ac: area.ac,
      cafe: area.cafe,
      is_active: area.is_active,
      area_status: area.area_status,
      lat: area.lat,
      lng: area.lng,
      radius_meters: area.radius_meters,
      created_at: area.created_at,
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

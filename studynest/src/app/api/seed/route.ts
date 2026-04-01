import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/seed
 * Seed the database with sample study areas with GPS coordinates
 * WARNING: Only use in development!
 */
export async function POST(request: Request) {
  try {
    // Sample study areas with GPS coordinates
    const sampleAreas = [
      {
        area_name: 'Bird Nest Commons',
        building: 'Engineering Block',
        floor: 3,
        capacity: 50,
        latitude: 40.7128,
        longitude: -74.006,
        radius_meters: 20,
        wifi: true,
        charging_ports: true,
        silent_zone: false,
        ac: true,
      },
      {
        area_name: 'The Grove',
        building: 'Library',
        floor: 2,
        capacity: 100,
        latitude: 40.7138,
        longitude: -74.005,
        radius_meters: 20,
        wifi: true,
        charging_ports: false,
        silent_zone: true,
        ac: true,
      },
      {
        area_name: 'Quiet Corner',
        building: 'Student Center',
        floor: 1,
        capacity: 30,
        latitude: 40.7118,
        longitude: -74.007,
        radius_meters: 20,
        wifi: true,
        charging_ports: true,
        silent_zone: true,
        ac: false,
      },
      {
        area_name: 'Study Hub',
        building: 'Main Building',
        floor: 4,
        capacity: 80,
        latitude: 40.7148,
        longitude: -74.004,
        radius_meters: 20,
        wifi: true,
        charging_ports: true,
        silent_zone: false,
        ac: true,
      },
      {
        area_name: 'Coffee Corner',
        building: 'Cafe Block',
        floor: 1,
        capacity: 25,
        latitude: 40.7108,
        longitude: -74.008,
        radius_meters: 20,
        wifi: true,
        charging_ports: false,
        silent_zone: false,
        ac: true,
      },
    ]

    // Create study areas
    const createdAreas = await Promise.all(
      sampleAreas.map((area) =>
        prisma.study_areas.upsert({
          where: { area_name: area.area_name },
          update: {
            ...area,
          },
          create: {
            ...area,
            is_active: true,
          },
        })
      )
    )

    // Create occupancy records for each area
    await Promise.all(
      createdAreas.map((area) =>
        prisma.area_occupancy.upsert({
          where: { study_area_id: area.study_area_id },
          update: {
            current_count: Math.floor(Math.random() * (area.capacity! / 2)),
            updated_at: new Date(),
          },
          create: {
            study_area_id: area.study_area_id,
            current_count: Math.floor(Math.random() * (area.capacity! / 2)),
            updated_at: new Date(),
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `${createdAreas.length} study areas created with GPS coordinates and occupancy data`,
      areas: createdAreas,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

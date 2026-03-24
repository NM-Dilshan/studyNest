import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Clear existing data
    await prisma.area_occupancy.deleteMany()
    await prisma.study_areas.deleteMany()

    // Create study areas
    const areas = await prisma.study_areas.createMany({
      data: [
        {
          area_name: 'Central Library - Quiet Zone',
          building: 'Main Library',
          floor: 2,
          capacity: 50,
          wifi: true,
          charging_ports: true,
          silent_zone: true,
          ac: true,
          cafe: false,
          lat: 40.8075,
          lng: -73.9626,
          radius_meters: 30,
          is_active: true,
        },
        {
          area_name: 'Science Building - Study Lounge',
          building: 'Science Block',
          floor: 1,
          capacity: 30,
          wifi: true,
          charging_ports: false,
          silent_zone: false,
          ac: true,
          cafe: true,
          lat: 40.808,
          lng: -73.962,
          radius_meters: 25,
          is_active: true,
        },
        {
          area_name: 'Arts Building - Group Study',
          building: 'Arts Block',
          floor: 3,
          capacity: 40,
          wifi: true,
          charging_ports: true,
          silent_zone: false,
          ac: false,
          cafe: false,
          lat: 40.8085,
          lng: -73.963,
          radius_meters: 35,
          is_active: true,
        },
      ],
    })

    // Get created areas
    const createdAreas = await prisma.study_areas.findMany()

    // Create occupancy records
    for (const area of createdAreas) {
      await prisma.area_occupancy.create({
        data: {
          study_area_id: area.study_area_id,
          current_count: Math.floor(Math.random() * (area.capacity || 50)),
          available_seats: Math.floor(Math.random() * (area.capacity || 50)),
          occupancy_percentage: Math.floor(Math.random() * 100),
          crowd_status:
            Math.random() > 0.66 ? 'High Crowd' : Math.random() > 0.33 ? 'Medium Crowd' : 'Low Crowd',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${areas.count} study areas with occupancy records`,
      areasCount: areas.count,
      occupancyRecords: createdAreas.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}

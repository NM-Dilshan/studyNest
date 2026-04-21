import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed script to populate example study areas
 * 
 * Run with: npx tsx scripts/seed.ts
 * 
 * Example coordinates: Columbia University (40.8055, -73.9626)
 */

const exampleAreas = [
  {
    area_name: 'Bird Nest',
    building: 'Library',
    floor: 3,
    capacity: 150,
    latitude: 40.8055,
    longitude: -73.9626,
    radius_meters: 20,
    wifi: true,
    charging_ports: true,
    silent_zone: true,
    ac: true,
  },
  {
    area_name: 'The Grove',
    building: 'Science Building',
    floor: 2,
    capacity: 80,
    latitude: 40.8062,
    longitude: -73.9635,
    radius_meters: 20,
    wifi: true,
    charging_ports: true,
    silent_zone: false,
    ac: true,
  },
  {
    area_name: 'Quiet Corner',
    building: 'Arts & Humanities',
    floor: 4,
    capacity: 40,
    latitude: 40.8048,
    longitude: -73.9620,
    radius_meters: 20,
    wifi: true,
    charging_ports: false,
    silent_zone: true,
    ac: false,
  },
  {
    area_name: 'Study Hub',
    building: 'Student Center',
    floor: 1,
    capacity: 200,
    latitude: 40.8070,
    longitude: -73.9640,
    radius_meters: 20,
    wifi: true,
    charging_ports: true,
    silent_zone: false,
    ac: true,
  },
  {
    area_name: 'Coffee Corner',
    building: 'Library',
    floor: 1,
    capacity: 30,
    latitude: 40.8052,
    longitude: -73.9630,
    radius_meters: 20,
    wifi: true,
    charging_ports: true,
    silent_zone: false,
    ac: false,
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  try {
    for (const area of exampleAreas) {
      const existingArea = await prisma.study_areas.findFirst({
        where: { area_name: area.area_name },
      })

      if (existingArea) {
        console.log(`  ✓ Area already exists: ${area.area_name}`)
        continue
      }

      // Create study area
      const createdArea = await prisma.study_areas.create({
        data: {
          area_name: area.area_name,
          building: area.building,
          floor: area.floor,
          capacity: area.capacity,
          latitude: area.latitude,
          longitude: area.longitude,
          radius_meters: area.radius_meters,
          wifi: area.wifi,
          charging_ports: area.charging_ports,
          silent_zone: area.silent_zone,
          ac: area.ac,
          is_active: true,
        },
      })

      // Create occupancy record
      await prisma.area_occupancy.create({
        data: {
          study_area_id: createdArea.study_area_id,
          current_count: 0,
          updated_at: new Date(),
        },
      })

      console.log(`  ✓ Created area: ${area.area_name}`)
    }

    console.log('✅ Seed completed successfully!')
    console.log(`📍 ${exampleAreas.length} study areas created`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

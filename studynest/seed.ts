import { prisma } from './src/lib/prisma'

async function main() {
  // Clear existing data (optional)
  await prisma.area_occupancy.deleteMany()
  await prisma.study_areas.deleteMany()

  // Create study areas with occupancy data
  const studyAreas = await prisma.study_areas.createMany({
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
        latitude: 40.8075,
        longitude: -73.9626,
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
        latitude: 40.8080,
        longitude: -73.9620,
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
        latitude: 40.8085,
        longitude: -73.9630,
        radius_meters: 35,
        is_active: true,
      },
    ],
  })

  console.log(`Created ${studyAreas.count} study areas`)

  // Get the created areas to add occupancy data
  const areas = await prisma.study_areas.findMany()

  // Create occupancy records
  for (const area of areas) {
    await prisma.area_occupancy.create({
      data: {
        study_area_id: area.study_area_id,
        current_count: Math.floor(Math.random() * (area.capacity || 50)),
        updated_at: new Date(),
      },
    })
  }

  console.log(`Created occupancy records for ${areas.length} areas`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

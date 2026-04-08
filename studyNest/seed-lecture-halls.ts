import { prisma } from '@/lib/prisma'

async function main() {
  console.log('Seeding lecture halls...')

  const lectureHallsData = [
      // Arts Block
      {
        hall_name: 'A101',
        building: 'Arts Block',
        block: 'A',
        floor: 1,
        capacity: 50,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'A202',
        building: 'Arts Block',
        block: 'A',
        floor: 2,
        capacity: 60,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'A305',
        building: 'Arts Block',
        block: 'A',
        floor: 3,
        capacity: 45,
        hall_type: 'lecture_hall',
        projector: false,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },

      // Main Building
      {
        hall_name: 'B101',
        building: 'Main Building',
        block: 'B',
        floor: 1,
        capacity: 80,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'B202',
        building: 'Main Building',
        block: 'B',
        floor: 2,
        capacity: 100,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'B304',
        building: 'Main Building',
        block: 'B',
        floor: 3,
        capacity: 70,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: false,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },

      // Science Block
      {
        hall_name: 'S101',
        building: 'Science Block',
        block: 'S',
        floor: 1,
        capacity: 55,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'S202',
        building: 'Science Block',
        block: 'S',
        floor: 2,
        capacity: 65,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },

      // Main Library
      {
        hall_name: 'L101',
        building: 'Main Library',
        block: 'L',
        floor: 1,
        capacity: 40,
        hall_type: 'study_hall',
        projector: false,
        wifi: true,
        ac: true,
        whiteboard: false,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'L202',
        building: 'Main Library',
        block: 'L',
        floor: 2,
        capacity: 50,
        hall_type: 'study_hall',
        projector: false,
        wifi: true,
        ac: true,
        whiteboard: false,
        is_active: true,
        maintenance_status: 'available',
      },

      // New Building
      {
        hall_name: 'N101',
        building: 'New Building',
        block: 'N',
        floor: 1,
        capacity: 90,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
      {
        hall_name: 'N202',
        building: 'New Building',
        block: 'N',
        floor: 2,
        capacity: 85,
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
        maintenance_status: 'available',
      },
    ]

  let createdCount = 0

  for (const hallData of lectureHallsData) {
    try {
      const existing = await prisma.lecture_halls.findUnique({
        where: { hall_name: hallData.hall_name },
      })

      if (!existing) {
        await prisma.lecture_halls.create({
          data: hallData,
        })
        createdCount++
        console.log(`✓ Created: ${hallData.hall_name} (${hallData.building})`)
      } else {
        console.log(`- Skipped: ${hallData.hall_name} (already exists)`)
      }
    } catch (error) {
      console.error(`✗ Error: ${hallData.hall_name}`)
    }
  }

  console.log(`\n✅ Created ${createdCount} new lecture halls`)

  const halls = await prisma.lecture_halls.findMany()
  console.log(`📊 Total: ${halls.length} halls in database`)

  const uniqueBuildings = await prisma.lecture_halls.findMany({
    distinct: ['building'],
    select: { building: true },
    where: { building: { not: null } },
  })

  console.log('🏢 Buildings:', uniqueBuildings.map((b) => b.building).join(', '))
}

main()
  .then(async () => {
    console.log('Seed completed successfully!')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

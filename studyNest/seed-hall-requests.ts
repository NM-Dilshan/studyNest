// Quick seed script for testing hall requests system
// Run: npx ts-node seed-hall-requests.ts

import { prisma } from './src/lib/prisma'

async function main() {
  console.log('🌱 Seeding test data...')

  // Create test users
  const student = await prisma.users.create({
    data: {
      student_id: 'IT2024001',
      name: 'Sunera Imasha',
      email: 'sunera@example.com',
      mobile: '0712345678',
      password: 'hashed_password_here',
      role: 'student',
      is_active: true,
      department: 'IT',
    },
  })

  const volunteer = await prisma.users.create({
    data: {
      volunteer_id: 'VOL2024001',
      name: 'Naveen Kumar',
      email: 'naveen@example.com',
      mobile: '0787654321',
      password: 'hashed_password_here',
      role: 'volunteer',
      is_active: true,
      department: 'Engineering',
    },
  })

  console.log('✅ Created users:')
  console.log(`   Student: ${student.name} (${student.student_id})`)
  console.log(`   Volunteer: ${volunteer.name} (${volunteer.volunteer_id})`)

  // Create test lecture halls
  const halls = await Promise.all([
    prisma.lecture_halls.create({
      data: {
        hall_name: 'LT1',
        building: 'Engineering Building',
        floor: 1,
        capacity: 150,
        block: 'A',
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        whiteboard: true,
        is_active: true,
      },
    }),
    prisma.lecture_halls.create({
      data: {
        hall_name: 'LT2',
        building: 'Engineering Building',
        floor: 2,
        capacity: 120,
        block: 'A',
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        ac: true,
        is_active: true,
      },
    }),
    prisma.lecture_halls.create({
      data: {
        hall_name: 'LT3',
        building: 'Science Building',
        floor: 1,
        capacity: 100,
        block: 'B',
        hall_type: 'lecture_hall',
        projector: true,
        wifi: true,
        whiteboard: true,
        is_active: true,
      },
    }),
    prisma.lecture_halls.create({
      data: {
        hall_name: 'Seminar Room 1',
        building: 'Administration Building',
        floor: 2,
        capacity: 50,
        block: 'C',
        hall_type: 'seminar',
        wifi: true,
        ac: true,
        is_active: true,
      },
    }),
  ])

  console.log('✅ Created halls:')
  halls.forEach((h) => {
    console.log(`   ${h.hall_name} - ${h.building} (Capacity: ${h.capacity})`)
  })

  // Create a test request
  const request = await prisma.hall_requests.create({
    data: {
      requester_id: student.user_id,
      requester_role: 'student',
      requester_id_number: student.student_id || '',
      hall_id: halls[0].hall_id,
      request_note: 'Need to know if there are seats available now',
      request_status: 'Pending',
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Created test request:')
  console.log(`   From: ${student.name} (Student ID: ${student.student_id})`)
  console.log(`   Hall: ${halls[0].hall_name}`)
  console.log(`   Status: ${request.request_status}`)

  // Create a test response
  const response = await prisma.hall_request_updates.create({
    data: {
      request_id: request.request_id,
      responder_id: volunteer.user_id,
      availability_status: 'Free',
      occupancy_level: 'Low',
      available_seats: 87,
      volunteer_note: 'Class ending at 3 PM, should get busier',
      confidence_level: 'High',
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Created test response:')
  console.log(`   From: ${volunteer.name} (Volunteer ID: ${volunteer.volunteer_id})`)
  console.log(`   Status: ${response.availability_status}`)
  console.log(`   Occupancy: ${response.occupancy_level}`)
  console.log(`   Available Seats: ${response.available_seats}`)

  console.log('\n✨ Seed data created successfully!\n')
  console.log('🧪 Test credentials:')
  console.log(`   Student: ${student.email} (ID: ${student.student_id})`)
  console.log(`   Volunteer: ${volunteer.email} (ID: ${volunteer.volunteer_id})`)

  console.log('\n📍 Test URLs:')
  console.log('   - Student Requests: http://localhost:3000/requests')
  console.log('   - Volunteer Dashboard: http://localhost:3000/volunteer/requests')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

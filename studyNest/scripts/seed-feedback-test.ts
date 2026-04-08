import { prisma } from '../src/lib/prisma.ts'

async function seedFeedbackTestData() {
  try {
    // Create test users if they don't exist
    const testStudent = await prisma.users.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        name: 'Test Student',
        email: 'student@test.com',
        role: 'Student',
        student_id: 'IT23839000',
        password: 'hashed_password',
      },
    })

    const testVolunteer = await prisma.users.upsert({
      where: { email: 'volunteer@test.com' },
      update: {},
      create: {
        name: 'Test Volunteer',
        email: 'volunteer@test.com',
        role: 'Volunteer',
        volunteer_id: 'VOL00001',
        password: 'hashed_password',
      },
    })

    // Create a test hall if it doesn't exist
    const testHall = await prisma.lecture_halls.upsert({
      where: { hall_id: 'TEST-A0103' },
      update: {},
      create: {
        hall_id: 'TEST-A0103',
        hall_name: 'Test Hall A0103',
        building: 'Test Building',
        floor: 1,
        capacity: 100,
      },
    })

    // Create a test hall request
    const testRequest = await prisma.hall_requests.create({
      data: {
        requester_id: testStudent.user_id,
        requester_role: 'Student',
        requester_id_number: testStudent.student_id || 'IT23839000',
        hall_id: testHall.hall_id,
        request_status: 'Responded',
        request_note: 'Testing feedback system - is this hall available now?',
        created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updated_at: new Date(),
      },
    })

    // Create a volunteer response to the request
    const testResponse = await prisma.hall_request_updates.create({
      data: {
        request_id: testRequest.request_id,
        responder_id: testVolunteer.user_id,
        availability_status: 'Free',
        occupancy_level: 'Low',
        available_seats: 45,
        confidence_level: 'High',
        volunteer_note: 'Hall A0103 is currently available with low occupancy. Good place to study!',
        created_at: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
    })

    // Create a volunteer scores entry if it doesn't exist
    await prisma.volunteer_scores.upsert({
      where: { volunteer_id: testVolunteer.user_id },
      update: {
        total_responses: {
          increment: 1,
        },
      },
      create: {
        volunteer_id: testVolunteer.user_id,
        total_responses: 1,
        total_feedback_received: 0,
        average_feedback_rating: 0,
        total_points: 5,
        level: 1,
      },
    })

    console.log('✅ Test data seeded successfully!')
    console.log('Test Student ID:', testStudent.user_id)
    console.log('Test Volunteer ID:', testVolunteer.user_id)
    console.log('Test Request ID:', testRequest.request_id)
    console.log('Test Response ID:', testResponse.update_id)
  } catch (error) {
    console.error('Error seeding test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedFeedbackTestData()

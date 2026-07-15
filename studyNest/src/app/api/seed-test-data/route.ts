import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/seed-test-data
 * Create test data for feedback system (warning: should only be used in development)
 * Query params: student_id (optional) - create requests for this student; if not provided, creates test users
 */
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is not available in production' },
        { status: 403 }
      )
    }

    // Get student_id from query params
    const studentIdParam = request.nextUrl.searchParams.get('student_id')

    let testStudent;
    let testVolunteer;

    // If student_id provided, find existing student; otherwise create test student
    if (studentIdParam) {
      testStudent = await prisma.users.findFirst({
        where: { student_id: studentIdParam }
      })
      if (!testStudent) {
        return NextResponse.json(
          { success: false, error: `Student with ID ${studentIdParam} not found` },
          { status: 404 }
        )
      }
    } else {
      testStudent = await prisma.users.upsert({
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
    }

    const testVolunteerEmail = 'volunteer@test.com'
    testVolunteer = await prisma.users.upsert({
      where: { email: testVolunteerEmail },
      update: {},
      create: {
        name: 'Test Volunteer',
        email: testVolunteerEmail,
        role: 'Volunteer',
        volunteer_id: 'VOL00001',
        password: 'hashed_password',
      },
    })

    // Create a test hall if it doesn't exist
    const testHallId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Fixed UUID
    const testHall = await prisma.lecture_halls.upsert({
      where: { hall_id: testHallId },
      update: {},
      create: {
        hall_id: testHallId,
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

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        studentId: testStudent.user_id,
        studentEmail: testStudent.email,
        volunteerId: testVolunteer.user_id,
        volunteerEmail: testVolunteer.email,
        requestId: testRequest.request_id,
        responseId: testResponse.update_id,
      },
    })
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
}

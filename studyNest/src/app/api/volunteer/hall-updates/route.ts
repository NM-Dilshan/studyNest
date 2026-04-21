import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateExpiryTime,
  calculateCooldownRemaining,
  validateVolunteerHallUpdate,
} from '@/lib/validations/volunteerHallUpdate'

/**
 * GET /api/volunteer/hall-updates
 * Retrieve volunteeer's own submissions (including expired ones for history)
 * Query params:
 * - volunteerId (required): UUID of the volunteer
 * - includeExpired (optional, default false): include expired submissions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const volunteerId = searchParams.get('volunteerId')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    if (!volunteerId) {
      return NextResponse.json(
        { error: 'volunteerId is required' },
        { status: 400 }
      )
    }

    const query: any = {
      where: {
        volunteer_id: volunteerId,
      },
      include: {
        lecture_halls: {
          select: {
            hall_id: true,
            hall_name: true,
            building: true,
            floor: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    }

    // Filter active submissions if not including expired
    if (!includeExpired) {
      query.where.expires_at = {
        gt: new Date(),
      }
    }

    const submissions = await prisma.volunteer_hall_updates.findMany(query)

    // Enhance with expiry status
    const enrichedSubmissions = submissions.map((submission) => ({
      ...submission,
      isExpired: submission.expires_at ? new Date() > submission.expires_at : false,
    }))

    return NextResponse.json({
      success: true,
      count: enrichedSubmissions.length,
      submissions: enrichedSubmissions,
    })
  } catch (error) {
    console.error('Error fetching hall updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hall updates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/volunteer/hall-updates
 * Create a new volunteer hall submission
 * Body:
 * {
 *   volunteerId: UUID
 *   hallId: UUID
 *   availabilityStatus: 'Free' | 'Partially Busy' | 'Busy'
 *   occupancyLevel: 'Empty' | 'Low' | 'Medium' | 'High' | 'Full'
 *   availableSeats?: number
 *   note?: string
 *   expiryDuration: '30m' | '1h' | '2h' | 'custom'
 *   expiryTime?: Date (only if custom duration)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      volunteerId,
      hallId,
      availabilityStatus,
      occupancyLevel,
      availableSeats,
      note,
      expiryDuration,
      expiryTime: customExpiryTime,
    } = body

    // Validate input
    const validationResult = validateVolunteerHallUpdate({
      hallId,
      availabilityStatus,
      occupancyLevel,
      availableSeats,
      note,
      expiryDuration,
      expiryTime: customExpiryTime ? new Date(customExpiryTime) : undefined,
    })

    if (!validationResult.isValid) {
      const errorObj = Object.fromEntries(validationResult.errors)
      return NextResponse.json(
        { error: 'Validation failed', details: errorObj },
        { status: 400 }
      )
    }

    // Validate volunteer exists
    const volunteer = await prisma.users.findUnique({
      where: { user_id: volunteerId },
    })

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      )
    }

    // Validate hall exists and get capacity
    const hall = await prisma.lecture_halls.findUnique({
      where: { hall_id: hallId },
      select: {
        hall_id: true,
        hall_name: true,
        capacity: true,
      },
    })

    if (!hall) {
      return NextResponse.json(
        { error: 'Lecture hall not found' },
        { status: 404 }
      )
    }

    // Check cooldown: same volunteer cannot submit for same hall within 15 minutes
    const recentSubmission = await prisma.volunteer_hall_updates.findFirst({
      where: {
        volunteer_id: volunteerId,
        hall_id: hallId,
        created_at: {
          gt: new Date(Date.now() - 15 * 60 * 1000), // last 15 minutes
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    if (recentSubmission) {
      const cooldown = calculateCooldownRemaining(recentSubmission.created_at)
      if (cooldown.isOnCooldown) {
        return NextResponse.json(
          {
            error: 'Cooldown active',
            message: `Please wait ${cooldown.remainingSeconds} seconds before updating this hall again`,
            remainingSeconds: cooldown.remainingSeconds,
          },
          { status: 429 } // Too Many Requests
        )
      }
    }

    // Calculate expiry time
    const expiresAt = calculateExpiryTime(
      expiryDuration as any,
      customExpiryTime ? new Date(customExpiryTime) : undefined
    )

    // Create the submission
    const submission = await prisma.volunteer_hall_updates.create({
      data: {
        volunteer_id: volunteerId,
        hall_id: hallId,
        availability_status: availabilityStatus,
        occupancy_level: occupancyLevel,
        available_seats: availableSeats || null,
        note: note || null,
        expires_at: expiresAt,
        created_at: new Date(),
        confidence_level: 'medium', // default confidence
      },
      include: {
        lecture_halls: {
          select: {
            hall_id: true,
            hall_name: true,
            building: true,
            floor: true,
            capacity: true,
          },
        },
      },
    })

    // Update volunteer score if exists
    try {
      await prisma.volunteer_scores.upsert({
        where: { volunteer_id: volunteerId },
        update: {
          total_updates: { increment: 1 },
        },
        create: {
          volunteer_id: volunteerId,
          total_updates: 1,
          total_reviews: 0,
          average_rating: 0,
          accurate_count: 0,
          inaccurate_count: 0,
          score: 0,
        },
      })
    } catch (scoreError) {
      console.error('Error updating score:', scoreError)
      // Don't fail submission if score update fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Hall submission created successfully',
        submission: {
          ...submission,
          isExpired: false,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating hall submission:', error)
    return NextResponse.json(
      { error: 'Failed to create hall submission' },
      { status: 500 }
    )
  }
}

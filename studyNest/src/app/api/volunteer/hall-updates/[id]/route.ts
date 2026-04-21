import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateExpiryTime,
  isSubmissionExpired,
  validateVolunteerHallUpdate,
} from '@/lib/validations/volunteerHallUpdate'

/**
 * PUT /api/volunteer/hall-updates/[id]
 * Update an existing volunteer hall submission
 * Can only update non-expired submissions
 * Can only update own submissions
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const submissionId = id
    const body = await request.json()
    const {
      volunteerId,
      availabilityStatus,
      occupancyLevel,
      availableSeats,
      note,
      expiryDuration,
      expiryTime: customExpiryTime,
    } = body

    if (!submissionId || isNaN(Number(submissionId))) {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      )
    }

    // Get current submission
    const submission = await prisma.volunteer_hall_updates.findUnique({
      where: { hall_update_id: Number(submissionId) },
      include: {
        lecture_halls: {
          select: { capacity: true },
        },
      },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (submission.volunteer_id !== volunteerId) {
      return NextResponse.json(
        { error: 'Unauthorized: you can only edit your own submissions' },
        { status: 403 }
      )
    }

    // Check if expired
    if (isSubmissionExpired(submission.expires_at)) {
      return NextResponse.json(
        { error: 'Cannot edit expired submission' },
        { status: 400 }
      )
    }

    // Validate input
    const validationResult = validateVolunteerHallUpdate({
      hallId: submission.hall_id,
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

    // Calculate new expiry time
    const expiresAt = calculateExpiryTime(
      expiryDuration as any,
      customExpiryTime ? new Date(customExpiryTime) : undefined
    )

    // Update the submission
    const updatedSubmission = await prisma.volunteer_hall_updates.update({
      where: { hall_update_id: Number(submissionId) },
      data: {
        availability_status: availabilityStatus,
        occupancy_level: occupancyLevel,
        available_seats: availableSeats || null,
        note: note || null,
        expires_at: expiresAt,
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

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      submission: {
        ...updatedSubmission,
        isExpired: false,
      },
    })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/volunteer/hall-updates/[id]
 * Delete a volunteer hall submission
 * Can only delete own submissions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const submissionId = id
    const { searchParams } = new URL(request.url)
    const volunteerId = searchParams.get('volunteerId')

    if (!submissionId || isNaN(Number(submissionId))) {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      )
    }

    if (!volunteerId) {
      return NextResponse.json(
        { error: 'volunteerId is required' },
        { status: 400 }
      )
    }

    // Get submission to verify ownership
    const submission = await prisma.volunteer_hall_updates.findUnique({
      where: { hall_update_id: Number(submissionId) },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (submission.volunteer_id !== volunteerId) {
      return NextResponse.json(
        { error: 'Unauthorized: you can only delete your own submissions' },
        { status: 403 }
      )
    }

    // Delete the submission
    await prisma.volunteer_hall_updates.delete({
      where: { hall_update_id: Number(submissionId) },
    })

    // Decrement volunteer score total_updates
    try {
      await prisma.volunteer_scores.update({
        where: { volunteer_id: volunteerId },
        data: {
          total_updates: { decrement: 1 },
        },
      })
    } catch (scoreError) {
      console.error('Error updating score:', scoreError)
      // Don't fail deletion if score update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}

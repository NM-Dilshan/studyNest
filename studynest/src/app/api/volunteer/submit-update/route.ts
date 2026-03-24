import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { volunteerId, spaceType, locationId, status, confidence } = body

    if (!volunteerId || !spaceType || !locationId || !status || !confidence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // UUID validation - ensure locationId is in proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(locationId)) {
      return NextResponse.json(
        { error: 'Invalid location ID format. Expected UUID.' },
        { status: 400 }
      )
    }

    const scoreIncrements = {
      high: 5,
      medium: 3,
      low: 1,
    }
    const points = scoreIncrements[confidence as keyof typeof scoreIncrements] || 0

    let result
    let updateData

    if (spaceType === 'lecture-hall') {
      // Submit hall update
      try {
        result = await prisma.volunteer_hall_updates.create({
          data: {
            volunteer_id: volunteerId,
            hall_id: locationId,
            availability_status: status, // "free" or "occupied"
            confidence_level: confidence,
            created_at: new Date(),
          },
          include: {
            lecture_halls: {
              select: { hall_name: true },
            },
          },
        })

        updateData = {
          id: result.hall_update_id,
          type: 'hall' as const,
          name: result.lecture_halls?.hall_name || 'Unknown Hall',
          status: result.occupancy_level,
          time: result.created_at,
          points,
          confidence: result.confidence_level,
        }
      } catch (dbError) {
        console.error('Hall update error:', dbError)
        return NextResponse.json(
          { error: 'Failed to submit hall update. Location may not exist.' },
          { status: 400 }
        )
      }
    } else if (spaceType === 'study-area') {
      // Submit study area update
      try {
        result = await prisma.volunteer_study_area_updates.create({
          data: {
            volunteer_id: volunteerId,
            study_area_id: locationId,
            crowd_status: status,
            confidence_level: confidence,
            created_at: new Date(),
          },
          include: {
            study_areas: {
              select: { area_name: true },
            },
          },
        })

        updateData = {
          id: result.area_update_id,
          type: 'area' as const,
          name: result.study_areas?.area_name || 'Unknown Area',
          status: result.crowd_status,
          time: result.created_at,
          points,
          confidence: result.confidence_level,
        }
      } catch (dbError) {
        console.error('Area update error:', dbError)
        return NextResponse.json(
          { error: 'Failed to submit study area update. Location may not exist.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid space type' },
        { status: 400 }
      )
    }

    // Update volunteer score
    try {
      await prisma.volunteer_scores.upsert({
        where: { volunteer_id: volunteerId },
        update: {
          total_updates: { increment: 1 },
          score: { increment: points },
        },
        create: {
          volunteer_id: volunteerId,
          total_updates: 1,
          score: points,
          total_reviews: 0,
          average_rating: 0,
          accurate_count: 0,
          inaccurate_count: 0,
        },
      })
    } catch (scoreError) {
      console.error('Score update error:', scoreError)
      // Don't fail the submission if score update fails
    }

    return NextResponse.json(
      {
        success: true,
        message: `${spaceType === 'lecture-hall' ? 'Hall' : 'Study area'} update submitted successfully!`,
        data: updateData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting update:', error)
    return NextResponse.json(
      { error: 'Failed to submit update. Please try again.' },
      { status: 500 }
    )
  }
}

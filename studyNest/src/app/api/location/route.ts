import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPointInsideCircular, type LocationPoint, type CircularGeofence } from '@/lib/geofence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, latitude, longitude } = body

    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, latitude, longitude' },
        { status: 400 }
      )
    }

    // Validate coordinates are numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      )
    }

    // Update or create live location record
    const liveLocation = await prisma.live_locations.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        lat: latitude,
        lng: longitude,
        updated_at: new Date(),
      },
      update: {
        lat: latitude,
        lng: longitude,
        updated_at: new Date(),
      },
    })

    // Get all active study areas
    const allAreas = await prisma.study_areas.findMany({
      where: { is_active: true },
    })

    // Filter to only areas with GPS coordinates
    const studyAreas = allAreas.filter(
      (a) => a.latitude !== null && a.longitude !== null
    )

    // Check which study areas the student is inside
    const insideAreas: string[] = []

    for (const area of studyAreas) {
      if (
        area.latitude !== null &&
        area.longitude !== null &&
        isPointInsideCircular(
          { latitude, longitude } as LocationPoint,
          {
            type: 'circle',
            center: { latitude: area.latitude, longitude: area.longitude },
            radiusMeters: area.radius_meters || 20,
          } as CircularGeofence
        )
      ) {
        insideAreas.push(area.study_area_id)
      }
    }

    // Assign user to one matched area, or clear when outside all areas
    const assignedStudyAreaId = insideAreas.length > 0 ? insideAreas[0] : null
    const previousStudyAreaId = liveLocation.study_area_id || null

    await prisma.live_locations.update({
      where: { user_id: userId },
      data: { study_area_id: assignedStudyAreaId },
    })

    // Recalculate occupancy only for areas affected by this user's movement
    const affectedAreaIds = new Set<string>()
    if (previousStudyAreaId) affectedAreaIds.add(previousStudyAreaId)
    if (assignedStudyAreaId) affectedAreaIds.add(assignedStudyAreaId)

    for (const areaId of affectedAreaIds) {
      const activeCount = await prisma.live_locations.count({
        where: {
          study_area_id: areaId,
          updated_at: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      })

      const area = studyAreas.find((a) => a.study_area_id === areaId)
      if (!area || !area.capacity) continue

      // Update occupancy record
      await prisma.area_occupancy.upsert({
        where: { study_area_id: areaId },
        create: {
          study_area_id: areaId,
          current_count: activeCount,
          updated_at: new Date(),
        },
        update: {
          current_count: activeCount,
          updated_at: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated',
      insideAreas,
      assignedStudyAreaId,
    })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/location
 * Get current user's location status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const location = await prisma.live_locations.findUnique({
      where: { user_id: userId },
      select: {
        lat: true,
        lng: true,
        study_area_id: true,
        updated_at: true,
        study_areas: {
          select: {
            area_name: true,
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      latitude: location.lat,
      longitude: location.lng,
      insideStudyArea: location.study_area_id,
      areaName: location.study_areas?.area_name || null,
      lastUpdated: location.updated_at,
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    )
  }
}

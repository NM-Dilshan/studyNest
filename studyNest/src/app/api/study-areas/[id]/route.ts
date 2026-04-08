import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateOccupancy } from '@/lib/geofence'
import { Prisma } from '@/generated/prisma/client'

type StudyAreaUpdatePayload = {
  name?: unknown
  building?: unknown
  floor?: unknown
  capacity?: unknown
  latitude?: unknown
  longitude?: unknown
  radiusMeters?: unknown
  facilities?: {
    wifi?: unknown
    chargingPorts?: unknown
    silentZone?: unknown
    ac?: unknown
  } | null
}

const toOptionalInteger = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const toOptionalFloat = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * GET /api/study-areas/[id]
 * Get detailed information for a specific study area
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const area = await prisma.study_areas.findUnique({
      where: { study_area_id: id },
      include: {
        area_occupancy: true,
      },
    })

    if (!area || !area.is_active) {
      return NextResponse.json(
        { error: 'Study area not found' },
        { status: 404 }
      )
    }

    // Ensure latitude and longitude exist
    if (area.latitude === null || area.longitude === null) {
      return NextResponse.json(
        { error: 'Study area GPS coordinates not configured' },
        { status: 400 }
      )
    }

    // Get active students count with recent location updates (within 5 minutes)
    const recentLocations = await prisma.live_locations.findMany({
      where: {
        study_area_id: id,
        updated_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    })

    const currentCount = area.area_occupancy?.current_count ?? recentLocations.length ?? 0
    const capacity = area.capacity ?? 100
    const occupancyPercentage = (currentCount / capacity) * 100

    const enrichedArea = {
      id: area.study_area_id,
      name: area.area_name,
      building: area.building,
      floor: area.floor,
      capacity: area.capacity,
      latitude: area.latitude as number,
      longitude: area.longitude as number,
      radiusMeters: area.radius_meters ?? 20,
      facilities: {
        wifi: area.wifi,
        chargingPorts: area.charging_ports,
        silentZone: area.silent_zone,
        ac: area.ac,
      },
      currentCount,
      occupancyPercentage: Math.round(occupancyPercentage),
      lastUpdated: area.area_occupancy?.updated_at ?? area.created_at,
    }

    return NextResponse.json({
      success: true,
      area: enrichedArea,
      activeStudents: recentLocations.length,
    })
  } catch (error) {
    console.error('Error fetching study area details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study area details' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/study-areas/[id]
 * Update study area details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as StudyAreaUpdatePayload
    const {
      name,
      building,
      floor,
      capacity,
      latitude,
      longitude,
      radiusMeters,
      facilities,
    } = body

    // Build update data object, handling type conversions
    const updateData: Prisma.study_areasUpdateInput = {}
    
    if (name !== undefined && name !== null) {
      updateData.area_name = String(name)
    }
    if (building !== undefined && building !== null) {
      updateData.building = String(building)
    }
    const parsedFloor = toOptionalInteger(floor)
    if (parsedFloor !== undefined) {
      updateData.floor = parsedFloor
    }
    const parsedCapacity = toOptionalInteger(capacity)
    if (parsedCapacity !== undefined) {
      updateData.capacity = parsedCapacity
    }
    const parsedLatitude = toOptionalFloat(latitude)
    if (parsedLatitude !== undefined) {
      updateData.latitude = parsedLatitude
    }
    const parsedLongitude = toOptionalFloat(longitude)
    if (parsedLongitude !== undefined) {
      updateData.longitude = parsedLongitude
    }
    const parsedRadius = toOptionalInteger(radiusMeters)
    if (parsedRadius !== undefined) {
      updateData.radius_meters = parsedRadius
    }
    if (facilities) {
      updateData.wifi = facilities.wifi === true
      updateData.charging_ports = facilities.chargingPorts === true
      updateData.silent_zone = facilities.silentZone === true
      updateData.ac = facilities.ac === true
    }

    const updatedArea = await prisma.study_areas.update({
      where: { study_area_id: id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Study area updated successfully',
      area: {
        id: updatedArea.study_area_id,
        name: updatedArea.area_name,
        latitude: updatedArea.latitude,
        longitude: updatedArea.longitude,
      },
    })
  } catch (error) {
    console.error('Error updating study area:', error)
    return NextResponse.json(
      { error: 'Failed to update study area' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/study-areas/[id]
 * Delete a study area (soft delete - mark as inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if study area exists
    const area = await prisma.study_areas.findUnique({
      where: { study_area_id: id },
    })

    if (!area) {
      return NextResponse.json(
        { error: 'Study area not found' },
        { status: 404 }
      )
    }

    // Soft delete - mark as inactive
    await prisma.study_areas.update({
      where: { study_area_id: id },
      data: {
        is_active: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Study area deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting study area:', error)
    return NextResponse.json(
      { error: 'Failed to delete study area' },
      { status: 500 }
    )
  }
}

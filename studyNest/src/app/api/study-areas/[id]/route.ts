import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateOccupancy } from '@/lib/geofence'

/**
 * GET /api/study-areas/[id]
 * Get detailed information for a specific study area
 */
export async function GET(
  request: NextRequest,
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

    const currentCount = area.area_occupancy?.current_count || 0
    const capacity = area.capacity || 100
    const occupancy = calculateOccupancy(currentCount, capacity)

    const enrichedArea = {
      id: area.study_area_id,
      name: area.area_name,
      building: area.building,
      floor: area.floor,
      capacity: area.capacity,
      latitude: area.latitude as number,
      longitude: area.longitude as number,
      radiusMeters: area.radius_meters || 20,
      facilities: {
        wifi: area.wifi,
        chargingPorts: area.charging_ports,
        silentZone: area.silent_zone,
        ac: area.ac,
      },
      ...occupancy,
      lastUpdated: area.area_occupancy?.updated_at || area.created_at,
    }

    // Get active students count (those with recent location updates within 5 minutes)
    const recentStudents = await prisma.live_locations.count({
      where: {
        study_area_id: id,
        updated_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        } as any,
      },
    })

    return NextResponse.json({
      success: true,
      area: enrichedArea,
      activeStudents: recentStudents,
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
    const body = await request.json()
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
    const updateData: any = {}
    
    if (name !== undefined && name !== null) {
      updateData.area_name = name
    }
    if (building !== undefined && building !== null) {
      updateData.building = building
    }
    if (floor !== undefined && floor !== null) {
      updateData.floor = parseInt(String(floor), 10)
    }
    if (capacity !== undefined && capacity !== null) {
      updateData.capacity = parseInt(String(capacity), 10)
    }
    if (latitude !== undefined && latitude !== null) {
      updateData.latitude = parseFloat(String(latitude))
    }
    if (longitude !== undefined && longitude !== null) {
      updateData.longitude = parseFloat(String(longitude))
    }
    if (radiusMeters !== undefined && radiusMeters !== null) {
      updateData.radius_meters = parseInt(String(radiusMeters), 10)
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateOccupancy } from '@/lib/geofence'

/**
 * GET /api/study-areas
 * Get all active study areas with current occupancy information
 */
export async function GET() {
  try {
    const areas = await prisma.study_areas.findMany({
      where: {
        is_active: true,
      },
      include: {
        area_occupancy: true,
      },
      orderBy: {
        area_name: 'asc',
      },
    })

    // Enhance each area with occupancy calculations
    const enrichedAreas = areas.map((area) => {
      const currentCount = area.area_occupancy?.current_count || 0
      const capacity = area.capacity || 100
      const occupancy = calculateOccupancy(currentCount, capacity)

      return {
        id: area.study_area_id,
        name: area.area_name,
        building: area.building,
        floor: area.floor,
        capacity: area.capacity,
        latitude: area.latitude,
        longitude: area.longitude,
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
    })

    return NextResponse.json({
      success: true,
      areas: enrichedAreas,
      totalAreas: enrichedAreas.length,
      lowCrowdCount: enrichedAreas.filter(
        (a) => a.crowdStatus === 'Low Crowd'
      ).length,
      mediumCrowdCount: enrichedAreas.filter(
        (a) => a.crowdStatus === 'Medium Crowd'
      ).length,
      highCrowdCount: enrichedAreas.filter(
        (a) => a.crowdStatus === 'High Crowd'
      ).length,
    })
  } catch (error) {
    console.error('Error fetching study areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study areas' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/study-areas
 * Create a new study area with GPS coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      building,
      floor,
      capacity,
      latitude,
      longitude,
      radiusMeters = 20,
      facilities = {},
    } = body

    // Validate required fields
    const errors: Record<string, string> = {}

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Study area name is required'
    }

    if (latitude === undefined || latitude === null) {
      errors.latitude = 'Latitude is required'
    } else if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.latitude = 'Latitude must be a number between -90 and 90'
    }

    if (longitude === undefined || longitude === null) {
      errors.longitude = 'Longitude is required'
    } else if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.longitude = 'Longitude must be a number between -180 and 180'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        },
        { status: 400 }
      )
    }

    const newArea = await prisma.study_areas.create({
      data: {
        area_name: name.trim(),
        building: building || null,
        floor: floor || null,
        capacity: capacity || 100,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        wifi: facilities?.wifi || false,
        charging_ports: facilities?.chargingPorts || false,
        silent_zone: facilities?.silentZone || false,
        ac: facilities?.ac || false,
      },
    })

    // Initialize occupancy record
    await prisma.area_occupancy.create({
      data: {
        study_area_id: newArea.study_area_id,
        current_count: 0,
        updated_at: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Study area created successfully',
        area: {
          id: newArea.study_area_id,
          name: newArea.area_name,
          latitude: newArea.latitude,
          longitude: newArea.longitude,
          radiusMeters: newArea.radius_meters,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating study area:', error)
    return NextResponse.json(
      { error: 'Failed to create study area' },
      { status: 500 }
    )
  }
}

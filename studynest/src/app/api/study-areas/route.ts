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
 * Comprehensive server-side validation and duplicate checking
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
      status = 'available',
      facilities = {},
    } = body

    // Validation helper
    const errors: Record<string, string> = {}

    // Validate area name
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Area name is required'
    } else {
      const trimmedName = name.trim()
      if (trimmedName.length < 3) {
        errors.name = 'Area name must be at least 3 characters'
      } else if (trimmedName.length > 100) {
        errors.name = 'Area name must not exceed 100 characters'
      } else if (!/^[a-zA-Z0-9\s\-]*$/.test(trimmedName)) {
        errors.name = 'Area name contains invalid characters. Use only letters, numbers, spaces, and hyphens'
      }
    }

    // Validate building
    if (!building || typeof building !== 'string' || !building.trim()) {
      errors.building = 'Building is required'
    } else {
      const trimmedBuilding = building.trim()
      if (trimmedBuilding.length < 2) {
        errors.building = 'Building must be at least 2 characters'
      } else if (trimmedBuilding.length > 50) {
        errors.building = 'Building must not exceed 50 characters'
      }
    }

    // Validate floor
    if (floor !== null && floor !== undefined) {
      const floorNum = parseInt(String(floor), 10)
      if (isNaN(floorNum)) {
        errors.floor = 'Floor must be a valid whole number'
      } else if (floorNum < -10 || floorNum > 100) {
        errors.floor = 'Floor must be between -10 and 100'
      }
    }

    // Validate capacity
    if (!capacity && capacity !== 0) {
      errors.capacity = 'Capacity is required'
    } else {
      const capacityNum = parseInt(String(capacity), 10)
      if (isNaN(capacityNum)) {
        errors.capacity = 'Capacity must be a valid number'
      } else if (capacityNum < 1) {
        errors.capacity = 'Capacity must be greater than 0'
      } else if (capacityNum > 2000) {
        errors.capacity = 'Capacity must not exceed 2000'
      }
    }

    // Validate status
    const validStatuses = ['available', 'low_crowd', 'medium_crowd', 'high_crowd', 'closed']
    if (!status || !validStatuses.includes(status)) {
      errors.area_status = 'Invalid status selected'
    }

    // Validate latitude
    if (latitude === undefined || latitude === null) {
      errors.latitude = 'Latitude is required'
    } else if (typeof latitude !== 'number') {
      errors.latitude = 'Latitude must be a number'
    } else if (latitude < -90 || latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90'
    }

    // Validate longitude
    if (longitude === undefined || longitude === null) {
      errors.longitude = 'Longitude is required'
    } else if (typeof longitude !== 'number') {
      errors.longitude = 'Longitude must be a number'
    } else if (longitude < -180 || longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180'
    }

    // Cross-field validation: Both latitude and longitude required
    if ((latitude === undefined || latitude === null) && (longitude === undefined || longitude === null)) {
      errors._cross =
        'Both latitude and longitude must be provided'
    }

    // Validate radius meters
    if (radiusMeters) {
      const radiusNum = parseInt(String(radiusMeters), 10)
      if (isNaN(radiusNum)) {
        errors.radius_meters = 'Geofence radius must be a valid number'
      } else if (radiusNum < 5) {
        errors.radius_meters = 'Geofence radius must be at least 5 meters'
      } else if (radiusNum > 200) {
        errors.radius_meters = 'Geofence radius must not exceed 200 meters'
      }
    }

    // If there are validation errors, return them
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

    // Check for duplicate study area name
    const existingArea = await prisma.study_areas.findUnique({
      where: { area_name: (name as string).trim() },
    })

    if (existingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Study area with this name already exists',
          errors: {
            name: 'A study area with this name already exists',
          },
        },
        { status: 409 } // Conflict status code
      )
    }

    // Create the study area
    const newArea = await prisma.study_areas.create({
      data: {
        area_name: (name as string).trim(),
        building: building ? (building as string).trim() : null,
        floor: floor ? parseInt(String(floor), 10) : null,
        capacity: capacity ? parseInt(String(capacity), 10) : 100,
        latitude: latitude as number,
        longitude: longitude as number,
        radius_meters: radiusMeters ? parseInt(String(radiusMeters), 10) : 20,
        area_status: status || 'available',
        wifi: facilities?.wifi || false,
        charging_ports: facilities?.chargingPorts || false,
        silent_zone: facilities?.silentZone || false,
        ac: facilities?.ac || false,
        is_active: true,
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
          building: newArea.building,
          floor: newArea.floor,
          capacity: newArea.capacity,
          latitude: newArea.latitude,
          longitude: newArea.longitude,
          radiusMeters: newArea.radius_meters,
          status: newArea.area_status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating study area:', error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          {
            success: false,
            error: 'A study area with this name already exists',
            errors: { name: 'A study area with this name already exists' },
          },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create study area. Please try again.',
      },
      { status: 500 }
    )
  }
}

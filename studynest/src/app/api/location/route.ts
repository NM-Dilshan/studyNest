import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/location
 * Update user location and calculate occupancy for affected study areas
 */
export async function POST(req: NextRequest) {
  try {
    const { lat, lng, userId } = await req.json();

    // Validate required fields
    if (lat === undefined || lng === undefined || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: lat, lng, userId' },
        { status: 400 }
      );
    }

    // Validate coordinates are numbers
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'lat and lng must be numbers' },
        { status: 400 }
      );
    }

    // Find study area that contains this point (circular geofence)
    const studyAreas = await prisma.study_areas.findMany({
      where: { is_active: true },
      select: {
        study_area_id: true,
        lat: true,
        lng: true,
        radius_meters: true,
      },
    });

    let areaId: string | null = null;

    // Check which area (if any) the user is within
    for (const area of studyAreas) {
      if (area.lat != null && area.lng != null && area.radius_meters != null) {
        // Calculate distance using haversine formula (simplified for small distances)
        const distance =
          Math.sqrt(Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)) *
          111000; // rough conversion to meters

        if (distance <= area.radius_meters) {
          areaId = area.study_area_id;
          break;
        }
      }
    }

    // Upsert live location
    await prisma.live_locations.upsert({
      where: { user_id: userId },
      update: {
        lat,
        lng,
        study_area_id: areaId,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        lat,
        lng,
        study_area_id: areaId,
      },
    });

    // Recalculate occupancy for all study areas
    await recalculateOccupancy();

    return NextResponse.json({ success: true, areaId });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to recalculate occupancy counts from live_locations
 * Only counts locations updated in the last 5 minutes
 */
async function recalculateOccupancy() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get all study areas with counts of live users
    const areasWithCounts = await prisma.live_locations.groupBy({
      by: ['study_area_id'],
      where: {
        updated_at: { gte: fiveMinutesAgo },
      },
      _count: {
        user_id: true,
      },
    });

    // Update area_occupancy for areas with live users
    for (const group of areasWithCounts) {
      if (group.study_area_id) {
        await prisma.area_occupancy.upsert({
          where: { study_area_id: group.study_area_id },
          update: {
            current_count: group._count.user_id,
            updated_at: new Date(),
          },
          create: {
            study_area_id: group.study_area_id,
            current_count: group._count.user_id,
          },
        });
      }
    }

    // Get all active study areas and set count to 0 if no live users
    const allActiveAreas = await prisma.study_areas.findMany({
      where: { is_active: true },
      select: { study_area_id: true },
    });

    for (const area of allActiveAreas) {
      const hasLiveUsers = areasWithCounts.some(
        (g) => g.study_area_id === area.study_area_id
      );
      if (!hasLiveUsers) {
        await prisma.area_occupancy.upsert({
          where: { study_area_id: area.study_area_id },
          update: {
            current_count: 0,
            updated_at: new Date(),
          },
          create: {
            study_area_id: area.study_area_id,
            current_count: 0,
          },
        });
      }
    }
  } catch (error) {
    console.error('Occupancy recalculation error:', error);
    // Don't throw - this is a background task
  }
}

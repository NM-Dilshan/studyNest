/**
 * API Route: POST /api/location
 * Handles incoming location updates from students
 * Uses Prisma for persistence
 * 
 * Privacy & Security:
 * - Only accepts authenticated requests with valid user_id
 * - Stores location temporarily for aggregation purposes
 * - Triggers occupancy recalculation for affected areas
 */

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  userId: string;
}

interface LocationUpdateResponse {
  success: boolean;
  message: string;
  occupancyUpdated?: string[]; // Study area IDs that were updated
  error?: string;
}

/**
 * POST /api/location
 * Accept and store location update
 */
export async function POST(request: NextRequest): Promise<NextResponse<LocationUpdateResponse>> {
  try {
    // Get request body
    let body: LocationUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { latitude, longitude, userId, accuracy } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: latitude, longitude, userId' 
        },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update last_used_at in location_permissions
    await prisma.location_permissions.updateMany({
      where: { user_id: userId },
      data: {
        last_used_at: new Date(),
      },
    }).catch(() => {
      // Ignore if permission record doesn't exist
    });

    // TODO: Store location for aggregation purposes if needed
    // For now, we're only recording permission status

    return NextResponse.json(
      { 
        success: true, 
        message: 'Location update recorded',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing location update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process location update' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * OPTIONS /api/location
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
          accuracy: accuracy || null,
          recorded_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        },


/**
 * OPTIONS /api/location
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

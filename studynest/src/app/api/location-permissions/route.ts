/**
 * API Route: POST /api/location-permissions
 * Handles location permission recording for GDPR compliance
 * Uses Prisma for persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PermissionUpdateRequest {
  user_id: string;
  permission_status: 'granted' | 'denied' | 'revoked';
  granted_at?: string | null;
  last_used_at?: string | null;
  revoked_at?: string | null;
}

/**
 * POST /api/location-permissions
 * Record location permission status
 */
export async function POST(request: NextRequest) {
  try {
    const body: PermissionUpdateRequest = await request.json();
    const { user_id, permission_status, granted_at, last_used_at, revoked_at } = body;

    if (!user_id || !permission_status) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, permission_status' },
        { status: 400 }
      );
    }

    // Upsert permission record
    const result = await prisma.location_permissions.upsert({
      where: { user_id },
      update: {
        permission_status,
        granted_at: granted_at ? new Date(granted_at) : undefined,
        last_used_at: last_used_at ? new Date(last_used_at) : undefined,
        revoked_at: revoked_at ? new Date(revoked_at) : undefined,
      },
      create: {
        permission_id: crypto.getRandomValues(new Uint8Array(16)).toString(),
        user_id,
        permission_status,
        granted_at: granted_at ? new Date(granted_at) : null,
        last_used_at: last_used_at ? new Date(last_used_at) : null,
        revoked_at: revoked_at ? new Date(revoked_at) : null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Permission recorded', data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error recording permission:', error);
    return NextResponse.json(
      { error: 'Failed to record permission' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS
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

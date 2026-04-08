import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// UUID v4-like check for hall IDs.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USER_ID_REGEX = /^[A-Za-z0-9_-]{3,100}$/;

interface FavouritePayload {
  userId?: unknown;
  hallId?: unknown;
}

function normalizeUserId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return USER_ID_REGEX.test(trimmed) ? trimmed : null;
}

function normalizeHallId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * GET /api/student/favourites?userId=<id>
 * Returns the user's favourite hall IDs
 */
export async function GET(request: NextRequest) {
  try {
    const userId = normalizeUserId(request.nextUrl.searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Valid userId is required' },
        { status: 400 }
      );
    }

    const favourites = await prisma.favorite_halls.findMany({
      where: { student_id: userId },
      include: {
        lecture_halls: true,
      },
    });

    // Map to hall-like objects so we can reuse the same FreeHallResult type
    const data = favourites.map(fav => ({
      id: fav.lecture_halls.hall_id,
      name: fav.lecture_halls.hall_name,
      building: fav.lecture_halls.building || 'Unknown',
      floor: fav.lecture_halls.floor || 0,
      capacity: fav.lecture_halls.capacity || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch favourites';
    console.error('Error fetching favourites:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/favourites
 * Add a hall to favourites: { userId, hallId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FavouritePayload;
    const userId = normalizeUserId(body.userId);
    const hallId = normalizeHallId(body.hallId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Valid userId is required' },
        { status: 400 }
      );
    }

    if (!hallId) {
      return NextResponse.json(
        { success: false, error: 'Valid hallId (UUID) is required' },
        { status: 400 }
      );
    }

    const hall = await prisma.lecture_halls.findUnique({
      where: { hall_id: hallId },
      select: { hall_id: true },
    });

    if (!hall) {
      return NextResponse.json(
        { success: false, error: 'Lecture hall not found' },
        { status: 404 }
      );
    }

    await prisma.favorite_halls.upsert({
      where: {
        student_id_hall_id: {
          student_id: userId,
          hall_id: hallId,
        },
      },
      update: {},
      create: {
        student_id: userId,
        hall_id: hallId,
      },
    });

    return NextResponse.json({ success: true, message: 'Added to favourites' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add favourite';
    console.error('Error adding favourite:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/student/favourites
 * Remove a hall from favourites: { userId, hallId }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as FavouritePayload;
    const userId = normalizeUserId(body.userId);
    const hallId = normalizeHallId(body.hallId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Valid userId is required' },
        { status: 400 }
      );
    }

    if (!hallId) {
      return NextResponse.json(
        { success: false, error: 'Valid hallId (UUID) is required' },
        { status: 400 }
      );
    }

    await prisma.favorite_halls.deleteMany({
      where: {
        student_id: userId,
        hall_id: hallId,
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from favourites' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove favourite';
    console.error('Error removing favourite:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

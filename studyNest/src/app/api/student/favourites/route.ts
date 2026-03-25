import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple UUID v4 regex check
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/student/favourites?userId=<uuid>
 * Returns the user's favourite hall IDs
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // If userId is not a valid UUID, return empty (mock user scenario)
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json({ success: true, data: [] });
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
  } catch (error: any) {
    console.error('Error fetching favourites:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch favourites' },
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
    const body = await request.json();
    const { userId, hallId } = body;

    if (!userId || !hallId) {
      return NextResponse.json(
        { success: false, error: 'userId and hallId are required' },
        { status: 400 }
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
  } catch (error: any) {
    console.error('Error adding favourite:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add favourite' },
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
    const body = await request.json();
    const { userId, hallId } = body;

    if (!userId || !hallId) {
      return NextResponse.json(
        { success: false, error: 'userId and hallId are required' },
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
  } catch (error: any) {
    console.error('Error removing favourite:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to remove favourite' },
      { status: 500 }
    );
  }
}

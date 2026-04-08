import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/timetable/[id]
 * Get a single timetable slot
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timetableId = parseInt(id);

    if (isNaN(timetableId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const slot = await prisma.timetable.findUnique({
      where: { timetable_id: timetableId },
      include: {
        lecture_halls: {
          select: { hall_name: true, building: true },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: 'Timetable slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: slot.timetable_id,
        hall_id: slot.hall_id,
        academic_year: slot.academic_year,
        semester: slot.semester,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time.toISOString().substring(11, 19),
        end_time: slot.end_time.toISOString().substring(11, 19),
        subject_code: slot.subject_code,
        subject_name: slot.subject_name,
        group_name: slot.group_name,
        lecturer_name: slot.lecturer_name,
        raw_hall_name: slot.raw_hall_name,
        is_reserved: slot.is_reserved,
        created_at: slot.created_at?.toISOString(),
        hall_name: slot.lecture_halls?.hall_name,
        building: slot.lecture_halls?.building,
      },
    });
  } catch (error: any) {
    console.error('Error fetching timetable slot:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch timetable slot' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/timetable/[id]
 * Update a timetable slot
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timetableId = parseInt(id);

    if (isNaN(timetableId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if slot exists
    const existing = await prisma.timetable.findUnique({
      where: { timetable_id: timetableId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Timetable slot not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (body.hall_id !== undefined) updateData.hall_id = body.hall_id || null; // null = Unassigned
    if (body.day_of_week !== undefined) updateData.day_of_week = body.day_of_week;
    if (body.start_time !== undefined) updateData.start_time = new Date(`1970-01-01T${body.start_time}Z`);
    if (body.end_time !== undefined) updateData.end_time = new Date(`1970-01-01T${body.end_time}Z`);
    if (body.subject_code !== undefined) updateData.subject_code = body.subject_code || null;
    if (body.subject_name !== undefined) updateData.subject_name = body.subject_name || null;
    if (body.group_name !== undefined) updateData.group_name = body.group_name || null;
    if (body.lecturer_name !== undefined) updateData.lecturer_name = body.lecturer_name || null;
    if (body.raw_hall_name !== undefined) updateData.raw_hall_name = body.raw_hall_name || null;
    if (body.is_reserved !== undefined) updateData.is_reserved = body.is_reserved;
    if (body.academic_year !== undefined) updateData.academic_year = body.academic_year ? parseInt(body.academic_year) : null;
    if (body.semester !== undefined) updateData.semester = body.semester ? parseInt(body.semester) : null;

    const updated = await prisma.timetable.update({
      where: { timetable_id: timetableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Timetable slot updated successfully',
      data: {
        id: updated.timetable_id,
        hall_id: updated.hall_id,
        academic_year: updated.academic_year,
        semester: updated.semester,
        day_of_week: updated.day_of_week,
        start_time: updated.start_time.toISOString().substring(11, 19),
        end_time: updated.end_time.toISOString().substring(11, 19),
        subject_code: updated.subject_code,
        subject_name: updated.subject_name,
        group_name: updated.group_name,
        lecturer_name: updated.lecturer_name,
        raw_hall_name: updated.raw_hall_name,
        is_reserved: updated.is_reserved,
        created_at: updated.created_at?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating timetable slot:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update timetable slot' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timetable/[id]
 * Delete a timetable slot
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timetableId = parseInt(id);

    if (isNaN(timetableId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timetable ID' },
        { status: 400 }
      );
    }

    const existing = await prisma.timetable.findUnique({
      where: { timetable_id: timetableId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Timetable slot not found' },
        { status: 404 }
      );
    }

    await prisma.timetable.delete({
      where: { timetable_id: timetableId },
    });

    return NextResponse.json({
      success: true,
      message: 'Timetable slot deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting timetable slot:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete timetable slot' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/timetable?hall_id=xxx
 * Returns timetable slots, optionally filtered by hall_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hallId = searchParams.get('hall_id');

    const where: any = {};
    if (hallId) {
      where.hall_id = hallId;
    }
    const academicYear = searchParams.get('academic_year');
    if (academicYear) {
      where.academic_year = parseInt(academicYear);
    }
    const semester = searchParams.get('semester');
    if (semester) {
      where.semester = parseInt(semester);
    }

    const slots = await prisma.timetable.findMany({
      where,
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' },
      ],
      include: {
        lecture_halls: {
          select: { hall_name: true, building: true },
        },
      },
    });

    // Map DB fields to frontend-friendly format
    const data = slots.map((slot) => ({
      id: slot.timetable_id,
      hall_id: slot.hall_id,
      academic_year: slot.academic_year,
      semester: slot.semester,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time.toISOString().substring(11, 19), // HH:MM:SS
      end_time: slot.end_time.toISOString().substring(11, 19),
      subject_code: slot.subject_code || null,
      subject_name: slot.subject_name || null,
      group_name: slot.group_name || null,
      lecturer_name: slot.lecturer_name || null,
      is_reserved: slot.is_reserved ?? true,
      created_at: slot.created_at?.toISOString() || null,
      hall_name: slot.lecture_halls?.hall_name || null,
      building: slot.lecture_halls?.building || null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timetable
 * Create a single timetable slot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.hall_id) {
      return NextResponse.json(
        { success: false, error: 'hall_id is required' },
        { status: 400 }
      );
    }
    if (!body.day_of_week) {
      return NextResponse.json(
        { success: false, error: 'day_of_week is required' },
        { status: 400 }
      );
    }
    if (!body.start_time || !body.end_time) {
      return NextResponse.json(
        { success: false, error: 'start_time and end_time are required' },
        { status: 400 }
      );
    }

    // Verify hall exists
    const hall = await prisma.lecture_halls.findUnique({
      where: { hall_id: body.hall_id },
    });
    if (!hall) {
      return NextResponse.json(
        { success: false, error: 'Lecture hall not found' },
        { status: 404 }
      );
    }

    // Parse time strings to Date objects (Prisma Time type uses Date with date part ignored)
    const startTime = new Date(`1970-01-01T${body.start_time}Z`);
    const endTime = new Date(`1970-01-01T${body.end_time}Z`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format. Use HH:MM or HH:MM:SS' },
        { status: 400 }
      );
    }

    const newSlot = await prisma.timetable.create({
      data: {
        hall_id: body.hall_id,
        academic_year: body.academic_year ? parseInt(body.academic_year) : null,
        semester: body.semester ? parseInt(body.semester) : null,
        day_of_week: body.day_of_week,
        start_time: startTime,
        end_time: endTime,
        subject_code: body.subject_code || null,
        subject_name: body.subject_name || null,
        group_name: body.group_name || null,
        lecturer_name: body.lecturer_name || null,
        is_reserved: body.is_reserved ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Timetable slot created successfully',
        data: {
          id: newSlot.timetable_id,
          hall_id: newSlot.hall_id,
          academic_year: newSlot.academic_year,
          semester: newSlot.semester,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time.toISOString().substring(11, 19),
          end_time: newSlot.end_time.toISOString().substring(11, 19),
          subject_code: newSlot.subject_code,
          subject_name: newSlot.subject_name,
          group_name: newSlot.group_name,
          lecturer_name: newSlot.lecturer_name,
          is_reserved: newSlot.is_reserved,
          created_at: newSlot.created_at?.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating timetable slot:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create timetable slot' },
      { status: 500 }
    );
  }
}

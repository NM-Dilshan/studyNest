import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/timetable/bulk
 * Bulk insert timetable slots (for CSV upload).
 * hall_id is now optional — null means "Unassigned".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'records array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate and transform records
    const validRecords = [];
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      if (!record.day_of_week) {
        errors.push(`Row ${i + 1}: day_of_week is missing`);
        continue;
      }
      if (!record.start_time || !record.end_time) {
        errors.push(`Row ${i + 1}: start_time or end_time is missing`);
        continue;
      }

      const startTime = new Date(`1970-01-01T${record.start_time}Z`);
      const endTime = new Date(`1970-01-01T${record.end_time}Z`);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        errors.push(`Row ${i + 1}: Invalid time format`);
        continue;
      }

      // hall_id is optional — null = Unassigned session
      const parsedYear = record.academic_year != null ? Number(record.academic_year) : null;
      const parsedSemester = record.semester != null ? Number(record.semester) : null;

      validRecords.push({
        hall_id: record.hall_id || null,
        academic_year: isNaN(parsedYear as number) ? null : parsedYear,
        semester: isNaN(parsedSemester as number) ? null : parsedSemester,
        day_of_week: record.day_of_week,
        start_time: startTime,
        end_time: endTime,
        subject_code: record.subject_code || null,
        subject_name: record.subject_name || null,
        group_name: record.group_name || null,
        lecturer_name: record.lecturer_name || null,
        raw_hall_name: record.raw_hall_name || null,
        is_reserved: record.is_reserved ?? true,
      });
    }

    if (validRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid records found', details: errors },
        { status: 400 }
      );
    }

    // Bulk insert using createMany
    const result = await prisma.timetable.createMany({
      data: validRecords,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully inserted ${result.count} timetable slots`,
        count: result.count,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error bulk inserting timetable slots:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to bulk insert timetable slots' },
      { status: 500 }
    );
  }
}

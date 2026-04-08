import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/free-halls
 * Returns lecture halls that are currently free (not scheduled in timetable right now)
 */
export async function GET() {
  try {
    // Get current day and time
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];

    // Format current time as HH:MM:SS for comparison
    const currentTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Colombo',
    });

    // Get all active, non-maintenance halls
    const allHalls = await prisma.lecture_halls.findMany({
      where: {
        is_active: true,
      },
      orderBy: { hall_name: 'asc' },
    });

    // Get halls that are currently occupied (have a timetable entry for right now)
    const occupiedEntries = await prisma.timetable.findMany({
      where: {
        day_of_week: currentDay,
        is_reserved: true,
      },
      select: {
        hall_id: true,
        start_time: true,
        end_time: true,
      },
    });

    // Filter occupied halls by checking if current time falls within any slot
    const occupiedHallIds = new Set<string>();
    for (const entry of occupiedEntries) {
      const startTime = entry.start_time.toISOString().substring(11, 19); // Extract HH:MM:SS
      const endTime = entry.end_time.toISOString().substring(11, 19);
        if (entry.hall_id && currentTime >= startTime && currentTime < endTime) {
        occupiedHallIds.add(entry.hall_id);
      }
    }

    // Map halls to response format, marking which are free
    const halls = allHalls.map(hall => ({
      id: hall.hall_id,
      name: hall.hall_name,
      building: hall.building || 'Unknown',
      floor: hall.floor || 0,
      capacity: hall.capacity || 0,
      is_free_now: !occupiedHallIds.has(hall.hall_id),
      maintenance_status: hall.maintenance_status || 'available',
      projector: hall.projector || false,
      wifi: hall.wifi || false,
      ac: hall.ac || false,
      whiteboard: hall.whiteboard || false,
      wheelchair_accessible: false,
      power_sockets: false,
      latitude: null,
      longitude: null,
    }));

    return NextResponse.json({ success: true, data: halls });
  } catch (error: any) {
    console.error('Error fetching free halls:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch free halls' },
      { status: 500 }
    );
  }
}

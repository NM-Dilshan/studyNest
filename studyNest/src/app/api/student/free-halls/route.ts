import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const COLOMBO_TIMEZONE = 'Asia/Colombo';

const MAINTENANCE_REASON: Record<string, string> = {
  under_maintenance: 'Under maintenance',
  reserved_exam: 'Reserved for an examination',
  reserved_event: 'Reserved for a special event',
  closed: 'Temporarily closed',
};

function toSeconds(hhmmss: string): number {
  const [hh, mm, ss] = hhmmss.split(':').map((part) => parseInt(part, 10));
  if ([hh, mm, ss].some((value) => Number.isNaN(value))) {
    return -1;
  }
  return hh * 3600 + mm * 60 + ss;
}

function getColomboDayAndTime(now: Date): { day: string; time: string; seconds: number } {
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: COLOMBO_TIMEZONE,
  }).format(now);

  const timeParts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: COLOMBO_TIMEZONE,
  }).formatToParts(now);

  const hh = timeParts.find((part) => part.type === 'hour')?.value ?? '00';
  const mm = timeParts.find((part) => part.type === 'minute')?.value ?? '00';
  const ss = timeParts.find((part) => part.type === 'second')?.value ?? '00';
  const time = `${hh}:${mm}:${ss}`;

  return {
    day,
    time,
    seconds: toSeconds(time),
  };
}

/**
 * GET /api/student/free-halls
 * Returns lecture halls that are currently free (not scheduled in timetable right now)
 */
export async function GET() {
  try {
    const now = new Date();
    const { day: currentDay, seconds: nowSeconds } = getColomboDayAndTime(now);

    // Get all active halls and mark maintenance/reservation blocks separately.
    const allHalls = await prisma.lecture_halls.findMany({
      where: {
        is_active: true,
      },
      orderBy: { hall_name: 'asc' },
    });

    // Pull all reserved slots for the current day and compute occupancy windows in memory.
    const daySlots = await prisma.timetable.findMany({
      where: {
        day_of_week: currentDay,
        is_reserved: true,
        hall_id: {
          not: null,
        },
      },
      orderBy: {
        start_time: 'asc',
      },
      select: {
        hall_id: true,
        start_time: true,
        end_time: true,
      },
    });

    const slotsByHallId = new Map<string, Array<{ start: string; end: string; startSeconds: number; endSeconds: number }>>();
    for (const slot of daySlots) {
      if (!slot.hall_id) continue;

      const start = slot.start_time.toISOString().substring(11, 19);
      const end = slot.end_time.toISOString().substring(11, 19);
      const grouped = slotsByHallId.get(slot.hall_id) || [];
      grouped.push({
        start,
        end,
        startSeconds: toSeconds(start),
        endSeconds: toSeconds(end),
      });
      slotsByHallId.set(slot.hall_id, grouped);
    }

    const halls = allHalls.map((hall) => {
      const maintenanceStatus = hall.maintenance_status || 'available';
      const blockedByMaintenance = maintenanceStatus !== 'available';
      const hallSlots = slotsByHallId.get(hall.hall_id) || [];

      const activeSlot = hallSlots.find(
        (slot) => nowSeconds >= slot.startSeconds && nowSeconds < slot.endSeconds
      );
      const nextSlot = hallSlots.find((slot) => slot.startSeconds > nowSeconds);

      const occupiedByTimetable = Boolean(activeSlot);
      const canBookNow = !blockedByMaintenance && !occupiedByTimetable;

      let currentStatus: 'free_now' | 'occupied_by_timetable' | 'blocked_by_maintenance';
      if (blockedByMaintenance) {
        currentStatus = 'blocked_by_maintenance';
      } else if (occupiedByTimetable) {
        currentStatus = 'occupied_by_timetable';
      } else {
        currentStatus = 'free_now';
      }

      const occupiedUntil = activeSlot ? activeSlot.end : null;
      const freeUntil = !activeSlot && nextSlot ? nextSlot.start : null;
      const nextFreeStart = activeSlot ? activeSlot.end : null;
      const nextFreeEnd = activeSlot && nextSlot ? nextSlot.start : null;

      return {
        id: hall.hall_id,
        name: hall.hall_name,
        building: hall.building || 'Unknown',
        floor: hall.floor || 0,
        capacity: hall.capacity || 0,
        is_free_now: canBookNow,
        can_book_now: canBookNow,
        current_status: currentStatus,
        blocked_reason: blockedByMaintenance ? MAINTENANCE_REASON[maintenanceStatus] || 'Unavailable' : null,
        occupied_until: occupiedUntil,
        free_until: freeUntil,
        next_free_start: nextFreeStart,
        next_free_end: nextFreeEnd,
        maintenance_status: maintenanceStatus,
        projector: hall.projector || false,
        wifi: hall.wifi || false,
        ac: hall.ac || false,
        whiteboard: hall.whiteboard || false,
        wheelchair_accessible: false,
        power_sockets: false,
        latitude: null,
        longitude: null,
      };
    });

    return NextResponse.json({ success: true, data: halls });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch free halls';
    console.error('Error fetching free halls:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

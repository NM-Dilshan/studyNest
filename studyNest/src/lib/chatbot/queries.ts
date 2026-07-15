import { prisma } from '@/lib/prisma'
import {
  ComplaintStatusItem,
  ComplaintSummary,
  CrowdedStudyAreaInfo,
  FreeHallInfo,
  HallCountInfo,
  TodaySummary,
} from './types'

export async function getMostComplainedHall(): Promise<HallCountInfo | null> {
  const grouped = await prisma.complaints.groupBy({
    by: ['hall_id'],
    where: {
      hall_id: {
        not: null,
      },
    },
    _count: {
      complaint_id: true,
    },
    orderBy: {
      _count: {
        complaint_id: 'desc',
      },
    },
    take: 1,
  })

  const top = grouped[0]
  if (!top?.hall_id) return null

  const hall = await prisma.lecture_halls.findUnique({
    where: { hall_id: top.hall_id },
    select: { hall_name: true },
  })

  return {
    hallId: top.hall_id,
    hallName: hall?.hall_name || 'Unknown Hall',
    complaintCount: top._count.complaint_id,
  }
}

export async function getComplaintSummary(): Promise<ComplaintSummary> {
  const [total, pending, viewed, inProgress, resolved] = await Promise.all([
    prisma.complaints.count(),
    prisma.complaints.count({ where: { status: { equals: 'Pending', mode: 'insensitive' } } }),
    prisma.complaints.count({ where: { status: { equals: 'Viewed', mode: 'insensitive' } } }),
    prisma.complaints.count({ where: { status: { equals: 'In Progress', mode: 'insensitive' } } }),
    prisma.complaints.count({ where: { status: { equals: 'Resolved', mode: 'insensitive' } } }),
  ])

  return { total, pending, viewed, inProgress, resolved }
}

export async function getPendingCount(): Promise<number> {
  return prisma.complaints.count({
    where: {
      status: {
        equals: 'Pending',
        mode: 'insensitive',
      },
    },
  })
}

export async function getResolvedCount(): Promise<number> {
  return prisma.complaints.count({
    where: {
      status: {
        equals: 'Resolved',
        mode: 'insensitive',
      },
    },
  })
}

export async function getComplaintStatusById(
  complaintId: number
): Promise<ComplaintStatusItem | null> {
  const complaint = await prisma.complaints.findUnique({
    where: { complaint_id: complaintId },
    select: {
      complaint_id: true,
      status: true,
      issue_category: true,
      created_at: true,
    },
  })

  if (!complaint) {
    return null
  }

  return {
    complaintId: complaint.complaint_id,
    status: complaint.status || 'Pending',
    issueCategory: complaint.issue_category,
    createdAt: complaint.created_at,
  }
}

export async function getMyLatestComplaintStatuses(studentId: string): Promise<ComplaintStatusItem[]> {
  const complaints = await prisma.complaints.findMany({
    where: {
      student_id: studentId,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 3,
    select: {
      complaint_id: true,
      status: true,
      issue_category: true,
      created_at: true,
    },
  })

  return complaints.map((complaint) => ({
    complaintId: complaint.complaint_id,
    status: complaint.status || 'Pending',
    issueCategory: complaint.issue_category,
    createdAt: complaint.created_at,
  }))
}

export async function getComplaintsByHall(hallQuery: string): Promise<HallCountInfo | null> {
  const hall = await prisma.lecture_halls.findFirst({
    where: {
      OR: [
        {
          hall_name: {
            equals: hallQuery,
            mode: 'insensitive',
          },
        },
        {
          hall_name: {
            contains: hallQuery,
            mode: 'insensitive',
          },
        },
      ],
    },
    select: {
      hall_id: true,
      hall_name: true,
    },
  })

  if (!hall) return null

  const complaintCount = await prisma.complaints.count({
    where: {
      hall_id: hall.hall_id,
    },
  })

  return {
    hallId: hall.hall_id,
    hallName: hall.hall_name,
    complaintCount,
  }
}

export async function getFreeLectureHalls(limit = 5): Promise<FreeHallInfo[]> {
  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDay = days[now.getDay()]

  const currentTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Colombo',
  })

  const [allHalls, reservedEntries] = await Promise.all([
    prisma.lecture_halls.findMany({
      where: {
        is_active: true,
      },
      orderBy: { hall_name: 'asc' },
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        floor: true,
      },
    }),
    prisma.timetable.findMany({
      where: {
        day_of_week: currentDay,
        is_reserved: true,
      },
      select: {
        hall_id: true,
        start_time: true,
        end_time: true,
      },
    }),
  ])

  const occupied = new Set<string>()
  for (const item of reservedEntries) {
    const start = item.start_time.toISOString().substring(11, 19)
    const end = item.end_time.toISOString().substring(11, 19)
    if (currentTime >= start && currentTime < end && item.hall_id) {
      occupied.add(item.hall_id)
    }
  }

  return allHalls
    .filter((hall) => !occupied.has(hall.hall_id))
    .slice(0, limit)
    .map((hall) => ({
      hallId: hall.hall_id,
      hallName: hall.hall_name,
      building: hall.building,
      floor: hall.floor,
    }))
}

export async function getMostCrowdedStudyArea(): Promise<CrowdedStudyAreaInfo | null> {
  const top = await prisma.area_occupancy.findFirst({
    orderBy: {
      current_count: 'desc',
    },
    include: {
      study_areas: {
        select: {
          study_area_id: true,
          area_name: true,
          capacity: true,
        },
      },
    },
  })

  if (!top?.study_areas) return null

  const capacity = top.study_areas.capacity || 0
  const occupancyPercentage = capacity > 0 ? Math.round((top.current_count / capacity) * 100) : 0

  return {
    studyAreaId: top.study_areas.study_area_id,
    areaName: top.study_areas.area_name,
    currentCount: top.current_count,
    capacity,
    occupancyPercentage,
  }
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const [createdToday, pending, viewed, inProgress, resolved] = await Promise.all([
    prisma.complaints.count({
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.complaints.count({
      where: {
        status: { equals: 'Pending', mode: 'insensitive' },
        created_at: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.complaints.count({
      where: {
        status: { equals: 'Viewed', mode: 'insensitive' },
        created_at: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.complaints.count({
      where: {
        status: { equals: 'In Progress', mode: 'insensitive' },
        created_at: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.complaints.count({
      where: {
        status: { equals: 'Resolved', mode: 'insensitive' },
        created_at: {
          gte: start,
          lt: end,
        },
      },
    }),
  ])

  return {
    total: createdToday,
    createdToday,
    pending,
    viewed,
    inProgress,
    resolved,
  }
}

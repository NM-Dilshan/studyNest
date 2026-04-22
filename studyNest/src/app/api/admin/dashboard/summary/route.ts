import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TopUsageItem = {
  name: string
  usage: number
}

export async function GET() {
  try {
    const [activeHalls, activeStudyAreas, volunteerTotal, todaysHallUpdates, todaysAreaUpdates] =
      await Promise.all([
        prisma.lecture_halls.count({ where: { is_active: true } }),
        prisma.study_areas.count({ where: { is_active: true } }),
        prisma.users.count({
          where: {
            role: {
              equals: 'volunteer',
              mode: 'insensitive',
            },
            is_active: true,
          },
        }),
        prisma.volunteer_hall_updates.findMany({
          where: {
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          select: { volunteer_id: true },
        }),
        prisma.volunteer_study_area_updates.findMany({
          where: {
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          select: { volunteer_id: true },
        }),
      ])

    const activeTodayVolunteerIds = new Set<string>([
      ...todaysHallUpdates.map((item) => item.volunteer_id),
      ...todaysAreaUpdates.map((item) => item.volunteer_id),
    ])

    const [hallComplaintGroups, areaComplaintGroups] = await Promise.all([
      prisma.complaints.groupBy({
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
        take: 5,
      }),
      prisma.complaints.groupBy({
        by: ['study_area_id'],
        where: {
          study_area_id: {
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
        take: 5,
      }),
    ])

    const hallIds = hallComplaintGroups
      .map((item) => item.hall_id)
      .filter((id): id is string => Boolean(id))
    const areaIds = areaComplaintGroups
      .map((item) => item.study_area_id)
      .filter((id): id is string => Boolean(id))

    const [hallNames, areaNames] = await Promise.all([
      prisma.lecture_halls.findMany({
        where: {
          hall_id: {
            in: hallIds,
          },
        },
        select: {
          hall_id: true,
          hall_name: true,
        },
      }),
      prisma.study_areas.findMany({
        where: {
          study_area_id: {
            in: areaIds,
          },
        },
        select: {
          study_area_id: true,
          area_name: true,
        },
      }),
    ])

    const hallNameMap = new Map(hallNames.map((item) => [item.hall_id, item.hall_name]))
    const areaNameMap = new Map(areaNames.map((item) => [item.study_area_id, item.area_name]))

    const topLectureHalls: TopUsageItem[] = hallComplaintGroups.map((item) => ({
      name: hallNameMap.get(item.hall_id || '') || 'Unknown Hall',
      usage: item._count.complaint_id,
    }))

    const topStudyAreas: TopUsageItem[] = areaComplaintGroups.map((item) => ({
      name: areaNameMap.get(item.study_area_id || '') || 'Unknown Area',
      usage: item._count.complaint_id,
    }))

    return NextResponse.json({
      success: true,
      summary: {
        activeSpaces: activeHalls + activeStudyAreas,
        activeHalls,
        activeStudyAreas,
        totalVolunteers: volunteerTotal,
        activeVolunteersToday: activeTodayVolunteerIds.size,
      },
      topLectureHalls,
      topStudyAreas,
    })
  } catch (error) {
    console.error('Error fetching admin dashboard summary:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
      },
      { status: 500 }
    )
  }
}

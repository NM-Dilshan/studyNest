import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [totalVolunteers, totalHalls, totalStudyAreas, activeHallUpdatesToday, activeAreaUpdatesToday] =
      await Promise.all([
        prisma.users.count({
          where: {
            role: {
              equals: 'volunteer',
              mode: 'insensitive',
            },
          },
        }),
        prisma.lecture_halls.count({
          where: {
            is_active: {
              equals: true,
            },
          },
        }),
        prisma.study_areas.count({
          where: {
            is_active: {
              equals: true,
            },
          },
        }),
        prisma.volunteer_hall_updates.findMany({
          where: {
            created_at: {
              gte: startOfToday,
            },
          },
          select: {
            volunteer_id: true,
          },
        }),
        prisma.volunteer_study_area_updates.findMany({
          where: {
            created_at: {
              gte: startOfToday,
            },
          },
          select: {
            volunteer_id: true,
          },
        }),
      ])

    const activeVolunteerIdSet = new Set<string>()

    for (const update of activeHallUpdatesToday) {
      if (update.volunteer_id) {
        activeVolunteerIdSet.add(update.volunteer_id)
      }
    }

    for (const update of activeAreaUpdatesToday) {
      if (update.volunteer_id) {
        activeVolunteerIdSet.add(update.volunteer_id)
      }
    }

    const halls = totalHalls
    const areas = totalStudyAreas

    return Response.json({
      success: true,
      data: {
        volunteers: {
          total: totalVolunteers,
          activeToday: activeVolunteerIdSet.size,
        },
        activeSpaces: {
          total: halls + areas,
          halls,
          areas,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch admin dashboard stats',
      },
      { status: 500 }
    )
  }
}

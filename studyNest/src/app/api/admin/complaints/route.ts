async function getPrismaClient() {
  try {
    const prismaModule = await import('@/lib/prisma')
    return prismaModule.prisma
  } catch (error) {
    console.error('Failed to initialize Prisma client for /api/admin/complaints:', error)
    return null
  }
}

type ComplaintRow = {
  complaint_id: number
  student_id: string
  hall_id: string | null
  study_area_id: string | null
  issue_category: string
  description: string
  photo_url: string | null
  status: string | null
  created_at: Date | null
}

type UserRow = {
  user_id: string
  name: string
  email: string
}

type HallRow = {
  hall_id: string
  hall_name: string
}

type StudyAreaRow = {
  study_area_id: string
  area_name: string
}

// GET all complaints with related hall, study area, and student details
export async function GET() {
  try {
    const prisma = await getPrismaClient()
    if (!prisma) {
      return Response.json(
        {
          success: false,
          error: 'Database is not configured. Check DATABASE_URL environment variable.',
        },
        { status: 500 }
      )
    }

    const complaints = (await prisma.complaints.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        complaint_id: true,
        student_id: true,
        hall_id: true,
        study_area_id: true,
        issue_category: true,
        description: true,
        photo_url: true,
        status: true,
        created_at: true,
      },
    })) as ComplaintRow[]

    const studentIds = Array.from(new Set(complaints.map((item) => item.student_id).filter(Boolean)))
    const hallIds = Array.from(new Set(complaints.map((item) => item.hall_id).filter(Boolean))) as string[]
    const studyAreaIds = Array.from(
      new Set(complaints.map((item) => item.study_area_id).filter(Boolean))
    ) as string[]

    const [users, lectureHalls, studyAreas] = await Promise.all([
      studentIds.length
        ? prisma.users.findMany({
            where: { user_id: { in: studentIds } },
            select: { user_id: true, name: true, email: true },
          })
        : Promise.resolve([]),
      hallIds.length
        ? prisma.lecture_halls.findMany({
            where: { hall_id: { in: hallIds } },
            select: { hall_id: true, hall_name: true },
          })
        : Promise.resolve([]),
      studyAreaIds.length
        ? prisma.study_areas.findMany({
            where: { study_area_id: { in: studyAreaIds } },
            select: { study_area_id: true, area_name: true },
          })
        : Promise.resolve([]),
    ])

    const userMap = new Map((users as UserRow[]).map((user) => [user.user_id, user]))
    const hallMap = new Map((lectureHalls as HallRow[]).map((hall) => [hall.hall_id, hall]))
    const studyAreaMap = new Map(
      (studyAreas as StudyAreaRow[]).map((area) => [area.study_area_id, area])
    )

    const data = complaints.map((complaint) => ({
      ...complaint,
      users: userMap.has(complaint.student_id)
        ? {
            name: userMap.get(complaint.student_id)?.name ?? null,
            email: userMap.get(complaint.student_id)?.email ?? null,
          }
        : null,
      lecture_halls: complaint.hall_id
        ? {
            hall_name: hallMap.get(complaint.hall_id)?.hall_name ?? 'Unknown Hall',
            hall_id: complaint.hall_id,
          }
        : null,
      study_areas: complaint.study_area_id
        ? {
            area_name: studyAreaMap.get(complaint.study_area_id)?.area_name ?? 'Unknown Study Area',
            study_area_id: complaint.study_area_id,
          }
        : null,
    }))

    return Response.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching admin complaints:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch complaints',
      },
      { status: 500 }
    )
  }
}

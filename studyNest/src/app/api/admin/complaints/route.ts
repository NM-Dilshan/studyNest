import { prisma } from '@/lib/prisma'

// GET all complaints with hall and student information
export async function GET(request: Request) {
  try {
    const complaints = await prisma.complaints.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        lecture_halls: {
          select: {
            hall_name: true,
            hall_id: true,
          },
        },
        study_areas: {
          select: {
            area_name: true,
            study_area_id: true,
          },
        },
      },
    })

    return Response.json({
      success: true,
      data: complaints,
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch complaints',
      },
      { status: 500 }
    )
  }
}

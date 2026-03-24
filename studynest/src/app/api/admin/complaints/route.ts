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
      },
    })

    // Add complaint count for each lecture hall for priority calculation
    const complaintsWithCounts = await Promise.all(
      complaints.map(async (complaint) => {
        const count = await prisma.complaints.count({
          where: { hall_id: complaint.hall_id },
        })
        return {
          ...complaint,
          complaint_count: count,
        }
      })
    )

    return Response.json({
      success: true,
      data: complaintsWithCounts,
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

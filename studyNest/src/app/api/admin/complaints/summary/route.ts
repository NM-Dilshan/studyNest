import { prisma } from '@/lib/prisma'

interface HallSummary {
  hall_id: string
  hall_name: string
  complaint_count: number
  priority: string
}

function getPriority(count: number): string {
  if (count > 10) return 'High'
  if (count > 6) return 'Medium'
  if (count > 3) return 'Normal'
  return 'Normal'
}

// GET - Hall-wise complaint summary with priorities
export async function GET(request: Request) {
  try {
    // Get all lecture halls
    const halls = await prisma.lecture_halls.findMany({
      select: {
        hall_id: true,
        hall_name: true,
      },
    })

    // Get complaint count for each hall
    const summary: HallSummary[] = await Promise.all(
      halls.map(async (hall) => {
        const count = await prisma.complaints.count({
          where: { hall_id: hall.hall_id },
        })

        return {
          hall_id: hall.hall_id,
          hall_name: hall.hall_name,
          complaint_count: count,
          priority: getPriority(count),
        }
      })
    )

    // Filter out halls with no complaints and sort by complaint count
    const filteredSummary = summary
      .filter((h) => h.complaint_count > 0)
      .sort((a, b) => b.complaint_count - a.complaint_count)

    return Response.json({
      success: true,
      data: filteredSummary,
      stats: {
        totalHalls: halls.length,
        hallsWithComplaints: filteredSummary.length,
        highPriorityHalls: filteredSummary.filter((h) => h.priority === 'High').length,
        mediumPriorityHalls: filteredSummary.filter((h) => h.priority === 'Medium').length,
        normalPriorityHalls: filteredSummary.filter((h) => h.priority === 'Normal').length,
      },
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch summary',
      },
      { status: 500 }
    )
  }
}

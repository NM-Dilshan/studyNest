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
    // Get complaint counts grouped by hall_id in a single query
    const complaintCounts = await prisma.complaints.groupBy({
      by: ['hall_id'],
      _count: {
        complaint_id: true,
      },
    })

    // Get hall names for each hall with complaints
    const hallIds = complaintCounts.map(c => c.hall_id).filter(Boolean)
    
    const halls = await prisma.lecture_halls.findMany({
      select: {
        hall_id: true,
        hall_name: true,
      },
      where: {
        hall_id: {
          in: hallIds,
        },
      },
    })

    // Combine data
    const summary: HallSummary[] = complaintCounts
      .map(complaint => {
        const hall = halls.find(h => h.hall_id === complaint.hall_id)
        return {
          hall_id: complaint.hall_id || 'unknown',
          hall_name: hall?.hall_name || 'Unknown Hall',
          complaint_count: complaint._count.complaint_id,
          priority: getPriority(complaint._count.complaint_id),
        }
      })
      .filter(h => h.complaint_count > 0)
      .sort((a, b) => b.complaint_count - a.complaint_count)

    return Response.json({
      success: true,
      data: summary,
      stats: {
        totalHalls: halls.length,
        hallsWithComplaints: summary.length,
        highPriorityHalls: summary.filter((h) => h.priority === 'High').length,
        mediumPriorityHalls: summary.filter((h) => h.priority === 'Medium').length,
        normalPriorityHalls: summary.filter((h) => h.priority === 'Normal').length,
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

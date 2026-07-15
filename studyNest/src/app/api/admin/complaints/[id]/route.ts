import { prisma } from '@/lib/prisma'

// PUT - Update complaint status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    
    const complaintId = parseInt(id, 10)
    if (isNaN(complaintId)) {
      return Response.json(
        { success: false, error: 'Invalid complaint ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return Response.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['Pending', 'Viewed', 'In Progress', 'Resolved']
    if (!validStatuses.includes(status)) {
      return Response.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Check if complaint exists
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
    })

    if (!complaint) {
      return Response.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Update complaint status
    const updated = await prisma.complaints.update({
      where: { complaint_id: complaintId },
      data: { status },
      include: {
        users: { select: { name: true } },
        lecture_halls: { select: { hall_name: true } },
      },
    })

    return Response.json({
      success: true,
      data: updated,
      message: `Complaint status updated to ${status}`,
    })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update complaint',
      },
      { status: 500 }
    )
  }
}

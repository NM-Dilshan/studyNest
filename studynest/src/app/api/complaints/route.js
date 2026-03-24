import { prisma } from '@/lib/prisma'

// GET all complaints or filter by studentId
export async function GET(request) {
  try {
    // Get studentId from query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    console.log('GET /api/complaints - studentId:', studentId)

    // Build filter object
    const where = studentId ? { student_id: studentId } : {}

    const complaints = await prisma.complaints.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: { name: true, email: true },
        },
        lecture_halls: {
          select: { hall_name: true },
        },
        study_areas: {
          select: { area_name: true },
        },
      },
    })
    
    console.log('Complaints found:', complaints.length, 'Sample:', complaints[0] ? { id: complaints[0].complaint_id, type: typeof complaints[0].complaint_id } : null)

    return Response.json({
      success: true,
      data: complaints,
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch complaints',
      },
      { status: 500 }
    )
  }
}

// POST create complaint
export async function POST(request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.student_id) {
      return Response.json(
        {
          success: false,
          error: 'Student ID is required',
        },
        { status: 400 }
      )
    }

    if (!body.issue_category) {
      return Response.json(
        {
          success: false,
          error: 'Issue category is required',
        },
        { status: 400 }
      )
    }

    if (!body.description || body.description.trim() === '') {
      return Response.json(
        {
          success: false,
          error: 'Description is required',
        },
        { status: 400 }
      )
    }

    if (!body.hall_id && !body.study_area_id) {
      return Response.json(
        {
          success: false,
          error: 'Either hall_id or study_area_id is required',
        },
        { status: 400 }
      )
    }

    // Create complaint
    const newComplaint = await prisma.complaints.create({
      data: {
        student_id: body.student_id,
        hall_id: body.hall_id || null,
        study_area_id: body.study_area_id || null,
        issue_category: body.issue_category,
        description: body.description,
        photo_url: body.photo_url || null,
        status: body.status || 'Pending',
      },
      include: {
        users: {
          select: { name: true, email: true },
        },
        lecture_halls: {
          select: { hall_name: true },
        },
        study_areas: {
          select: { area_name: true },
        },
      },
    })

    return Response.json(
      {
        success: true,
        message: 'Complaint created successfully',
        data: newComplaint,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating complaint:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to create complaint',
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET a single complaint by ID
export async function GET(request, { params }) {
  try {
    // Await params - they're a Promise in Next.js 16.x
    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('GET request - ID received:', id, 'Type:', typeof id)
    
    const complaintId = parseInt(id, 10)
    
    console.log('Parsed complaint ID:', complaintId, 'IsNaN:', isNaN(complaintId))

    if (isNaN(complaintId)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid complaint ID',
          received: id,
        },
        { status: 400 }
      )
    }

    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
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

    if (!complaint) {
      return Response.json(
        {
          success: false,
          error: 'Complaint not found',
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: complaint,
    })
  } catch (error) {
    console.error('Error fetching complaint:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch complaint',
      },
      { status: 500 }
    )
  }
}

// DELETE a complaint by ID
export async function DELETE(request, { params }) {
  try {
    // Await params - they're a Promise in Next.js 16.x
    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('DELETE request - ID received:', id, 'Type:', typeof id)
    
    const complaintId = parseInt(id, 10)
    
    console.log('Parsed complaint ID:', complaintId, 'IsNaN:', isNaN(complaintId))

    if (isNaN(complaintId)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid complaint ID',
          received: id,
        },
        { status: 400 }
      )
    }

    // Check if complaint exists
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
    })

    if (!complaint) {
      return Response.json(
        {
          success: false,
          error: 'Complaint not found',
        },
        { status: 404 }
      )
    }

    // Delete the complaint
    await prisma.complaints.delete({
      where: { complaint_id: complaintId },
    })

    return NextResponse.json({
      success: true,
      message: `Deleted complaint ${id}`,
    })
  } catch (error) {
    console.error('Error deleting complaint:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to delete complaint',
      },
      { status: 500 }
    )
  }
}

// PUT update a complaint by ID
export async function PUT(request, { params }) {
  try {
    // Await params - they're a Promise in Next.js 16.x
    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('PUT request - ID received:', id, 'Type:', typeof id)
    
    const complaintId = parseInt(id, 10)
    
    console.log('Parsed complaint ID:', complaintId, 'IsNaN:', isNaN(complaintId))

    if (isNaN(complaintId)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid complaint ID',
          received: id,
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Check if complaint exists
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
    })

    if (!complaint) {
      return Response.json(
        {
          success: false,
          error: 'Complaint not found',
        },
        { status: 404 }
      )
    }

    // Update the complaint
    const updatedComplaint = await prisma.complaints.update({
      where: { complaint_id: complaintId },
      data: {
        issue_category: body.issue_category || complaint.issue_category,
        description: body.description || complaint.description,
        photo_url: body.photo_url || complaint.photo_url,
        status: body.status || complaint.status,
        hall_id: body.hall_id !== undefined ? body.hall_id : complaint.hall_id,
        study_area_id: body.study_area_id !== undefined ? body.study_area_id : complaint.study_area_id,
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

    return Response.json({
      success: true,
      data: updatedComplaint,
    })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to update complaint',
      },
      { status: 500 }
    )
  }
}

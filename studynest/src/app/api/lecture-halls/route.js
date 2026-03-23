import { prisma } from '@/lib/prisma'

// GET all lecture halls
export async function GET() {
  try {
    const halls = await prisma.lecture_halls.findMany({
      orderBy: { created_at: 'desc' },
    })

    return Response.json({
      success: true,
      data: halls,
    })
  } catch (error) {
    console.error('Error fetching lecture halls:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch lecture halls',
      },
      { status: 500 }
    )
  }
}

// POST create lecture hall
export async function POST(request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.hall_name || body.hall_name.trim() === '') {
      return Response.json(
        {
          success: false,
          error: 'Hall name is required',
        },
        { status: 400 }
      )
    }

    // Check for unique hall_name
    const existingHall = await prisma.lecture_halls.findUnique({
      where: { hall_name: body.hall_name },
    })

    if (existingHall) {
      return Response.json(
        {
          success: false,
          error: 'Hall name must be unique',
        },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (body.floor && isNaN(parseInt(body.floor))) {
      return Response.json(
        {
          success: false,
          error: 'Floor must be a valid number',
        },
        { status: 400 }
      )
    }

    if (body.capacity && isNaN(parseInt(body.capacity))) {
      return Response.json(
        {
          success: false,
          error: 'Capacity must be a valid number',
        },
        { status: 400 }
      )
    }

    // Create lecture hall
    const newHall = await prisma.lecture_halls.create({
      data: {
        hall_name: body.hall_name,
        building: body.building || null,
        floor: body.floor ? parseInt(body.floor) : null,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        hall_type: body.hall_type || 'lecture_hall',
        projector: body.projector || false,
        wifi: body.wifi || false,
        ac: body.ac || false,
        whiteboard: body.whiteboard || false,
        maintenance_status: body.maintenance_status || 'available',
        is_active: true,
      },
    })

    return Response.json(
      {
        success: true,
        message: 'Lecture hall created successfully',
        data: newHall,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lecture hall:', error)
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to create lecture hall',
      },
      { status: 500 }
    )
  }
}

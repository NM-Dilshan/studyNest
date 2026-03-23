import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all active lecture halls
    const halls = await prisma.lecture_halls.findMany({
      where: { is_active: true },
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
      },
      take: 20,
    })

    return NextResponse.json({
      halls: halls.map((hall) => ({
        id: hall.hall_id,
        name: `${hall.hall_name}${hall.building ? ` (${hall.building})` : ''}`,
      })),
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

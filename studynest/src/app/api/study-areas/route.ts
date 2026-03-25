import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch study areas using Prisma
    const areas = await prisma.study_areas.findMany({
      where: {
        is_active: true,
      },
      include: {
        area_occupancy: true,
      },
    })

    return NextResponse.json({ areas })
  } catch (error) {
    console.error('Error fetching study areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study areas' },
      { status: 500 }
    )
  }
}

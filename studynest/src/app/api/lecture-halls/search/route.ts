import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lecture-halls/search
 * Search lecture halls by hall_name with intelligent filtering
 * 
 * Query params:
 * - q (required): search query string
 * - limit (optional, default 15): max results to return
 * 
 * Response format:
 * [
 *   { "hall_id": "...", "hall_name": "G0103" },
 *   ...
 * ]
 * 
 * Filtering strategy:
 * 1. First: halls where hall_name starts with query (case-insensitive)
 * 2. Then: halls where hall_name contains query (case-insensitive)
 * 3. Sort results alphabetically within each group
 * 4. Limit to specified number of results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50) // Cap at 50

    // Validate query parameter
    if (!query || query.length === 0) {
      return NextResponse.json([], {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Fetch all active halls once
    const allHalls = await prisma.lecture_halls.findMany({
      where: {
        is_active: true,
      },
      select: {
        hall_id: true,
        hall_name: true,
        building: true,
        floor: true,
        capacity: true,
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { hall_name: 'asc' },
      ],
    })

    const lowerQuery = query.toLowerCase()

    // Separate results into two groups
    const startsWithMatches = allHalls.filter((hall) =>
      hall.hall_name.toLowerCase().startsWith(lowerQuery)
    )

    const containsMatches = allHalls.filter(
      (hall) =>
        !hall.hall_name.toLowerCase().startsWith(lowerQuery) &&
        hall.hall_name.toLowerCase().includes(lowerQuery)
    )

    // Combine and sort: starts-with matches first, then contains matches
    // Within each group, sort alphabetically by hall_name
    const results = [
      ...startsWithMatches.sort((a, b) =>
        a.hall_name.localeCompare(b.hall_name)
      ),
      ...containsMatches.sort((a, b) =>
        a.hall_name.localeCompare(b.hall_name)
      ),
    ].slice(0, limit)

    // Return only hall_id and hall_name
    const formatted = results.map((hall) => ({
      hall_id: hall.hall_id,
      hall_name: hall.hall_name,
    }))

    return NextResponse.json(formatted, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error searching lecture halls:', error)
    return NextResponse.json(
      { error: 'Failed to search lecture halls' },
      { status: 500 }
    )
  }
}

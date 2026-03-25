import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  isValidPartialHallCode,
  isCompleteHallCode,
} from '@/lib/validations/hallCodeValidation'

/**
 * GET /api/lecture-halls/search
 * Search lecture halls by hall_name with strict format validation
 * 
 * Validates that hall codes follow the pattern: [A-G][0-9]{4}
 * Examples: A0103, G1210, F1203, C0326
 * 
 * Query params:
 * - q (required): search query string (must match hall code format)
 * - limit (optional, default 15): max results to return
 * 
 * Response format:
 * [
 *   { "hall_id": "...", "hall_name": "G0103", "building": "...", "floor": ... },
 *   ...
 * ]
 * 
 * Filtering strategy:
 * 1. Validate input matches [A-G][0-9]{0,4} pattern
 * 2. First: halls where hall_name starts with query (case-insensitive)
 * 3. Then: halls where hall_name contains query (case-insensitive)
 * 4. Prioritize exact match if query is complete (5 chars)
 * 5. Sort results alphabetically within each group
 * 6. Limit to specified number of results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let query = searchParams.get('q')?.trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50) // Cap at 50

    // Validate and sanitize query parameter
    if (!query || query.length === 0) {
      return NextResponse.json([])
    }

    // Convert to uppercase for consistency
    query = query.toUpperCase()

    // Validate that the query matches the partial hall code pattern
    if (!isValidPartialHallCode(query)) {
      // Return empty array for invalid format instead of error
      // This prevents errors in the UI but doesn't return results
      return NextResponse.json([])
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

    // If query is a complete hall code, check for exact match first
    let results: typeof allHalls = []
    
    if (isCompleteHallCode(query)) {
      // Look for exact match
      const exactMatch = allHalls.find(
        (hall) => hall.hall_name.toUpperCase() === query
      )
      if (exactMatch) {
        results = [exactMatch]
      } else {
        // If exact match not found, return empty (no partial matches when full code is provided)
        results = []
      }
    } else {
      // For partial codes, do prefix matching
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
      results = [
        ...startsWithMatches.sort((a, b) =>
          a.hall_name.localeCompare(b.hall_name)
        ),
        ...containsMatches.sort((a, b) =>
          a.hall_name.localeCompare(b.hall_name)
        ),
      ].slice(0, limit)
    }

    // Return results with all relevant fields
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching lecture halls:', error)
    return NextResponse.json(
      { error: 'Failed to search lecture halls' },
      { status: 500 }
    )
  }
}

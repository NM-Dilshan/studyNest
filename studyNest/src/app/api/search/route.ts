import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface SearchResult {
  id: string;
  name: string;
  type: 'lecture_hall' | 'study_area';
  building?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim() || '';

    // Return empty array if query is empty or too short
    if (!q || q.length < 1) {
      return NextResponse.json([]);
    }

    const searchTerm = q.toLowerCase();

    // Fetch lecture halls
    const [lectureHalls, studyAreas] = await Promise.all([
      prisma.lecture_halls.findMany({
        where: {
          is_active: true,
          hall_name: {
            mode: 'insensitive',
            contains: searchTerm,
          },
        },
        select: {
          hall_id: true,
          hall_name: true,
          building: true,
        },
        take: 15,
      }),
      prisma.study_areas.findMany({
        where: {
          is_active: true,
          area_name: {
            mode: 'insensitive',
            contains: searchTerm,
          },
        },
        select: {
          study_area_id: true,
          area_name: true,
          building: true,
        },
        take: 15,
      }),
    ]);

    // Convert lecture halls to search results
    const lectureHallResults: SearchResult[] = lectureHalls.map((hall) => ({
      id: hall.hall_id,
      name: hall.hall_name,
      type: 'lecture_hall',
      building: hall.building,
    }));

    // Convert study areas to search results
    const studyAreaResults: SearchResult[] = studyAreas.map((area) => ({
      id: area.study_area_id,
      name: area.area_name,
      type: 'study_area',
      building: area.building,
    }));

    // Combine and sort by relevance (exact match first, then startsWith, then contains)
    const combined = [...lectureHallResults, ...studyAreaResults];

    const sorted = combined.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // If both start with or both contain, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    // Limit to 15 total results
    const results = sorted.slice(0, 15);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

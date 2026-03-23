import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user data
    const userData = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        role: true,
      },
    })

    // Fetch volunteer scores
    const scores = await prisma.volunteer_scores.findUnique({
      where: { volunteer_id: userId },
    })

    const scoreData = scores ? {
      total_updates: scores.total_updates || 0,
      total_reviews: scores.total_reviews || 0,
      average_rating: typeof scores.average_rating === 'number' ? scores.average_rating : 0,
      accurate_count: scores.accurate_count || 0,
      inaccurate_count: scores.inaccurate_count || 0,
      score: typeof scores.score === 'number' ? scores.score : 0,
    } : {
      total_updates: 0,
      total_reviews: 0,
      average_rating: 0,
      accurate_count: 0,
      inaccurate_count: 0,
      score: 0,
    }

    // Fetch recent hall updates
    const hallUpdates = await prisma.volunteer_hall_updates.findMany({
      where: { volunteer_id: userId },
      select: {
        hall_update_id: true,
        occupancy_level: true,
        confidence_level: true,
        created_at: true,
        lecture_halls: {
          select: { hall_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Fetch recent study area updates
    const areaUpdates = await prisma.volunteer_study_area_updates.findMany({
      where: { volunteer_id: userId },
      select: {
        area_update_id: true,
        crowd_status: true,
        confidence_level: true,
        created_at: true,
        study_areas: {
          select: { area_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Combine and sort history
    const history = [
      ...hallUpdates.map((h: any) => ({
        id: h.hall_update_id,
        type: 'hall' as const,
        name: h.lecture_halls?.hall_name || 'Unknown Hall',
        status: h.occupancy_level || 'Unknown',
        time: h.created_at,
        points: h.confidence_level === 'high' ? 5 : h.confidence_level === 'medium' ? 3 : 1,
        confidence: h.confidence_level || 'medium',
      })),
      ...areaUpdates.map((a: any) => ({
        id: a.area_update_id,
        type: 'area' as const,
        name: a.study_areas?.area_name || 'Unknown Area',
        status: a.crowd_status,
        time: a.created_at,
        points: a.confidence_level === 'high' ? 5 : a.confidence_level === 'medium' ? 3 : 1,
        confidence: a.confidence_level || 'medium',
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5)

    // Fetch leaderboard
    const topVolunteers = await prisma.volunteer_scores.findMany({
      select: {
        volunteer_id: true,
        score: true,
        total_updates: true,
      },
      orderBy: { score: 'desc' },
      take: 5,
    })

    const volunteerIds = topVolunteers.map((v) => v.volunteer_id)
    const users = await prisma.users.findMany({
      where: { user_id: { in: volunteerIds } },
      select: { user_id: true, name: true },
    })

    const leaderboard = topVolunteers.map((v, idx) => {
      const volunteerUser = users.find((u) => u.user_id === v.volunteer_id)
      return {
        rank: idx + 1,
        name: volunteerUser?.name || 'Anonymous',
        updates: v.total_updates || 0,
        points: typeof v.score === 'number' ? v.score : Number(v.score) || 0,
        isCurrentUser: v.volunteer_id === userId,
      }
    })

    return NextResponse.json({
      user: userData,
      scoreData,
      history,
      leaderboard,
    })
  } catch (error) {
    console.error('Error fetching volunteer data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteer data' },
      { status: 500 }
    )
  }
}

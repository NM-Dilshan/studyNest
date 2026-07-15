import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getLevelFromPoints,
  getNextLevelTarget,
  getPointsToNextLevel,
  estimateResponsesNeeded,
  LEVEL_THRESHOLDS,
} from '@/lib/volunteer-dashboard';

export async function GET(
  request: NextRequest,
  context: { params: { volunteerId: string } | Promise<{ volunteerId: string }> }
) {
  try {
    // Handle both Promise and direct params (Next.js version compatibility)
    let volunteerId: string;
    
    if ('volunteerId' in context.params) {
      volunteerId = (context.params as { volunteerId: string }).volunteerId;
    } else {
      const resolvedParams = await (context.params as Promise<{ volunteerId: string }>);
      volunteerId = resolvedParams.volunteerId;
    }

    console.log('Volunteer ID:', volunteerId);

    if (!volunteerId) {
      return NextResponse.json(
        { success: false, error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    // Get volunteer basic info
    const volunteer = await prisma.users.findUnique({
      where: { user_id: volunteerId },
      select: {
        user_id: true,
        name: true,
        email: true,
        volunteer_id: true,
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Get total responses submitted by this volunteer
    const totalResponses = await prisma.hall_request_updates.count({
      where: { responder_id: volunteerId },
    });

    // Get all feedback for this volunteer (through their responses)
    const volunteerResponses = await prisma.hall_request_updates.findMany({
      where: { responder_id: volunteerId },
      select: { update_id: true },
    });

    const responseIds = volunteerResponses.map((r) => r.update_id);

    const feedbackList = await prisma.volunteer_feedback.findMany({
      where: { response_id: { in: responseIds } },
      select: { stars: true, comment: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });

    const totalReviews = feedbackList.length;
    const averageRating =
      feedbackList.length > 0
        ? feedbackList.reduce((sum, f) => sum + f.stars, 0) / feedbackList.length
        : 0;

    // Get volunteer scores (points and level)
    const volunteerScores = await prisma.volunteer_scores.findUnique({
      where: { volunteer_id: volunteerId },
      select: {
        total_points: true,
        level: true,
      },
    });

    const totalPoints = volunteerScores?.total_points ?? 0;
    const currentLevel = volunteerScores?.level ?? getLevelFromPoints(totalPoints);

    // Calculate progression
    const nextLevelTarget = getNextLevelTarget(currentLevel);
    const pointsToNextLevel = getPointsToNextLevel(totalPoints, currentLevel);
    const responsesToNextLevel = estimateResponsesNeeded(pointsToNextLevel);

    // Count rating breakdown
    const ratingBreakdown = {
      five: feedbackList.filter((f) => f.stars === 5).length,
      four: feedbackList.filter((f) => f.stars === 4).length,
      three: feedbackList.filter((f) => f.stars === 3).length,
      two: feedbackList.filter((f) => f.stars === 2).length,
      one: feedbackList.filter((f) => f.stars === 1).length,
    };

    // Get recent feedback comments (already sorted by created_at desc)
    const recentFeedback = feedbackList
      .filter((f) => f.comment)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        volunteerId: volunteer.user_id,
        name: volunteer.name,
        email: volunteer.email,
        volunteerIdNumber: volunteer.volunteer_id,
        totalResponses,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        totalPoints,
        level: currentLevel,
        nextLevel: currentLevel < 5 ? currentLevel + 1 : 5,
        pointsToNextLevel,
        responsesToNextLevel,
        nextLevelPointTarget: nextLevelTarget,
        progressPercentage:
          currentLevel >= 5
            ? 100
            : Math.round(
                ((totalPoints - LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS]) /
                  (nextLevelTarget -
                    LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS])) *
                  100
              ),
        ratingBreakdown,
        recentFeedback: recentFeedback.map((f) => ({
          stars: f.stars,
          comment: f.comment,
          createdAt: f.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Error in volunteer dashboard API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

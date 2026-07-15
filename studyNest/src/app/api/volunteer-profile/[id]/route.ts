/**
 * GET /api/volunteer-profile/[id]
 * Get volunteer profile and stats
 */

import { prisma } from "@/lib/prisma";
import { getVolunteerCompleteStats } from "@/services/volunteer-stats";

export interface VolunteerProfileResponse {
  success: boolean;
  data?: {
    volunteer_id: string;
    name: string;
    volunteer_id_num: string;
    total_responses: number;
    total_feedback: number;
    average_rating: number;
    feedback_breakdown: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
    total_points: number;
    level: number;
    level_title: string;
    level_progress: {
      currentLevel: number;
      currentLevelTitle: string;
      nextLevel: number | null;
      nextLevelTitle: string | null;
      currentLevelMin: number;
      nextLevelMin: number | null;
      pointsInCurrentLevel: number;
      pointsNeededForNextLevel: number | null;
      progressPercentage: number;
      totalPoints: number;
    };
  };
  error?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id: volunteerId } = await params;

    // Validate ID format (should be UUID)
    if (!volunteerId || typeof volunteerId !== "string") {
      return Response.json(
        {
          success: false,
          error: "Invalid volunteer ID",
        },
        { status: 400 }
      );
    }

    // Get volunteer stats
    const stats = await getVolunteerCompleteStats(volunteerId);

    if (!stats) {
      return Response.json(
        {
          success: false,
          error: "Volunteer not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          volunteer_id: stats.volunteer_id,
          name: stats.name,
          volunteer_id_num: stats.volunteer_id_num,
          total_responses: stats.total_responses,
          total_feedback: stats.total_feedback,
          average_rating: stats.average_rating,
          feedback_breakdown: stats.feedback_breakdown,
          total_points: stats.total_points,
          level: stats.level,
          level_title: stats.level_title,
          level_progress: stats.level_progress,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching volunteer profile:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch volunteer profile",
      },
      { status: 500 }
    );
  }
}

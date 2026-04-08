/**
 * Volunteer Stats Service
 *
 * Handles all volunteer statistics calculations and database updates
 * including point calculations, level updates, and feedback aggregation
 */

import { prisma } from "@/lib/prisma";
import {
  calculateTotalPoints,
  calculateLevelProgress,
  getLevelFromPoints,
  VolunteerStatsComplete,
  LevelProgressInfo,
} from "@/lib/volunteer-level";

/**
 * Calculate and update volunteer scores after a response is submitted
 * Called when: volunteer submits a response to a hall request
 * @param volunteerId - The volunteer's user ID
 */
export async function updateVolunteerScoresAfterResponse(
  volunteerId: string
): Promise<void> {
  try {
    // Count total responses
    const responseCount = await prisma.hall_request_updates.count({
      where: { responder_id: volunteerId },
    });

    // Get all feedback received
    const feedbackList = await prisma.volunteer_feedback.findMany({
      where: {
        response: {
          responder_id: volunteerId,
        },
      },
      select: { stars: true },
    });

    const stars = feedbackList.map((f) => f.stars);
    const totalPoints = calculateTotalPoints(responseCount, stars);
    const newLevel = getLevelFromPoints(totalPoints);
    const avgRating =
      feedbackList.length > 0
        ? feedbackList.reduce((sum, f) => sum + f.stars, 0) / feedbackList.length
        : 0;

    // Update volunteer_scores
    await prisma.volunteer_scores.upsert({
      where: { volunteer_id: volunteerId },
      update: {
        total_responses: responseCount,
        total_feedback_received: feedbackList.length,
        average_feedback_rating: avgRating,
        total_points: totalPoints,
        level: newLevel,
        updated_at: new Date(),
      },
      create: {
        volunteer_id: volunteerId,
        total_responses: responseCount,
        total_feedback_received: feedbackList.length,
        average_feedback_rating: avgRating,
        total_points: totalPoints,
        level: newLevel,
      },
    });
  } catch (error) {
    console.error(
      `Error updating volunteer scores for ${volunteerId}:`,
      error
    );
    throw error;
  }
}

/**
 * Calculate and update volunteer scores after feedback is submitted
 * Called when: a user submits feedback on a volunteer response
 * @param volunteerId - The volunteer's user ID
 */
export async function updateVolunteerScoresAfterFeedback(
  volunteerId: string
): Promise<void> {
  try {
    // Count total responses
    const responseCount = await prisma.hall_request_updates.count({
      where: { responder_id: volunteerId },
    });

    // Get all feedback received
    const feedbackList = await prisma.volunteer_feedback.findMany({
      where: {
        response: {
          responder_id: volunteerId,
        },
      },
      select: { stars: true },
    });

    const stars = feedbackList.map((f) => f.stars);
    const totalPoints = calculateTotalPoints(responseCount, stars);
    const newLevel = getLevelFromPoints(totalPoints);
    const avgRating =
      feedbackList.length > 0
        ? feedbackList.reduce((sum, f) => sum + f.stars, 0) / feedbackList.length
        : 0;

    // Upsert volunteer_scores (create if doesn't exist, update if it does)
    await prisma.volunteer_scores.upsert({
      where: { volunteer_id: volunteerId },
      create: {
        volunteer_id: volunteerId,
        total_responses: responseCount,
        total_feedback_received: feedbackList.length,
        average_feedback_rating: avgRating,
        total_points: totalPoints,
        level: newLevel,
      },
      update: {
        total_responses: responseCount,
        total_feedback_received: feedbackList.length,
        average_feedback_rating: avgRating,
        total_points: totalPoints,
        level: newLevel,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error(
      `Error updating volunteer scores for ${volunteerId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get complete volunteer stats including profile info
 * @param volunteerId - The volunteer's user ID
 * @returns Complete volunteer stats or null if volunteer not found
 */
export async function getVolunteerCompleteStats(
  volunteerId: string
): Promise<VolunteerStatsComplete | null> {
  try {
    // Get user info
    const user = await prisma.users.findUnique({
      where: { user_id: volunteerId },
      select: {
        user_id: true,
        name: true,
        volunteer_id: true,
      },
    });

    if (!user) {
      return null;
    }

    // Get volunteer scores
    const scores = await prisma.volunteer_scores.findUnique({
      where: { volunteer_id: volunteerId },
    });

    const totalResponses = scores?.total_responses ?? 0;
    const totalFeedback = scores?.total_feedback_received ?? 0;
    const averageRating = Number(scores?.average_feedback_rating ?? 0);
    const totalPoints = scores?.total_points ?? 0;
    const level = (scores?.level ?? 1) as 1 | 2 | 3 | 4 | 5;

    // Get feedback breakdown
    const feedbackList = await prisma.volunteer_feedback.findMany({
      where: {
        response: {
          responder_id: volunteerId,
        },
      },
      select: { stars: true },
    });

    const breakdown = {
      five_star: feedbackList.filter((f) => f.stars === 5).length,
      four_star: feedbackList.filter((f) => f.stars === 4).length,
      three_star: feedbackList.filter((f) => f.stars === 3).length,
      two_star: feedbackList.filter((f) => f.stars === 2).length,
      one_star: feedbackList.filter((f) => f.stars === 1).length,
    };

    const levelProgress = calculateLevelProgress(totalPoints);

    return {
      volunteer_id: user.user_id,
      name: user.name,
      volunteer_id_num: user.volunteer_id || "",
      total_responses: totalResponses,
      total_feedback: totalFeedback,
      average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimals
      feedback_breakdown: breakdown,
      total_points: totalPoints,
      level,
      level_title: levelProgress.currentLevelTitle,
      level_progress: levelProgress,
    };
  } catch (error) {
    console.error(`Error getting volunteer stats for ${volunteerId}:`, error);
    throw error;
  }
}

/**
 * Check if user has already submitted feedback for a response
 * @param responseId - The response ID
 * @param userId - The user ID giving feedback
 * @returns true if feedback already exists
 */
export async function checkExistingFeedback(
  responseId: string,
  userId: string
): Promise<boolean> {
  try {
    const feedback = await prisma.volunteer_feedback.findUnique({
      where: {
        response_id_given_by_user_id: {
          response_id: responseId,
          given_by_user_id: userId,
        },
      },
    });

    return !!feedback;
  } catch (error) {
    console.error(
      `Error checking feedback for response ${responseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get feedback for a specific response
 * @param responseId - The response ID
 * @returns Feedback data or null
 */
export async function getFeedbackForResponse(responseId: string) {
  try {
    return await prisma.volunteer_feedback.findMany({
      where: { response_id: responseId },
      select: {
        feedback_id: true,
        stars: true,
        comment: true,
        created_at: true,
        given_by: {
          select: {
            user_id: true,
            name: true,
            student_id: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error(`Error getting feedback for response ${responseId}:`, error);
    throw error;
  }
}

/**
 * Get all feedback submitted by a user
 * @param userId - The user ID who submitted feedback
 * @returns Array of feedback
 */
export async function getUserFeedbackSubmissions(userId: string) {
  try {
    return await prisma.volunteer_feedback.findMany({
      where: { given_by_user_id: userId },
      select: {
        feedback_id: true,
        response_id: true,
        stars: true,
        comment: true,
        created_at: true,
        response: {
          select: {
            responder_id: true,
            responder: {
              select: {
                name: true,
                volunteer_id: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error(
      `Error getting feedback submissions for user ${userId}:`,
      error
    );
    throw error;
  }
}

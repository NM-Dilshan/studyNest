/**
 * POST /api/volunteer-feedback
 * Submit feedback for a volunteer response
 */

import { prisma } from "@/lib/prisma";
import { validateFeedback, validateFeedbackPermission, FEEDBACK_ERRORS } from "@/lib/validations/feedback";
import {
  checkExistingFeedback,
  updateVolunteerScoresAfterFeedback,
} from "@/services/volunteer-stats";

export interface FeedbackRequest {
  response_id: string;
  request_id: string;
  stars: number;
  comment?: string | null;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    feedback_id: string;
    stars: number;
    comment: string | null;
    created_at: string;
  };
  error?: string;
}

/**
 * POST handler for feedback submission
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Get authenticated user from session/headers
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid JSON",
        },
        { status: 400 }
      );
    }

    const feedbackRequest = body as Record<string, unknown>;
    const response_id = feedbackRequest.response_id as string;
    const request_id = feedbackRequest.request_id as string;
    const userId = feedbackRequest.user_id as string; // Should come from auth

    // Validate IDs
    if (!response_id || !request_id || !userId) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.INVALID_DATA,
        },
        { status: 400 }
      );
    }

    // Validate feedback data (stars and comment)
    const validation = validateFeedback({
      stars: feedbackRequest.stars,
      comment: feedbackRequest.comment,
    });

    if (!validation.valid) {
      return Response.json(
        {
          success: false,
          error: validation.errors[0]?.message || FEEDBACK_ERRORS.INVALID_DATA,
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify the hall request exists and user is the requester
    const hallRequest = await prisma.hall_requests.findUnique({
      where: { request_id },
      select: {
        requester_id: true,
        hall_request_updates: {
          where: { update_id: response_id },
          take: 1,
        },
      },
    });

    if (!hallRequest) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.REQUEST_NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Check if response exists
    if (hallRequest.hall_request_updates.length === 0) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.RESPONSE_NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Verify permission: only request owner can give feedback
    if (!validateFeedbackPermission(userId, hallRequest.requester_id)) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.NO_PERMISSION,
        },
        { status: 403 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await checkExistingFeedback(response_id, userId);

    if (existingFeedback) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.DUPLICATE_FEEDBACK,
        },
        { status: 409 }
      );
    }

    // Get the responder ID from the response
    const response = await prisma.hall_request_updates.findUnique({
      where: { update_id: response_id },
      select: { responder_id: true },
    });

    if (!response) {
      return Response.json(
        {
          success: false,
          error: FEEDBACK_ERRORS.RESPONSE_NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Create feedback in database
    const feedback = await prisma.volunteer_feedback.create({
      data: {
        response_id,
        request_id,
        given_by_user_id: userId,
        stars: validation.data!.stars,
        comment: validation.data!.comment || null,
      },
      select: {
        feedback_id: true,
        stars: true,
        comment: true,
        created_at: true,
      },
    });

    // Update volunteer scores and level
    await updateVolunteerScoresAfterFeedback(response.responder_id);

    return Response.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        data: {
          feedback_id: feedback.feedback_id,
          stars: feedback.stars,
          comment: feedback.comment,
          created_at: feedback.created_at?.toISOString() || new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific database errors
    if (errorMessage.includes('MaxClientsInSessionMode') || errorMessage.includes('connection')) {
      return Response.json(
        {
          success: false,
          error: 'Database connection error. Please try again in a moment.',
        },
        { status: 503 }
      );
    }
    
    return Response.json(
      {
        success: false,
        error: FEEDBACK_ERRORS.INTERNAL_ERROR,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Feedback Validation Schema and Utilities
 */

export interface FeedbackSubmissionData {
  stars: number;
  comment?: string | null;
}

export interface FeedbackValidationError {
  field: string;
  message: string;
}

export interface FeedbackValidationResult {
  valid: boolean;
  errors: FeedbackValidationError[];
  data?: FeedbackSubmissionData;
}

/**
 * Validate feedback submission data
 * @param data - Feedback data to validate
 * @returns Validation result
 */
export function validateFeedback(data: unknown): FeedbackValidationResult {
  const errors: FeedbackValidationError[] = [];

  // Type safety check
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: [{ field: "root", message: "Invalid feedback data" }],
    };
  }

  const feedbackData = data as Record<string, unknown>;

  // Validate stars (required)
  if (feedbackData.stars === undefined || feedbackData.stars === null) {
    errors.push({
      field: "stars",
      message: "Star rating is required",
    });
  } else if (typeof feedbackData.stars !== "number") {
    errors.push({
      field: "stars",
      message: "Star rating must be a number",
    });
  } else if (!Number.isInteger(feedbackData.stars)) {
    errors.push({
      field: "stars",
      message: "Star rating must be a whole number",
    });
  } else if (feedbackData.stars < 1 || feedbackData.stars > 5) {
    errors.push({
      field: "stars",
      message: "Star rating must be between 1 and 5",
    });
  }

  // Validate comment (optional)
  if (feedbackData.comment !== undefined && feedbackData.comment !== null) {
    if (typeof feedbackData.comment !== "string") {
      errors.push({
        field: "comment",
        message: "Comment must be text",
      });
    } else if (feedbackData.comment.trim().length > 300) {
      errors.push({
        field: "comment",
        message: "Comment must be 300 characters or less",
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
    data: {
      stars: feedbackData.stars as number,
      comment: (feedbackData.comment as string | null | undefined) || null,
    },
  };
}

/**
 * Validate permissions for feedback submission
 * @param requesterId - The user making the request (should be authenticated)
 * @param requestOwnerId - The original requester's user ID
 * @returns true if permission granted
 */
export function validateFeedbackPermission(
  requesterId: string,
  requestOwnerId: string
): boolean {
  // Only the request owner can leave feedback
  return requesterId === requestOwnerId;
}

/**
 * Error messages for common feedback scenarios
 */
export const FEEDBACK_ERRORS = {
  NO_PERMISSION: "You can only leave feedback on your own requests",
  DUPLICATE_FEEDBACK: "You have already provided feedback for this response",
  RESPONSE_NOT_FOUND: "The response you are trying to rate does not exist",
  REQUEST_NOT_FOUND: "The request does not exist",
  INVALID_STARS: "Star rating must be between 1 and 5",
  COMMENT_TOO_LONG: "Comment must be 300 characters or less",
  INVALID_DATA: "Invalid feedback data",
  INTERNAL_ERROR: "Failed to submit feedback. Please try again.",
} as const;

export type FeedbackErrorKey = keyof typeof FEEDBACK_ERRORS;

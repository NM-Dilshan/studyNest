"use client";

import React, { useState } from "react";
import { FiStar, FiX } from "react-icons/fi";

interface ResponseFeedbackFormProps {
  responseId: string;
  requestId: string;
  volunteerId: string;
  volunteerName: string;
  userId?: string; // Add userId prop
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FeedbackState {
  stars: number;
  comment: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export function ResponseFeedbackForm({
  responseId,
  requestId,
  volunteerId,
  volunteerName,
  userId: propsUserId,
  onSuccess,
  onClose,
}: ResponseFeedbackFormProps) {
  const [state, setState] = useState<FeedbackState>({
    stars: 0,
    comment: "",
    isSubmitting: false,
    error: null,
    success: false,
  });

  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (value: number) => {
    setState((prev) => ({ ...prev, stars: value, error: null }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 300) {
      setState((prev) => ({ ...prev, comment: text }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (state.stars === 0) {
      setState((prev) => ({
        ...prev,
        error: "Please select a star rating",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Get user ID from props or localStorage
      let userId = propsUserId;

      if (!userId) {
        const userDataStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userId = userData.user_id || userData.id;
          } catch {
            // Fallback: try other storage keys
          }
        }
      }

      if (!userId) {
        setState((prev) => ({
          ...prev,
          error: "Unable to verify your identity. Please log in again.",
          isSubmitting: false,
        }));
        return;
      }

      const response = await fetch("/api/volunteer-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          response_id: responseId,
          request_id: requestId,
          user_id: userId,
          stars: state.stars,
          comment: state.comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || "Failed to submit feedback. Please try again.";
        if (response.status === 503) {
          throw new Error("The service is temporarily unavailable. Please try again in a moment.");
        }
        throw new Error(errorMessage);
      }

      setState((prev) => ({
        ...prev,
        success: true,
        isSubmitting: false,
      }));

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }

      // Auto-close after success
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit feedback. Please try again.",
        isSubmitting: false,
      }));
    }
  };

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 font-semibold mb-2">
          ✓ Thank you for your feedback!
        </div>
        <p className="text-green-600 text-sm">
          Your rating has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            Rate Response
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            How helpful was {volunteerName}'s response?
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Star Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleStarClick(value)}
              onMouseEnter={() => setHoveredStar(value)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <FiStar
                className={`w-8 h-8 ${
                  value <= (hoveredStar || state.stars)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {state.stars > 0
            ? {
                1: "Not helpful at all",
                2: "Somewhat helpful",
                3: "Helpful",
                4: "Very helpful",
                5: "Extremely helpful",
              }[state.stars]
            : "Select a rating"}
        </p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Comment <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <textarea
          value={state.comment}
          onChange={handleCommentChange}
          placeholder="Share any additional feedback about this response..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={state.isSubmitting}
        />
        <p className="text-xs text-gray-500">
          {state.comment.length}/300 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end border-t pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={state.isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={state.isSubmitting || state.stars === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </form>
  );
}

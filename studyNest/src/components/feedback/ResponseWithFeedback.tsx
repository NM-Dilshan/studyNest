"use client";

import React, { useState } from "react";
import { FiMessageSquare, FiX } from "react-icons/fi";
import { ResponseFeedbackForm } from "@/components/feedback/ResponseFeedbackForm";

interface HallRequestUpdate {
  update_id: string;
  responder_id: string;
  responder?: {
    name: string;
    volunteer_id?: string;
  };
  availability_status: string;
  occupancy_level: string;
  volunteer_note?: string;
  confidence_level?: string;
  created_at?: string | Date;
}

interface HallRequest {
  request_id: string;
  requester_id: string;
}

interface ResponseWithFeedbackProps {
  response: HallRequestUpdate;
  request: HallRequest;
  currentUserId: string;
  onFeedbackSubmitted?: () => void;
}

export function ResponseWithFeedback({
  response,
  request,
  currentUserId,
  onFeedbackSubmitted,
}: ResponseWithFeedbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Check if current user is the request owner
  const isRequestOwner = currentUserId === request.requester_id;

  // Format response time
  const formatTime = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Response Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">
              {response.responder?.name || "Volunteer"}
            </h4>
            {response.responder?.volunteer_id && (
              <p className="text-xs text-gray-500">
                ID: {response.responder.volunteer_id}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatTime(response.created_at)}
          </p>
        </div>
      </div>

      {/* Response Details */}
      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 font-medium">Availability</p>
          <p className="text-sm font-semibold text-gray-900">
            {response.availability_status}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Occupancy</p>
          <p className="text-sm font-semibold text-gray-900">
            {response.occupancy_level}
          </p>
        </div>
        {response.confidence_level && (
          <div>
            <p className="text-xs text-gray-600 font-medium">Confidence</p>
            <p className="text-sm font-semibold text-gray-900">
              {response.confidence_level}
            </p>
          </div>
        )}
      </div>

      {/* Volunteer Note */}
      {response.volunteer_note && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">Volunteer Note</p>
          <p className="text-sm text-gray-900">{response.volunteer_note}</p>
        </div>
      )}

      {/* Feedback Section */}
      {isRequestOwner && (
        <div className="pt-3 border-t border-gray-200">
          {!showFeedbackForm ? (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
              <FiMessageSquare className="w-4 h-4" />
              Rate this Response
            </button>
          ) : (
            <div className="space-y-3">
              <ResponseFeedbackForm
                responseId={response.update_id}
                requestId={request.request_id}
                volunteerId={response.responder_id}
                volunteerName={response.responder?.name || "Volunteer"}
                onSuccess={() => {
                  setShowFeedbackForm(false);
                  if (onFeedbackSubmitted) {
                    onFeedbackSubmitted();
                  }
                }}
                onClose={() => setShowFeedbackForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

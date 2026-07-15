"use client";

import React, { useState } from "react";
import { FiAward, FiX } from "react-icons/fi";
import { VolunteerProfileStats } from "@/components/volunteer/VolunteerProfileStats";

interface VolunteerHeaderProfileProps {
  volunteerName: string;
  volunteerId: string;
  volunteerIdNumber?: string;
}

export function VolunteerHeaderProfile({
  volunteerName,
  volunteerId,
  volunteerIdNumber,
}: VolunteerHeaderProfileProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={() => setShowProfile(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FiAward className="w-5 h-5" />
        <div className="text-left">
          <p className="text-sm font-semibold">{volunteerName}</p>
          {volunteerIdNumber && (
            <p className="text-xs text-blue-500">{volunteerIdNumber}</p>
          )}
        </div>
      </button>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
            <VolunteerProfileStats
              volunteerId={volunteerId}
              onClose={() => setShowProfile(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

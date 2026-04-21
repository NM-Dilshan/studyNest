"use client";

import React, { useEffect, useState } from "react";
import { FiX, FiStar, FiAward, FiTrendingUp } from "react-icons/fi";

interface LevelProgress {
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
}

interface VolunteerProfileStatsData {
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
  level_progress: LevelProgress;
}

interface VolunteerProfileStatsProps {
  volunteerId: string;
  onClose?: () => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "from-slate-400 to-slate-500",
  2: "from-blue-400 to-blue-500",
  3: "from-purple-400 to-purple-500",
  4: "from-orange-400 to-orange-500",
  5: "from-yellow-400 to-yellow-500",
};

const LEVEL_BADGES: Record<number, string> = {
  1: "🌱",
  2: "⭐",
  3: "🔥",
  4: "👑",
  5: "🎖️",
};

export function VolunteerProfileStats({
  volunteerId,
  onClose,
}: VolunteerProfileStatsProps) {
  const [stats, setStats] = useState<VolunteerProfileStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/volunteer-profile/${volunteerId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch volunteer profile");
        }

        const data = await response.json();
        setStats(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching volunteer stats:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [volunteerId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 mt-2">Loading profile...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">{error || "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm opacity-90">{stats.volunteer_id_num}</div>
            <h2 className="text-2xl font-bold mt-1">{stats.name}</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Level Section */}
      <div
        className={`bg-gradient-to-r ${LEVEL_COLORS[stats.level]} text-white p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-opacity-80 text-sm font-medium">
              Current Level
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl">{LEVEL_BADGES[stats.level]}</span>
              <div>
                <p className="text-3xl font-bold">{stats.level}</p>
                <p className="text-lg opacity-90">{stats.level_title}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-opacity-80 text-sm font-medium">
              Total Points
            </p>
            <p className="text-4xl font-bold mt-1">{stats.total_points}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.level_progress.nextLevel && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-30">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium opacity-90">Progress to Level {stats.level_progress.nextLevel}</p>
              <p className="text-sm font-semibold">
                {stats.level_progress.pointsNeededForNextLevel} points away
              </p>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white rounded-full h-full transition-all duration-300"
                style={{ width: `${stats.level_progress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4" />
            Responses
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {stats.total_responses}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
            <FiStar className="w-4 h-4" />
            Feedback Received
          </p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {stats.total_feedback}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-purple-600">
              {stats.average_rating.toFixed(1)}
            </p>
            <p className="text-sm text-purple-600">/5.0</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
            <FiAward className="w-4 h-4" />
            Total Reviews
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {stats.total_feedback}
          </p>
        </div>
      </div>

      {/* Feedback Breakdown */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[
            { stars: 5, count: stats.feedback_breakdown.five_star, color: "bg-yellow-400" },
            { stars: 4, count: stats.feedback_breakdown.four_star, color: "bg-yellow-300" },
            { stars: 3, count: stats.feedback_breakdown.three_star, color: "bg-yellow-200" },
            { stars: 2, count: stats.feedback_breakdown.two_star, color: "bg-orange-200" },
            { stars: 1, count: stats.feedback_breakdown.one_star, color: "bg-red-200" },
          ].map(({ stars, count, color }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-12">
                {stars} ⭐
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`${color} h-full flex items-center justify-center transition-all duration-300`}
                  style={{
                    width: `${
                      stats.total_feedback > 0
                        ? (count / stats.total_feedback) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Message */}
      {stats.level === 5 && (
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-t border-yellow-200 p-4 text-center">
          <p className="text-sm font-semibold text-yellow-800">
            🎖️ Congratulations! You've reached the highest level - Legend!
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FiX, FiTrendingUp, FiStar, FiMessageSquare } from 'react-icons/fi';
import { getLevelName, getLevelColor } from '@/lib/volunteer-dashboard';

interface VolunteerData {
  name: string;
  level: number;
  totalPoints: number;
  totalResponses: number;
  totalFeedback: number;
  averageRating: number;
  pointsToNextLevel: number;
  estimatedResponsesNeeded: number;
}

interface VolunteerStatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerId: string;
}

export function VolunteerStatsPopup({
  isOpen,
  onClose,
  volunteerId,
}: VolunteerStatsPopupProps) {
  const [data, setData] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/volunteer-dashboard/${volunteerId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [volunteerId, isOpen]);

  if (!isOpen) return null;

  const levelColor = data ? getLevelColor(data.level) : 'bg-gray-100';
  const levelName = data ? getLevelName(data.level) : 'Unknown';

  return (
    <div className="absolute right-0 top-full mt-2 w-96 z-50">
      {/* Popup Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`${levelColor} px-6 py-4`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              ) : error ? (
                <div className="text-red-600">
                  <p className="font-semibold text-sm">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    {data?.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Level {data?.level} - {levelName}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Close stats"
            >
              <FiX className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                Unable to load your stats. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Reload
              </button>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Points */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">
                    Total Points
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {data.totalPoints}
                  </p>
                </div>

                {/* Responses */}
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">
                    Responses
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {data.totalResponses}
                  </p>
                </div>

                {/* Feedback */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold">
                    Feedback
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    {data.totalFeedback}
                  </p>
                </div>

                {/* Rating */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                    <FiStar className="w-3 h-3" /> Rating
                  </p>
                  <p className="text-lg font-bold text-yellow-600">
                    {data.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Progress to Level {data.level + 1}
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    {data.pointsToNextLevel} points needed
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${levelColor} h-2 rounded-full transition-all`}
                    style={{
                      width: `${Math.min(
                        (data.totalPoints / (data.totalPoints + data.pointsToNextLevel)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" />
                  ~{data.estimatedResponsesNeeded} more responses needed
                </p>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-3 border-t">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Rating:</span>
                    <span className="font-semibold text-gray-900">
                      {data.averageRating.toFixed(2)}/5.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Responses/Level:</span>
                    <span className="font-semibold text-gray-900">
                      {data.totalResponses} / {data.level > 0 ? data.level * 2 : 2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

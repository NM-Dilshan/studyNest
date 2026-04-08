'use client';

import React, { useEffect, useState } from 'react';
import { FiX, FiDownload, FiTrendingUp, FiStar, FiCheck } from 'react-icons/fi';
import {
  getLevelColor,
  getLevelName,
  getBadges,
} from '@/lib/volunteer-dashboard';

interface RatingBreakdown {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

interface RecentFeedback {
  stars: number;
  comment: string | null;
  createdAt: string;
}

interface DashboardData {
  volunteerId: string;
  name: string;
  email: string;
  volunteerIdNumber: string;
  totalResponses: number;
  totalReviews: number;
  averageRating: number;
  totalPoints: number;
  level: number;
  nextLevel: number;
  pointsToNextLevel: number;
  responsesToNextLevel: number;
  nextLevelPointTarget: number;
  progressPercentage: number;
  ratingBreakdown: RatingBreakdown;
  recentFeedback: RecentFeedback[];
}

interface VolunteerDashboardStatsProps {
  volunteerId: string;
  onClose?: () => void;
}

export function VolunteerDashboardStats({
  volunteerId,
  onClose,
}: VolunteerDashboardStatsProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard for volunteerId:', volunteerId);

        if (!volunteerId) {
          throw new Error('Volunteer ID is missing');
        }

        const url = `/api/volunteer-dashboard/${volunteerId}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(
            errorData.error || `Failed to fetch dashboard data (${response.status})`
          );
        }

        const result = await response.json();
        console.log('Dashboard data received:', result);
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [volunteerId]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">
            <FiDownload className="w-8 h-8 text-blue-600" />
          </div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold">Unable to Load Dashboard</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-red-100 p-1"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Error Body */}
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-900 font-semibold mb-2">Error Details</h3>
            <p className="text-red-700 text-sm mb-4">
              {error || 'No data could be retrieved'}
            </p>

            <div className="bg-white rounded p-4 border border-red-100 mb-4">
              <p className="text-xs text-gray-600 font-mono break-all">
                {error}
              </p>
            </div>

            <div className="space-y-3 text-sm text-red-700">
              <p className="font-semibold">Possible causes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You may not be logged in as a volunteer</li>
                <li>The server may be temporarily unavailable</li>
                <li>Your session may have expired</li>
                <li>There may be a database connection issue</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const badges = getBadges(
    data.totalResponses,
    data.averageRating,
    data.totalReviews,
    data.level
  );

  const renderStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <p className="text-blue-100 text-sm mt-1">{data.volunteerIdNumber}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-1"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Level Badge */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-full font-semibold text-sm ${getLevelColor(
              data.level
            )}`}
          >
            Level {data.level} - {getLevelName(data.level)}
          </div>
          <div className="text-blue-100 text-sm">
            <FiTrendingUp className="inline mr-1 w-4 h-4" />
            {data.totalPoints} points
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Total Responses
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {data.totalResponses}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Feedback Received
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {data.totalReviews}
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Avg Rating
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {data.averageRating.toFixed(1)}
              <span className="text-sm">★</span>
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              Total Points
            </p>
            <p className="text-2xl font-bold text-green-600">
              {data.totalPoints}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {data.level < 5 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                Progress to Level {data.nextLevel}
              </h3>
              <span className="text-sm text-gray-600">
                {data.progressPercentage}%
              </span>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(data.progressPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{data.pointsToNextLevel}</span> more
                points needed to reach Level {data.nextLevel}
              </p>
              <p className="text-sm text-gray-600">
                Approximately <span className="font-semibold">{data.responsesToNextLevel}</span> more{' '}
                {data.responsesToNextLevel === 1 ? 'response' : 'responses'} needed
              </p>
            </div>
          </div>
        )}

        {data.level === 5 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2">
              <FiCheck className="w-5 h-5 text-purple-600" />
              <p className="font-semibold text-purple-900">
                🎉 You've reached the maximum level! You are a Master Volunteer.
              </p>
            </div>
          </div>
        )}

        {/* Rating Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Rating Distribution</h3>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count =
              data.ratingBreakdown[stars as keyof typeof data.ratingBreakdown];
            const percentage =
              data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-semibold text-gray-700">
                    {renderStars(stars)}
                  </span>
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stars === 5
                        ? 'bg-green-500'
                        : stars === 4
                        ? 'bg-blue-500'
                        : stars === 3
                        ? 'bg-yellow-500'
                        : stars === 2
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="w-12 text-right">
                  <span className="text-sm font-semibold text-gray-700">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="font-semibold text-amber-900">
                        {badge.name}
                      </p>
                      <p className="text-xs text-amber-700">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Feedback */}
        {data.recentFeedback.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Feedback</h3>
            <div className="space-y-2">
              {data.recentFeedback.map((feedback, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{renderStars(feedback.stars)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-gray-700 italic">
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

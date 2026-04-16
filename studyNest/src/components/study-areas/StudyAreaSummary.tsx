/**
 * StudyAreaSummary Component
 * Shows aggregated statistics across all study areas
 * Helps students quickly find the right area based on crowdlevels
 */

'use client';

import { TrendingDown, AlertCircle, TrendingUp } from 'lucide-react';
import { CrowdStatus } from '@/lib/geofence';

interface StudyAreaStats {
  lowCrowdAreas: number;
  mediumCrowdAreas: number;
  highCrowdAreas: number;
  totalStudentsInside: number;
  totalAvailableSeats: number;
  totalCapacity: number;
}

interface StudyAreaSummaryProps {
  stats: StudyAreaStats | null;
  isLoading?: boolean;
}

export function StudyAreaSummary({ stats, isLoading = false }: StudyAreaSummaryProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Low Crowd',
      value: stats.lowCrowdAreas,
      description: 'areas with ≤30% occupancy',
      icon: TrendingDown,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Medium Crowd',
      value: stats.mediumCrowdAreas,
      description: 'areas with 30-70% occupancy',
      icon: AlertCircle,
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'High Crowd',
      value: stats.highCrowdAreas,
      description: 'areas with >70% occupancy',
      icon: TrendingUp,
      color: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <>
      {/* Crowd level summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`${card.color} border ${card.borderColor} rounded-lg p-6 flex items-center gap-4`}
            >
              <Icon className={`${card.textColor} flex-shrink-0`} size={28} />
              <div>
                <h3 className={`${card.textColor} font-semibold text-sm mb-1`}>{card.title}</h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Campus Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Students Currently Inside</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalStudentsInside}</p>
            <p className="text-xs text-gray-500 mt-1">across all study areas</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Available Seats</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalAvailableSeats}</p>
            <p className="text-xs text-gray-500 mt-1">total empty capacity</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Overall Capacity</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalCapacity}</p>
            <p className="text-xs text-gray-500 mt-1">all areas combined</p>
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pro Tips for Finding Your Perfect Study Space</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Best Times to Study</p>
              <p className="text-sm text-gray-600">
                Weekday early mornings (7-9 AM) and late evenings (7-10 PM) tend to be quieter.
                Peak hours are 10 AM - 6 PM.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              💡
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Filter by Features</p>
              <p className="text-sm text-gray-600">
                Need WiFi or a quiet zone? Use the feature filters to find exactly what you need.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
              📍
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Real-Time Updates</p>
              <p className="text-sm text-gray-600">
                Occupancy updates every 10 seconds. Check back before heading to your study area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

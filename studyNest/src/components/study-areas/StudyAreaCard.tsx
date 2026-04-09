/**
 * StudyAreaCard Component
 * Displays occupancy information for a single study area
 * Privacy-safe: shows only aggregated occupancy, never individual locations
 */

'use client';

import { CrowdStatus, getCrowdEmoji } from '@/lib/geofence';
import { Users, Wifi, Volume2, Coffee, Zap } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  label: string;
}

interface StudyAreaCardProps {
  id: string;
  name: string;
  currentCount: number;
  availableSeats: number;
  occupancyPercentage: number;
  crowdStatus: CrowdStatus;
  capacity: number;
  features?: {
    wifi?: boolean;
    quietZone?: boolean;
    café?: boolean;
    chargingPorts?: boolean;
  };
}

export function StudyAreaCard({
  id,
  name,
  currentCount,
  availableSeats,
  occupancyPercentage,
  crowdStatus,
  capacity,
  features,
}: StudyAreaCardProps) {
  const crowdIndicator = getCrowdEmoji(crowdStatus);

  const featuresToShow: Feature[] = [];
  if (features?.wifi) featuresToShow.push({ icon: <Wifi size={16} />, label: 'WiFi' });
  if (features?.quietZone) featuresToShow.push({ icon: <Volume2 size={16} />, label: 'Quiet' });
  if (features?.café) featuresToShow.push({ icon: <Coffee size={16} />, label: 'Café' });
  if (features?.chargingPorts) featuresToShow.push({ icon: <Zap size={16} />, label: 'Charging' });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header with title and crowd status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${crowdIndicator.bgColor} ${crowdIndicator.color}`}>
          {crowdStatus}
        </div>
      </div>

      {/* Occupancy visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {currentCount} / {capacity}
            </span>
          </div>
          <span className="text-sm text-gray-600">{occupancyPercentage.toFixed(1)}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              occupancyPercentage <= 30
                ? 'bg-green-500'
                : occupancyPercentage <= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Available seats */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Available Seats</p>
          <p className="text-xl font-bold text-green-600">{availableSeats}</p>
        </div>
      </div>

      {/* Features */}
      {featuresToShow.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {featuresToShow.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {feature.icon}
              {feature.label}
            </div>
          ))}
        </div>
      )}

      {/* Privacy notice */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-700">
          🔒 <strong>Privacy Protected:</strong> Only aggregated occupancy is shown. 
          Individual locations are not tracked or displayed.
        </p>
      </div>
    </div>
  );
}

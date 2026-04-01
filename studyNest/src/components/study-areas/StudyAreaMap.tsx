/**
 * StudyAreaMap Component
 * Displays study area boundaries and aggregated occupancy on a map
 * Privacy-safe: shows only area boundaries and total counts, never individual locations
 * 
 * Initially renders a static map. Can be enhanced with Google Maps or Leaflet later.
 */

'use client';

import { useState, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { CrowdStatus } from '@/lib/geofence';

interface StudyAreaLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  crowdStatus: CrowdStatus;
  currentCount: number;
  capacity: number;
}

interface StudyAreaMapProps {
  areas: StudyAreaLocation[];
  hoveredAreaId?: string | null;
  onAreaClick?: (areaId: string) => void;
}

export function StudyAreaMap({ areas, hoveredAreaId, onAreaClick }: StudyAreaMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // If no areas, show empty state
  if (!areas || areas.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 font-medium">No study areas available</p>
        <p className="text-gray-500 text-sm">Study areas will appear here when they're added.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Area Map</h2>

      {/* Map container - Static visualization */}
      <div className="mb-4 space-y-4">
        {/* Text-based area representation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">
              📍 {areas.length} Study Area{areas.length !== 1 ? 's' : ''} on Campus
            </p>
            <p className="text-xs text-gray-500">
              Coordinates shown for reference | Privacy: Individual locations not displayed
            </p>
          </div>

          <div className="space-y-3">
            {areas.map((area, index) => {
              const crowdColor =
                area.crowdStatus === 'Low Crowd'
                  ? 'border-green-300 bg-green-50'
                  : area.crowdStatus === 'Medium Crowd'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-red-300 bg-red-50';

              const crowdTextColor =
                area.crowdStatus === 'Low Crowd'
                  ? 'text-green-700'
                  : area.crowdStatus === 'Medium Crowd'
                    ? 'text-yellow-700'
                    : 'text-red-700';

              const isHovered = hoveredAreaId === area.id || selectedArea === area.id;

              return (
                <div
                  key={area.id || `area-map-${index}`}
                  onClick={() => {
                    setSelectedArea(area.id);
                    onAreaClick?.(area.id);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${crowdColor} ${
                    isHovered ? 'shadow-md ring-2 ring-offset-1 ring-blue-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${crowdTextColor}`}>{area.name}</h4>
                      {typeof area.latitude === 'number' && typeof area.longitude === 'number' && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${crowdTextColor}`}>{area.crowdStatus}</p>
                      <p className="text-xs text-gray-600">Radius: {area.radiusMeters}m</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">{area.currentCount}</span>
                      <span className="text-gray-600"> / {area.capacity} students</span>
                    </div>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          area.crowdStatus === 'Low Crowd'
                            ? 'bg-green-500'
                            : area.crowdStatus === 'Medium Crowd'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((area.currentCount / area.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-3">Legend</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Low Crowd (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Medium (30-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">High Crowd (&gt;70%)</span>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Privacy Protected</p>
            <p className="text-sm text-blue-700">
              This map shows study area boundaries and aggregated occupancy counts only. 
              Individual student locations are never tracked or displayed to other users.
            </p>
          </div>
        </div>
      </div>

      {/* Future enhancement note */}
      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-300">
        <p className="text-xs text-gray-600">
          <strong>Coming Soon:</strong> Interactive Google Maps integration with real-time
          boundary visualization. Currently showing study area data in text format.
        </p>
      </div>
    </div>
  );
}

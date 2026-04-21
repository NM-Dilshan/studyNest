/**
 * StudyAreaMap Component
 * Displays study area boundaries and aggregated occupancy on a map
 * Privacy-safe: shows only area boundaries and total counts, never individual locations
 * 
 * Initially renders a static map. Can be enhanced with Google Maps or Leaflet later.
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Compass, MapPin } from 'lucide-react';
import { CrowdStatus } from '@/lib/geofence';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import OccupancyIndicator from '@/components/ui/OccupancyIndicator';
import EmptyState from '@/components/ui/EmptyState';

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

  if (!areas || areas.length === 0) {
    return (
      <EmptyState
        title="No study area map data"
        description="Map insights will appear once active study areas with GPS coordinates are available."
        icon={<MapPin className="h-6 w-6" />}
      />
    );
  }

  return (
    <GlassCard className="border-white/15 bg-slate-950/55 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Study Area Map</h2>
          <p className="text-xs text-slate-300">
            {areas.length} mapped zones • aggregate occupancy only
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
          <Compass className="h-3.5 w-3.5" />
          Campus Map
        </span>
      </div>

      <div className="space-y-3">
            {areas.map((area, index) => {
              const isHovered = hoveredAreaId === area.id || selectedArea === area.id;
              const occupancyPercentage = area.capacity > 0 ? (area.currentCount / area.capacity) * 100 : 0;

              return (
                <button
                  key={area.id || `area-map-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedArea(area.id);
                    onAreaClick?.(area.id);
                  }}
                  aria-pressed={isHovered}
                  aria-label={`${area.name}, ${area.currentCount} of ${area.capacity} seats occupied`}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isHovered
                      ? 'border-cyan-300/55 bg-cyan-400/10 ring-2 ring-cyan-400/30'
                      : 'border-white/15 bg-white/5 hover:border-white/30'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{area.name}</h4>
                      {typeof area.latitude === 'number' && typeof area.longitude === 'number' && (
                        <p className="mt-1 text-xs text-slate-400">
                          📍 {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <StatusBadge status={area.crowdStatus} />
                      <p className="mt-1 text-xs text-slate-400">Radius: {area.radiusMeters}m</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-white">{area.currentCount}</span> / {area.capacity} students
                    </p>
                    <OccupancyIndicator percentage={occupancyPercentage} label="Zone occupancy" />
                  </div>
                </button>
              );
            })}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
        <p className="mb-3 text-sm font-medium text-white">Legend</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-300">Low crowd (&lt;=30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-slate-300">Medium crowd (30% - 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-300">High crowd (&gt;70%)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-cyan-200" size={18} />
          <div>
            <p className="mb-1 text-sm font-medium text-cyan-100">Privacy Protected</p>
            <p className="text-sm text-cyan-100/85">
              This map displays aggregated occupancy and zone metadata only. Individual student locations are never shown.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

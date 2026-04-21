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
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-main)]">Live Study Area Map</h2>
          <p className="text-xs text-[var(--text-soft)]">
            {areas.length} mapped zones • aggregate occupancy only
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-text)]">
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
                  ? 'border-[var(--button-primary-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--focus-ring)]'
                  : 'themed-inset hover:border-[var(--surface-border-strong)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text-main)]">{area.name}</h4>
                  {typeof area.latitude === 'number' && typeof area.longitude === 'number' && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <StatusBadge status={area.crowdStatus} />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Radius: {area.radiusMeters}m</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <p className="text-sm text-[var(--text-soft)]">
                  <span className="font-semibold text-[var(--text-main)]">{area.currentCount}</span> / {area.capacity} students
                </p>
                <OccupancyIndicator percentage={occupancyPercentage} label="Zone occupancy" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="themed-inset mt-4 rounded-xl p-4">
        <p className="mb-3 text-sm font-medium text-[var(--text-main)]">Legend</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-[var(--text-soft)]">Low crowd (&lt;=30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-[var(--text-soft)]">Medium crowd (30% - 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-[var(--text-soft)]">High crowd (&gt;70%)</span>
          </div>
        </div>
      </div>

      <div className="themed-panel-info mt-4 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="themed-panel-title mb-1 text-sm font-medium">Privacy Protected</p>
            <p className="themed-panel-copy text-sm">
              This map displays aggregated occupancy and zone metadata only. Individual student locations are never shown.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

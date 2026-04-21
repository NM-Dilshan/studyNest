'use client';

import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Clock3, Users, Wifi, Volume2, Coffee, Zap, Snowflake, Building2 } from 'lucide-react';
import { CrowdStatus } from '@/lib/geofence';
import GlassCard from '@/components/ui/GlassCard';
import OccupancyIndicator from '@/components/ui/OccupancyIndicator';
import StatusBadge from '@/components/ui/StatusBadge';

const StudyAreaCardMapPreview = dynamic(
  () => import('@/components/study-areas/StudyAreaCardMapPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 w-full bg-slate-100 text-slate-500 text-sm flex items-center justify-center">
        Loading zone map...
      </div>
    ),
  }
);

interface Feature {
  icon: React.ReactNode;
  label: string;
}

interface StudyAreaCardProps {
  id: string;
  name: string;
  building?: string | null;
  currentCount: number;
  availableSeats: number;
  occupancyPercentage: number;
  crowdStatus: CrowdStatus;
  capacity: number;
  updatedAt?: string;
  insideUsers?: {
    id: string;
    label: string;
    joinedAt: number;
  }[];
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  features?: {
    wifi?: boolean;
    quietZone?: boolean;
    cafe?: boolean;
    chargingPorts?: boolean;
    ac?: boolean;
  };
}

export function StudyAreaCard({
  name,
  building,
  currentCount,
  availableSeats,
  occupancyPercentage,
  capacity,
  updatedAt,
  insideUsers,
  latitude,
  longitude,
  radiusMeters = 20,
  userLocation,
  features,
}: StudyAreaCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const featuresToShow: Feature[] = [];

  if (features?.wifi) featuresToShow.push({ icon: <Wifi size={16} />, label: 'WiFi' });
  if (features?.quietZone) featuresToShow.push({ icon: <Volume2 size={16} />, label: 'Quiet' });
  if (features?.cafe) featuresToShow.push({ icon: <Coffee size={16} />, label: 'Cafe' });
  if (features?.chargingPorts) featuresToShow.push({ icon: <Zap size={16} />, label: 'Charging' });
  if (features?.ac) featuresToShow.push({ icon: <Snowflake size={16} />, label: 'AC' });

  const lastUpdatedText = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';

  const safeAvailableSeats = Math.max(0, availableSeats);
  const safeInsideUsers = insideUsers || [];
  const crowdTone = occupancyPercentage <= 30 ? 'low' : occupancyPercentage <= 70 ? 'medium' : 'high';

  const crowdToneStyles =
    crowdTone === 'low'
      ? 'border-green-300 bg-green-50/70'
      : crowdTone === 'medium'
      ? 'border-yellow-300 bg-yellow-50/70'
      : 'border-red-300 bg-red-50/70';

  const statusFromThreshold: CrowdStatus =
    crowdTone === 'low' ? 'Low Crowd' : crowdTone === 'medium' ? 'Medium Crowd' : 'High Crowd';

  const countBadgeStyles =
    crowdTone === 'low'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : crowdTone === 'medium'
      ? 'border-amber-300 bg-amber-50 text-amber-700'
      : 'border-rose-300 bg-rose-50 text-rose-700';

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className={`border-2 p-5 ${crowdToneStyles}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-main)]">{name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--text-soft)]">
              <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
              {building || 'Building not specified'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={statusFromThreshold} />
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${countBadgeStyles}`}>
              {currentCount} / {capacity}
            </span>
          </div>
        </div>

        {typeof latitude === 'number' && typeof longitude === 'number' ? (
          <div className="mb-4 overflow-hidden rounded-xl border border-[var(--surface-border)]">
            <StudyAreaCardMapPreview
              areaName={name}
              latitude={latitude}
              longitude={longitude}
              radiusMeters={radiusMeters}
              currentCount={currentCount}
              crowdTone={crowdTone}
              userLocation={userLocation}
            />
          </div>
        ) : null}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className={`rounded-xl border p-3 ${countBadgeStyles}`}>
            <p className="text-xs text-[var(--text-muted)]">Current Count</p>
            <p className="mt-1 inline-flex items-center gap-1 text-2xl font-black text-[var(--text-main)]">
              <Users className="h-4 w-4 text-[var(--accent-text)]" />
              {currentCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">Capacity {capacity}</p>
          </div>
          <div className="themed-inset rounded-xl p-3">
            <p className="text-xs text-[var(--text-muted)]">Available Seats</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600">{safeAvailableSeats}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock3 className="h-3.5 w-3.5" />
              Updated {lastUpdatedText}
            </p>
          </div>
        </div>

        <OccupancyIndicator percentage={occupancyPercentage} />

        {featuresToShow.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {featuresToShow.map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-text)]"
              >
                {feature.icon}
                {feature.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="themed-panel-info mt-4 rounded-lg p-2.5 text-xs">
          Privacy-safe occupancy: individual user locations are never shown.
        </div>

        <div className="mt-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-inset)] p-3">
          <p className="text-xs font-semibold text-[var(--text-main)]">Users currently inside ({safeInsideUsers.length})</p>
          {safeInsideUsers.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-[var(--text-soft)]">
              {safeInsideUsers.map((user) => (
                <li key={user.id} className="rounded-md bg-[var(--surface-card)] px-2 py-1">
                  {user.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[var(--text-muted)]">No live users inside this zone right now.</p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

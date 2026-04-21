/**
 * StudyAreaCard Component
 * Displays occupancy information for a single study area
 * Privacy-safe: shows only aggregated occupancy, never individual locations
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Users, Wifi, Volume2, Coffee, Zap, Snowflake, Building2 } from 'lucide-react';
import { CrowdStatus } from '@/lib/geofence';
import GlassCard from '@/components/ui/GlassCard';
import OccupancyIndicator from '@/components/ui/OccupancyIndicator';
import StatusBadge from '@/components/ui/StatusBadge';

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
  features?: {
    wifi?: boolean;
    quietZone?: boolean;
    café?: boolean;
    chargingPorts?: boolean;
    ac?: boolean;
  };
}

export function StudyAreaCard({
  id,
  name,
  building,
  currentCount,
  availableSeats,
  occupancyPercentage,
  crowdStatus,
  capacity,
  updatedAt,
  features,
}: StudyAreaCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const featuresToShow: Feature[] = [];
  if (features?.wifi) featuresToShow.push({ icon: <Wifi size={16} />, label: 'WiFi' });
  if (features?.quietZone) featuresToShow.push({ icon: <Volume2 size={16} />, label: 'Quiet' });
  if (features?.café) featuresToShow.push({ icon: <Coffee size={16} />, label: 'Café' });
  if (features?.chargingPorts) featuresToShow.push({ icon: <Zap size={16} />, label: 'Charging' });
  if (features?.ac) featuresToShow.push({ icon: <Snowflake size={16} />, label: 'AC' });

  const lastUpdatedText = updatedAt
    ? `${Math.max(0, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000))} min ago`
    : 'Live';

  const safeAvailableSeats = Math.max(0, availableSeats);

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className="border-white/20 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-300">
              <Building2 className="h-4 w-4 text-cyan-200" />
              {building || 'Building not specified'}
            </p>
          </div>
          <StatusBadge status={crowdStatus} />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-400">Current Count</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xl font-semibold text-white">
              <Users className="h-4 w-4 text-cyan-200" />
              {currentCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">Capacity {capacity}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-400">Available Seats</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">{safeAvailableSeats}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-100"
              >
                {feature.icon}
                {feature.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-400/10 p-2.5 text-xs text-cyan-100/90">
          Privacy-safe occupancy: individual user locations are never shown.
        </div>
      </GlassCard>
    </motion.div>
  );
}

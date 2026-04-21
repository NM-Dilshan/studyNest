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
  crowdStatus,
  capacity,
  updatedAt,
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

  return (
    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -4 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }}>
      <GlassCard className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-main)]">{name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--text-soft)]">
              <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
              {building || 'Building not specified'}
            </p>
          </div>
          <StatusBadge status={crowdStatus} />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="themed-inset rounded-xl p-3">
            <p className="text-xs text-[var(--text-muted)]">Current Count</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xl font-semibold text-[var(--text-main)]">
              <Users className="h-4 w-4 text-[var(--accent-text)]" />
              {currentCount}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Capacity {capacity}</p>
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
      </GlassCard>
    </motion.div>
  );
}

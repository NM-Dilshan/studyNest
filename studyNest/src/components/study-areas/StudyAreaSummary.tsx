/**
 * StudyAreaSummary Component
 * Shows aggregated statistics across all study areas
 * Helps students quickly find the right area based on crowdlevels
 */

'use client';

import { Activity, BarChart3, TrendingDown, TrendingUp, Users } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import OccupancyIndicator from '@/components/ui/OccupancyIndicator';

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28 rounded-2xl bg-slate-700/50" />
        ))}
      </div>
    );
  }

  const occupancyPercentage = stats.totalCapacity > 0 ? (stats.totalStudentsInside / stats.totalCapacity) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Low Occupancy"
          value={stats.lowCrowdAreas}
          helper="<= 30% utilization"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Medium Occupancy"
          value={stats.mediumCrowdAreas}
          helper="30% to 70% utilization"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="High Occupancy"
          value={stats.highCrowdAreas}
          helper="> 70% utilization"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Students Inside"
          value={stats.totalStudentsInside}
          helper="live aggregate count"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Available Seats"
          value={stats.totalAvailableSeats}
          helper="across all areas"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <GlassCard className="border-white/15 bg-slate-950/55 p-5">
        <h2 className="text-lg font-semibold text-white">Campus Occupancy Overview</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-300">Students Currently Inside</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.totalStudentsInside}</p>
            <p className="mt-1 text-xs text-slate-400">across all active study areas</p>
          </div>
          <div>
            <p className="text-sm text-slate-300">Available Seats</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">{stats.totalAvailableSeats}</p>
            <p className="mt-1 text-xs text-slate-400">remaining seat inventory</p>
          </div>
          <div>
            <p className="text-sm text-slate-300">Overall Capacity</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{stats.totalCapacity}</p>
            <p className="mt-1 text-xs text-slate-400">all areas combined</p>
          </div>
        </div>
        <div className="mt-5">
          <OccupancyIndicator percentage={occupancyPercentage} label="Campus-wide occupancy" />
        </div>
      </GlassCard>

      <GlassCard className="border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
        <p className="font-semibold text-cyan-100">Smart usage tips</p>
        <p className="mt-1 text-cyan-100/90">
          Low occupancy spaces are ideal for focused work, while medium occupancy areas are better for group collaboration.
          Occupancy data auto-refreshes every 30 seconds.
        </p>
      </GlassCard>
    </div>
  );
}

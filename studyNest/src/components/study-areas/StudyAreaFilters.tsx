"use client";

import { RefreshCcw, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AppButton from "@/components/ui/AppButton";

export type CrowdFilter = "all" | "low" | "medium" | "high";
export type FeatureFilter = "all" | "wifi" | "quiet" | "charging" | "ac";

interface StudyAreaFiltersProps {
  searchTerm: string;
  crowdFilter: CrowdFilter;
  buildingFilter: string;
  featureFilter: FeatureFilter;
  availableBuildings: string[];
  visibleCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onCrowdChange: (value: CrowdFilter) => void;
  onBuildingChange: (value: string) => void;
  onFeatureChange: (value: FeatureFilter) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function StudyAreaFilters({
  searchTerm,
  crowdFilter,
  buildingFilter,
  featureFilter,
  availableBuildings,
  visibleCount,
  totalCount,
  onSearchChange,
  onCrowdChange,
  onBuildingChange,
  onFeatureChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}: StudyAreaFiltersProps) {
  return (
    <GlassCard className="border-white/15 bg-slate-950/55 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
          <SlidersHorizontal className="h-4 w-4 text-cyan-200" />
          Filters & Search
        </div>
        <p className="text-xs text-slate-300">
          Showing <span className="font-semibold text-white">{visibleCount}</span> of {" "}
          <span className="font-semibold text-white">{totalCount}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="group relative block">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-cyan-200" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search area or building..."
            className="h-11 w-full rounded-lg border border-white/15 bg-slate-900/75 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Search study areas"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Crowd Level</span>
          <select
            value={crowdFilter}
            onChange={(event) => onCrowdChange(event.target.value as CrowdFilter)}
            className="h-11 w-full rounded-lg border border-white/15 bg-slate-900/75 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Filter by crowd level"
          >
            <option value="all">All Levels</option>
            <option value="low">Low Occupancy</option>
            <option value="medium">Medium Occupancy</option>
            <option value="high">High Occupancy</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Building</span>
          <select
            value={buildingFilter}
            onChange={(event) => onBuildingChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-slate-900/75 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Filter by building"
          >
            <option value="all">All Buildings</option>
            {availableBuildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">Feature</span>
          <select
            value={featureFilter}
            onChange={(event) => onFeatureChange(event.target.value as FeatureFilter)}
            className="h-11 w-full rounded-lg border border-white/15 bg-slate-900/75 px-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Filter by feature"
          >
            <option value="all">Any Feature</option>
            <option value="wifi">WiFi</option>
            <option value="quiet">Quiet Zone</option>
            <option value="charging">Charging Ports</option>
            <option value="ac">Air Conditioning</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <AppButton
          onClick={onRefresh}
          size="sm"
          variant="primary"
          className="w-full bg-cyan-400/10 sm:w-auto"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </AppButton>
        <AppButton
          onClick={onReset}
          size="sm"
          variant="secondary"
          className="w-full text-slate-200 sm:w-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </AppButton>
      </div>
    </GlassCard>
  );
}

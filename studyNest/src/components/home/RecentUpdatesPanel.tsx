import { Clock, User } from "lucide-react";
import OccupancyIndicator from "@/components/ui/OccupancyIndicator";
import GlassCard from "@/components/ui/GlassCard";

export interface HomeRecentUpdate {
  type: "Hall" | "Study Area";
  name: string | null | undefined;
  building: string | null | undefined;
  occupancy: "FREE" | "MEDIUM" | "OCCUPIED";
  reporter: string | null | undefined;
  time: string;
}

function occupancyToPercent(occupancy: HomeRecentUpdate["occupancy"]) {
  if (occupancy === "FREE") return 18;
  if (occupancy === "MEDIUM") return 56;
  return 88;
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

interface RecentUpdatesPanelProps {
  updates: HomeRecentUpdate[];
}

export default function RecentUpdatesPanel({ updates }: RecentUpdatesPanelProps) {
  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <GlassCard key={`${update.name}-${index}`} className="border-white/15 bg-slate-950/55 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">{update.type}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{update.name || "Unknown Space"}</h3>
              <p className="mt-1 text-sm text-slate-300">{update.building || "Unknown Building"}</p>
            </div>
            <div className="min-w-[180px] flex-1">
              <OccupancyIndicator
                percentage={occupancyToPercent(update.occupancy)}
                label={`Status: ${update.occupancy}`}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {update.reporter || "Anonymous"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(update.time)}
            </span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

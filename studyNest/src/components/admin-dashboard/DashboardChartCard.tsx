import type { ReactNode } from "react";
import DashboardSection from "./DashboardSection";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  loadingText: string;
  emptyText: string;
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
  className?: string;
}

export default function DashboardChartCard({
  title,
  subtitle,
  loadingText,
  emptyText,
  isLoading,
  isEmpty,
  children,
  className = "",
}: DashboardChartCardProps) {
  return (
    <DashboardSection title={title} subtitle={subtitle} className={className}>
      <div className="h-[280px] w-full min-w-0 sm:h-[320px]">
        {isLoading ? (
          <div className="space-y-3 py-3">
            <LoadingSkeleton className="h-6 w-2/3" />
            <LoadingSkeleton className="h-56 w-full" />
            <p className="text-sm font-medium text-[var(--text-soft)]">{loadingText}</p>
          </div>
        ) : isEmpty ? (
          <div className="pt-6">
            <EmptyState
              title="No Data"
              description={emptyText}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardSection>
  );
}

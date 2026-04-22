import type { ReactNode } from "react";
import GlassCard from "@/components/ui/GlassCard";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: DashboardSectionProps) {
  return (
    <GlassCard className={`overflow-hidden p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-main)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--text-soft)]">{subtitle}</p> : null}
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>
      <div className={`min-w-0 ${bodyClassName}`}>{children}</div>
    </GlassCard>
  );
}

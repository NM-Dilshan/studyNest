import type { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  children?: ReactNode;
}

const variantMap: Record<string, string> = {
  free: "border-emerald-300/50 bg-emerald-400/15 text-emerald-200",
  empty: "border-sky-300/50 bg-sky-400/15 text-sky-200",
  low: "border-emerald-300/50 bg-emerald-400/15 text-emerald-200",
  medium: "border-amber-300/50 bg-amber-400/15 text-amber-200",
  high: "border-rose-300/55 bg-rose-400/15 text-rose-200",
  busy: "border-rose-300/55 bg-rose-400/15 text-rose-200",
  active: "border-emerald-300/50 bg-emerald-400/15 text-emerald-200",
  expired: "border-slate-300/50 bg-slate-300/15 text-slate-200",
  pending: "border-slate-300/50 bg-slate-300/15 text-slate-200",
  viewed: "border-sky-300/55 bg-sky-400/15 text-sky-200",
  progress: "border-amber-300/50 bg-amber-400/15 text-amber-200",
  responded: "border-sky-300/55 bg-sky-400/15 text-sky-200",
  resolved: "border-emerald-300/50 bg-emerald-400/15 text-emerald-200",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function StatusBadge({ status, className = "", children }: StatusBadgeProps) {
  const normalized = normalize(status);
  const key = Object.keys(variantMap).find((item) => normalized.includes(item)) || "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${variantMap[key]} ${className}`}
    >
      {children}
      {status}
    </span>
  );
}

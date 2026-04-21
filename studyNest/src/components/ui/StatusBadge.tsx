import type { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  children?: ReactNode;
}

const variantMap: Record<string, string> = {
  free: "border-transparent themed-badge-success",
  empty: "border-transparent themed-badge-info",
  low: "border-transparent themed-badge-success",
  medium: "border-transparent themed-badge-warning",
  high: "border-transparent themed-badge-danger",
  busy: "border-transparent themed-badge-danger",
  active: "border-transparent themed-badge-success",
  expired: "border-transparent themed-badge-neutral",
  pending: "border-transparent themed-badge-neutral",
  viewed: "border-transparent themed-badge-info",
  progress: "border-transparent themed-badge-warning",
  responded: "border-transparent themed-badge-info",
  resolved: "border-transparent themed-badge-success",
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

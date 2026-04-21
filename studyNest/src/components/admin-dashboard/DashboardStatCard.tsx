import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: string;
  trendPositive?: boolean;
  loading?: boolean;
}

export default function DashboardStatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendPositive = true,
  loading = false,
}: DashboardStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="themed-surface rounded-2xl p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{title}</p>
        <div className="text-[var(--accent-text)]">{icon}</div>
      </div>

      <p className="text-3xl font-black text-[var(--text-main)]">{loading ? "..." : value}</p>

      {trend ? (
        <p className={`mt-2 text-xs font-semibold ${trendPositive ? "text-emerald-600" : "text-rose-600"}`}>
          {trend}
        </p>
      ) : description ? (
        <p className="mt-2 text-xs text-[var(--text-soft)]">{description}</p>
      ) : null}
    </motion.div>
  );
}

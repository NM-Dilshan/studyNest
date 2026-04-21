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
      className="rounded-2xl border border-white/15 bg-slate-950/55 p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{title}</p>
        <div className="text-cyan-200">{icon}</div>
      </div>

      <p className="text-3xl font-black text-white">{loading ? "..." : value}</p>

      {trend ? (
        <p className={`mt-2 text-xs font-semibold ${trendPositive ? "text-emerald-200" : "text-rose-200"}`}>
          {trend}
        </p>
      ) : description ? (
        <p className="mt-2 text-xs text-slate-300">{description}</p>
      ) : null}
    </motion.div>
  );
}

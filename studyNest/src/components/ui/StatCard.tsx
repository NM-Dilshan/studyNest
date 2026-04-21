"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  className?: string;
}

export default function StatCard({ title, value, helper, icon, className = "" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`themed-surface rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{value}</p>
          {helper ? <p className="mt-2 text-xs text-[var(--text-soft)]">{helper}</p> : null}
        </div>
        {icon ? <div className="text-[var(--accent-text)]">{icon}</div> : null}
      </div>
    </motion.div>
  );
}

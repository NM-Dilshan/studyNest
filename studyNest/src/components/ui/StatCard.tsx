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
      className={`rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-300">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
        </div>
        {icon ? <div className="text-cyan-200">{icon}</div> : null}
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

interface FeatureSpotlightCardProps {
  href: string;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}

export default function FeatureSpotlightCard({ href, title, description, badge, icon: Icon }: FeatureSpotlightCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.24, ease: "easeOut" }}>
      <Link
        href={href}
        className="group block rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-950/70 p-5 backdrop-blur-xl transition hover:border-cyan-300/45"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 text-cyan-100 transition group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        <div className="mt-4">
          <StatusBadge status={badge} className="!normal-case" />
        </div>
      </Link>
    </motion.div>
  );
}

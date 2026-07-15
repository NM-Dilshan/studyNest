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
        className="group themed-surface block rounded-2xl p-5 transition hover:border-[var(--surface-border-strong)]"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-text)] transition group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-soft)]">{description}</p>
        <div className="mt-4">
          <StatusBadge status={badge} className="!normal-case" />
        </div>
      </Link>
    </motion.div>
  );
}

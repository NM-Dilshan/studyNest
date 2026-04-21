"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 18,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.section>
  );
}

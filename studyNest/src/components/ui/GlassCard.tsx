import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--header-border)] bg-[var(--bg-glass)] backdrop-blur-xl shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

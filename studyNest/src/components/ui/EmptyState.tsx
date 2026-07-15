import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      className="themed-surface rounded-2xl border border-dashed p-8 text-center"
      role="status"
      aria-live="polite"
    >
      {icon ? <div className="mx-auto mb-3 flex w-fit text-[var(--text-muted)]">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-soft)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

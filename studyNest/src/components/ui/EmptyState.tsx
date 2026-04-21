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
      className="rounded-2xl border border-dashed border-slate-500/40 bg-slate-900/45 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      {icon ? <div className="mx-auto mb-3 flex w-fit text-slate-300">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-200">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

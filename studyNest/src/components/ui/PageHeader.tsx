import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, eyebrow, icon, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        {eyebrow ? (
          <p className="mb-2 inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-start gap-2">
          {icon ? <span className="mt-1 inline-flex shrink-0">{icon}</span> : null}
          <h1 className="text-balance text-3xl font-semibold leading-tight text-white md:text-5xl">{title}</h1>
        </div>
        {subtitle ? <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end md:gap-3">{actions}</div> : null}
    </header>
  );
}

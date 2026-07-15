import type { ReactNode } from 'react'
import GlassCard from '@/components/ui/GlassCard'

interface VolunteerPanelSectionProps {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  children: ReactNode
  className?: string
}

export default function VolunteerPanelSection({
  title,
  subtitle,
  rightSlot,
  children,
  className = '',
}: VolunteerPanelSectionProps) {
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--text-soft)]">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </div>
      {children}
    </GlassCard>
  )
}

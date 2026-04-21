import { ReactNode } from 'react'

interface AppBackgroundProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export default function AppBackground({
  children,
  className,
  contentClassName,
}: AppBackgroundProps) {
  return (
    <div className={`themed-page-shell relative min-h-screen overflow-x-hidden bg-[var(--bg-main)] ${className ?? ''}`}>

      <div className={`relative z-10 ${contentClassName ?? ''}`}>{children}</div>
    </div>
  )
}

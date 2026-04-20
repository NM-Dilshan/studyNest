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
    <div className={`relative min-h-screen overflow-x-hidden bg-white ${className ?? ''}`}>

      <div className={`relative z-10 ${contentClassName ?? ''}`}>{children}</div>
    </div>
  )
}

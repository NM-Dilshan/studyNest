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
    <div className={`relative min-h-screen overflow-hidden ${className ?? ''}`}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(125,211,252,0.25),transparent_38%),radial-gradient(circle_at_80%_18%,rgba(167,139,250,0.24),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(250,204,21,0.22),transparent_38%),radial-gradient(circle_at_20%_82%,rgba(52,211,153,0.22),transparent_38%),linear-gradient(160deg,#f8fbff_0%,#eef4ff_28%,#ecfffb_52%,#fff8ec_100%)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute top-1/4 right-[-7rem] h-96 w-96 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-1/4 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      </div>

      <div className={`relative z-10 ${contentClassName ?? ''}`}>{children}</div>
    </div>
  )
}

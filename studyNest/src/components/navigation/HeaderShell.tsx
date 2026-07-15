import type { ReactNode } from 'react'

interface HeaderShellProps {
  children: ReactNode
  className?: string
}

export default function HeaderShell({ children, className = '' }: HeaderShellProps) {
  return (
    <header className={`sticky top-0 z-50 border-b border-[var(--header-border)] bg-[var(--header-surface)]/95 backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  )
}

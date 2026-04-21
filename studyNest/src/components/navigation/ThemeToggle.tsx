'use client'

import { SunMoon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--header-border-strong)] bg-[var(--header-button-bg)] px-3 py-2 text-sm font-semibold text-[var(--header-text)] transition hover:bg-[var(--header-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] ${className}`}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <SunMoon className="h-4 w-4" />
      <span className="hidden md:inline">Theme</span>
    </button>
  )
}

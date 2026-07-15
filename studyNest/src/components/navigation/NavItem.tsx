'use client'

import Link from 'next/link'

interface NavItemProps {
  href: string
  label: string
  active?: boolean
  className?: string
  onClick?: () => void
}

export default function NavItem({ href, label, active = false, className = '', onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] ${
        active
          ? 'border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] text-[var(--header-accent-text)]'
          : 'border-transparent text-[var(--header-text-soft)] hover:border-[var(--header-border)] hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)]'
      } ${className}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}

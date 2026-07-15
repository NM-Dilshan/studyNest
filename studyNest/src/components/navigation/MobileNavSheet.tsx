'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import NavItem from '@/components/navigation/NavItem'

export interface MobileNavItem {
  href: string
  label: string
  active: boolean
}

interface MobileNavSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  navItems: MobileNavItem[]
  footer?: ReactNode
}

export default function MobileNavSheet({ open, onClose, title = 'Navigation', navItems, footer }: MobileNavSheetProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        aria-label="Close navigation menu"
      />

      <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[var(--header-border)] bg-[var(--header-surface-solid)] p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--header-text)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] text-[var(--header-text-soft)] transition hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} active={item.active} className="flex w-full justify-start" onClick={onClose} />
          ))}
        </nav>

        {footer ? <div className="mt-6 border-t border-[var(--header-border)] pt-4">{footer}</div> : null}
      </div>
    </div>
  )
}

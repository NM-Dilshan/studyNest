'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react'

interface MenuItem {
  label: string
  href: string
}

interface UserMenuProps {
  name: string
  roleLabel: string
  initials: string
  items?: MenuItem[]
  onLogout: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export default function UserMenu({ name, roleLabel, initials, items = [], onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) {
        return
      }
      if (!panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] px-3 py-2 text-[var(--header-text)] transition hover:bg-[var(--header-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--header-accent-bg)] text-xs font-bold text-[var(--header-accent-text)]">
          {initials}
        </span>
        <span className="hidden text-left sm:flex sm:flex-col">
          <span className="text-xs font-semibold text-[var(--header-text)]">{name}</span>
          <span className="text-[11px] text-[var(--header-text-muted)]">{roleLabel}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-[var(--header-text-muted)] transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--header-border)] bg-[var(--header-surface-solid)] shadow-xl"
          role="menu"
          aria-label="User menu"
        >
          <div className="border-b border-[var(--header-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--header-text)]">{name}</p>
            <p className="text-xs text-[var(--header-text-muted)]">{roleLabel}</p>
          </div>

          <div className="p-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--header-text-soft)] transition hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)]"
              >
                <UserCircle2 className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            <a
              href="/login/admin"
              role="menuitem"
              onClick={(event) => {
                onLogout(event)
                setOpen(false)
              }}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

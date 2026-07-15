'use client'

import { useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { useSearch } from '@/contexts/SearchContext'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useRouter } from 'next/navigation'
import HeaderShell from '@/components/navigation/HeaderShell'
import ThemeToggle from '@/components/navigation/ThemeToggle'
import UserMenu from '@/components/navigation/UserMenu'

export default function AdminHeader() {
  const router = useRouter()
  const { searchValue, setSearchValue } = useSearch()
  const [searchFocused, setSearchFocused] = useState(false)

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/admin')
  }

  // Get current date
  const getCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <HeaderShell className="z-40">
      <div className="flex w-full flex-col gap-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="relative hidden md:block w-full max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--header-text-muted)]" />
            <input
              type="text"
              value={searchValue}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search halls, study areas, buildings..."
              className={`w-full rounded-xl border bg-[var(--header-button-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--header-text)] placeholder:text-[var(--header-text-muted)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] ${searchFocused ? 'border-[var(--header-border-strong)]' : 'border-[var(--header-border)] hover:border-[var(--header-border-strong)]'}`}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] px-3 py-2">
              <CalendarDays className="h-4 w-4 text-[var(--header-text-muted)]" />
              <div className="flex flex-col items-start leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--header-text-muted)]">Today</p>
                <p className="text-xs font-semibold text-[var(--header-text)]">{getCurrentDate().split(', ')[0]}</p>
              </div>
            </div>

            <ThemeToggle />
            <NotificationBell userRole="admin" />

            <UserMenu
              name="Admin"
              roleLabel="Administrator"
              initials="A"
              onLogout={handleLogout}
              items={[
                { href: '/admin/complaints', label: 'Complaint Center' },
                { href: '/Naveen/Admin/messages', label: 'Student Messages' },
              ]}
            />
          </div>
        </div>

        <div className="md:hidden">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--header-text-muted)]" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--header-text)] placeholder:text-[var(--header-text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
            />
          </div>
        </div>
      </div>
    </HeaderShell>
  )
}

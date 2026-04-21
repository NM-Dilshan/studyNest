'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderStudentID from '@/components/HeaderStudentID'
import VolunteerHeaderDashboard from '@/components/VolunteerHeaderDashboard'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { Menu, MapPin } from 'lucide-react'
import { useLocationTracking } from '@/hooks/useLocationTracking'
import NotificationBellWrapper from '@/components/notifications/NotificationBellWrapper'
import { clearStoredSession, readStoredUser, type ClientUser } from '@/lib/auth/clientUser'
import HeaderShell from '@/components/navigation/HeaderShell'
import MobileNavSheet from '@/components/navigation/MobileNavSheet'
import NavItem from '@/components/navigation/NavItem'
import ThemeToggle from '@/components/navigation/ThemeToggle'

interface MainHeaderProps {
  showAuthActions?: boolean
  showStudentId?: boolean
}

export default function MainHeader({ showAuthActions = true, showStudentId = true }: MainHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const user: ClientUser | null = isHydrated ? readStoredUser() : null
  const effectiveGpsEnabled = user ? gpsEnabled || localStorage.getItem(`gpsEnabled_${user.user_id}`) === 'true' : false

  const location = useLocationTracking(user?.user_id || null, true)

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    clearStoredSession()
    router.push('/login/signIN')
  }

  const toggleGPS = async () => {
    if (!user || !location) return

    try {
      if (effectiveGpsEnabled) {
        if (typeof location.stopTracking === 'function') {
          location.stopTracking()
        }
        if (typeof location.revokePermission === 'function') {
          await location.revokePermission()
        }
        localStorage.removeItem(`gpsEnabled_${user.user_id}`)
        setGpsEnabled(false)
      } else {
        if (typeof location.requestPermission === 'function') {
          await location.requestPermission()
          if (typeof location.startTracking === 'function') {
            location.startTracking()
          }
          localStorage.setItem(`gpsEnabled_${user.user_id}`, 'true')
          setGpsEnabled(true)
        }
      }
    } catch (err) {
      console.error('Failed to toggle GPS:', err)
    }
  }

  const isVolunteer = user?.role === 'volunteer'

  const navItems = [
    { href: '/home', label: 'Home' },
    ...(user ? [{ href: '/requests', label: 'Requests' }] : []),
    { href: '/student/halls', label: 'Halls' },
    { href: '/study-areas', label: 'Study Areas' },
    { href: '/about', label: 'About' },
    { href: '/Naveen/my-complaints', label: 'Complaints' },
    ...(isVolunteer ? [{ href: '/volunteer/requests', label: 'Dashboard' }] : []),
  ]

  const isActivePath = (href: string) => {
    if (href === '/home') {
      return pathname === '/home'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <HeaderShell>
        <Link href="/home" className="flex items-center space-x-2 rounded-xl px-1 py-1 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">
            <Image
              src="/logo.jpeg"
              alt="StudyNest Logo"
              width={40}
              height={40}
              className="rounded-md w-10 h-10"
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight text-[var(--header-text)]">StudyNest</h1>
              <p className="text-xs text-[var(--header-text-muted)]">Smart Space Finder</p>
            </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} active={isActivePath(item.href)} />
          ))}
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user && (
              <button
                onClick={toggleGPS}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] sm:px-3 ${
                  effectiveGpsEnabled
                    ? 'border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] text-[var(--header-accent-text)] hover:brightness-110'
                    : 'border-[var(--header-border)] bg-[var(--header-button-bg)] text-[var(--header-text-soft)] hover:bg-[var(--header-button-hover)]'
                }`}
                title={effectiveGpsEnabled ? 'GPS is active' : 'Enable GPS location'}
                aria-label={effectiveGpsEnabled ? 'Disable GPS location tracking' : 'Enable GPS location tracking'}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">{effectiveGpsEnabled ? 'GPS On' : 'GPS Off'}</span>
              </button>
            )}

            {showStudentId && user && (
              isVolunteer ? (
                <div className="hidden lg:block border-r border-[var(--header-border)] pr-3"><VolunteerHeaderDashboard /></div>
              ) : (
                <div className="hidden lg:block border-r border-[var(--header-border)] pr-3"><HeaderStudentID /></div>
              )
            )}

            {user && <NotificationBellWrapper userId={user.user_id} userRole={user.role} />}

            {showAuthActions && (user ? (
              <form onSubmit={handleLogout}>
                <button type="submit" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] px-3 py-2 text-sm font-semibold text-[var(--header-text-soft)] transition hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">Logout</button>
              </form>
            ) : (
              <Link href="/login/signIN" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] px-3 py-2 text-sm font-semibold text-[var(--header-accent-text)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">Login</Link>
            ))}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex min-h-11 w-11 items-center justify-center rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] text-[var(--header-text)] transition hover:bg-[var(--header-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
      </HeaderShell>

      <MobileNavSheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="StudyNest Menu"
        navItems={navItems.map((item) => ({ ...item, active: isActivePath(item.href) }))}
        footer={<ThemeToggle className="w-full justify-center" />}
      />
    </>
  )
}

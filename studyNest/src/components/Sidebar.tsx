'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Building, MapPin, AlertCircle, Calendar, AlertTriangle, Megaphone } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [complaintsCount, setComplaintsCount] = useState<number>(0)

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch('/api/admin/complaints/summary')
        const data = await response.json()
        if (data.success && data.stats) {
          const total = (data.stats.highPriorityHalls || 0) + (data.stats.normalPriorityHalls || 0)
          setComplaintsCount(total)
        }
      } catch (err) {
        console.error('Error fetching complaints:', err)
      }
    }

    fetchComplaints()
  }, [])

  const menuItems = [
    { label: 'Dashboard', icon: Home, href: '/Naveen/Admin/dashboard' },
    { label: 'Lecture Halls', icon: Building, href: '/admin/lecture-hall' },
    { label: 'Study Areas', icon: MapPin, href: '/admin/study-area' },
    { label: 'Complaints', icon: AlertCircle, href: '/admin/complaints' },
    { label: 'Timetables', icon: Calendar, href: '/admin/timetable' },
    { label: 'Student Messages', icon: Megaphone, href: '/Naveen/Admin/messages' },
    { label: 'Conflict Overrides', icon: AlertTriangle, href: '/admin/conflicts' },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/Naveen/Admin/dashboard') return pathname === '/Naveen/Admin/dashboard'
    if (href === '/Naveen/Admin/messages') return pathname === '/Naveen/Admin/messages'
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-[var(--surface-border)] bg-[var(--surface-elevated-solid)] shadow-[var(--surface-shadow)]">
      <div className="border-b border-[var(--surface-border)] p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="StudyNest Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div>
            <h1 className="text-lg font-bold text-[var(--header-text)]">StudyNest</h1>
            <p className="text-xs text-[var(--header-text-muted)]">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    active
                      ? 'border border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] text-[var(--header-accent-text)] shadow-md'
                      : 'text-[var(--header-text-soft)] hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)]'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>

                  {item.label === 'Complaints' && complaintsCount > 0 && (
                    <div className="ml-auto">
                      <span
                        className={`inline-block h-2.5 w-2.5 animate-pulse rounded-full ${
                          active ? 'bg-rose-300' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--surface-border)] p-4">
        <p className="text-center text-xs text-[var(--header-text-muted)]">StudyNest © 2024</p>
      </div>
    </aside>
  )
}

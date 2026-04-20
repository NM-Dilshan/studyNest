'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Building, MapPin, AlertCircle, Calendar, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [complaintsCount, setComplaintsCount] = useState<number>(0)

  useEffect(() => {
    // Fetch complaints count
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
    {
      label: 'Dashboard',
      icon: Home,
      href: '/Naveen/Admin/dashboard',
    },
    {
      label: 'Lecture Halls',
      icon: Building,
      href: '/admin/lecture-hall',
    },
    {
      label: 'Study Areas',
      icon: MapPin,
      href: '/admin/study-area',
    },
    {
      label: 'Complaints',
      icon: AlertCircle,
      href: '/admin/complaints',
    },
    {
      label: 'Timetables',
      icon: Calendar,
      href: '/admin/timetable',
    },
    {
      label: 'Conflict Overrides',
      icon: AlertTriangle,
      href: '/admin/conflicts',
    },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/Naveen/Admin/dashboard') {
      return pathname === '/Naveen/Admin/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="StudyNest Logo"
            width={40}
            height={40}
            className="rounded-lg object-cover w-10 h-10"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900">StudyNest</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    active
                      ? 'bg-[#2E6F95] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Notification Badge for Complaints */}
                  {item.label === 'Complaints' && complaintsCount > 0 && (
                    <div className="ml-auto">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full animate-pulse ${
                          active ? 'bg-red-200' : 'bg-red-500'
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          StudyNest © 2024
        </p>
      </div>
    </aside>
  )
}

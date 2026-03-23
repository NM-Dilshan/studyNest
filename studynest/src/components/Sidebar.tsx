'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building, MapPin, AlertCircle } from 'lucide-react'

interface MenuItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export function Sidebar() {
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
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
          <div className="w-10 h-10 bg-[#2E6F95] rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">S</span>
          </div>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#2E6F95] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
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

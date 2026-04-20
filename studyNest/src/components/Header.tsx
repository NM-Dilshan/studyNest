'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderStudentID from '@/components/HeaderStudentID'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

interface HeaderProps {
  currentPage?: 'home' | 'dashboard' | 'student-area' | 'about' | 'complaints'
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Initialize user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
    setIsHydrated(true)
  }, [])

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  const isVolunteer = user?.role === 'volunteer'

  const navLinks = [
    { href: '/home', label: 'Home', key: 'home' },
    { href: '/lecture-halls', label: 'Lecture Halls', key: 'lecture-halls' },
    { href: '/study-areas', label: 'Study Areas', key: 'student-area' },
    { href: '/about', label: 'About', key: 'about' },
    { href: '/Naveen/my-complaints', label: 'Complaints', key: 'complaints' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Branding */}
          <Link href="/home" className="flex items-center space-x-3 hover:opacity-80 transition">
            <Image 
              src="/logo.jpeg" 
              alt="StudyNest Logo" 
              width={40}
              height={40}
              className="rounded-lg shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">StudyNest</h1>
              <p className="text-xs text-gray-500">Campus Free Space Finder</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`font-medium transition ${
                  currentPage === link.key
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Show Volunteer button ONLY for volunteers */}
            {isHydrated && isVolunteer && (
              <Link 
                href="/Sunera/volunteer" 
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
              >
                Volunteer
              </Link>
            )}
          </nav>

          {/* Student ID Display */}
          <div className="hidden lg:block">
            <HeaderStudentID />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full">3</span>
            </button>
            <form onSubmit={handleLogout}>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}

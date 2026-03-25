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

export default function MainHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let parsedUser: User | null = null
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        parsedUser = JSON.parse(userData)
      } catch {
        localStorage.removeItem('user')
      }
    }

    const timer = setTimeout(() => {
      setUser(parsedUser)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  const isVolunteer = user?.role === 'volunteer'

  return (
    <header className="bg-[#FBFDFD]/95 backdrop-blur border-b border-slate-200/70 shadow-sm sticky top-0 z-50">
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
            <Link href="/home" className="text-[#2E6F95] font-semibold hover:text-[#255B79]">Home</Link>
            <Link href="/student/halls" className="text-slate-600 hover:text-[#2E6F95]">Lecture Halls</Link>
            <a href="/study-areas" className="text-slate-600 hover:text-[#2E6F95]">Study Areas</a>
            <a href="/about" className="text-slate-600 hover:text-[#2E6F95]">About</a>
            <Link href="/Naveen/my-complaints" className="text-slate-600 hover:text-[#2E6F95]">Complaints</Link>
            {/* Show Volunteer button ONLY for volunteers */}
            {isVolunteer && (
              <a href="/Sunera/volunteer" className="px-4 py-2 bg-[#2E6F95] text-white rounded-full font-medium hover:bg-[#255B79] transition">
                Volunteer
              </a>
            )}
          </nav>

          {/* Student ID Display */}
          <div className="hidden lg:block">
            <HeaderStudentID />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-600 hover:text-[#2E6F95]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {user ? (
              <form onSubmit={handleLogout}>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#255B79] hover:bg-[#2E6F95]/5 rounded-lg transition">
                  Logout
                </button>
              </form>
            ) : (
              <Link href="/login/signIN" className="px-4 py-2 text-sm font-medium text-[#2E6F95] hover:text-[#255B79] hover:bg-[#2E6F95]/5 rounded-lg transition">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

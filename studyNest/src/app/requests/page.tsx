'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import MainHeader from '@/components/MainHeader'
import RequestForm from '@/components/hall-requests/RequestForm'
import MyRequestsList from '@/components/hall-requests/MyRequestsList'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

export default function RequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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

    if (!parsedUser) {
      router.push('/login/signIN')
      return
    }

    setUser(parsedUser)
    setIsHydrated(true)
  }, [router])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E6F95] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleRequestCreated = () => {
    // Trigger refresh of the requests list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <MainHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hall Information Requests</h1>
          <p className="text-lg text-gray-600">
            Request real-time information about lecture halls from our volunteer network
          </p>
        </div>

        {/* Student-Only Notice */}
        {user.role === 'student' ? (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Welcome, {user.name}!
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Use the form below to request real-time information about any lecture hall. Volunteers will respond with
                current status, occupancy, and availability.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              As a {user.role}, you can create requests and also earn reputation by responding to requests from others.
              Visit{' '}
              <a href="/volunteer/requests" className="font-bold underline hover:no-underline">
                the volunteer dashboard
              </a>{' '}
              to respond to incoming requests.
            </p>
          </div>
        )}

        {/* Layout: Form + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Request Form */}
          <div className="lg:col-span-1">
            <RequestForm
              userId={user.user_id}
              userRole={user.role as 'student' | 'volunteer'}
              userIdNumber={user.student_id || user.user_id.slice(0, 8)}
              userName={user.name}
              onRequestCreated={handleRequestCreated}
            />
          </div>

          {/* Right Column - Requests List */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Requests</h2>
              <p className="text-gray-600">View your requests and responses from volunteers</p>
            </div>
            <MyRequestsList userId={user.user_id} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </main>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Bell, Tabs } from 'lucide-react'
import MainHeader from '@/components/MainHeader'
import VolunteerIncomingRequestList from '@/components/hall-requests/VolunteerIncomingRequestList'
import VolunteerHallForm from '@/components/volunteer/VolunteerHallForm'
import VolunteerSubmissionList from '@/components/volunteer/VolunteerSubmissionList'

interface User {
  user_id: string
  student_id?: string
  volunteer_id?: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

export default function VolunteerRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'requests' | 'submit'>('requests')

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

    // Only volunteers and admins can access this page (students can too to create requests)
    // But the main dashboard is for volunteers
    if (parsedUser.role !== 'volunteer' && parsedUser.role !== 'admin') {
      router.push('/requests')
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

  const volunteerId = user.volunteer_id || user.user_id.slice(0, 8)

  return (
    <>
      <MainHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-[#2E6F95]" />
            <h1 className="text-4xl font-bold text-gray-900">Volunteer Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Respond to real-time hall information requests and build your reputation
          </p>
        </div>

        {/* Volunteer Info Card */}
        <div className="mb-8 p-6 bg-gradient-to-r from-[#2E6F95] to-[#1e4f6f] text-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-sm opacity-90">
            You're helping the community find study spaces. Respond to requests to earn reputation and improve your volunteer score.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-[#2E6F95] text-[#2E6F95]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Bell className="inline-block w-5 h-5 mr-2" />
              Incoming Requests
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-[#2E6F95] text-[#2E6F95]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ✏️ Submit Hall Update
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' ? (
          // Incoming Requests Tab
          <>
            {/* Refresh Note */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This dashboard automatically updates every 5 seconds. New requests will appear at the top.
              </p>
            </div>

            {/* Requests List */}
            <VolunteerIncomingRequestList
              volunteerId={user.user_id}
              refreshTrigger={refreshTrigger}
            />
          </>
        ) : (
          // Submit Hall Update Tab
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <VolunteerHallForm
                volunteerId={user.user_id}
                onSubmitSuccess={() => setRefreshTrigger(prev => prev + 1)}
              />

              {/* Tips Card */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tips for Accurate Updates</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Submit updates only when you're in or have just left the hall</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Be honest about occupancy levels for accurate information</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Set appropriate expiry times (30 min to 2 hours)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Add notes for special situations (maintenance, events, etc.)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Status Guide */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h3 className="font-semibold text-gray-900 mb-4">Status Guide</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mr-2">Free</span>
                    <span className="text-gray-600">Hall is completely empty or has plenty of seats</span>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mr-2">Moderate</span>
                    <span className="text-gray-600">Hall is moderately filled, some seats available</span>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold mr-2">Busy</span>
                    <span className="text-gray-600">Hall is quite crowded, few seats left</span>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold mr-2">Full</span>
                    <span className="text-gray-600">Hall is completely full, no seats available</span>
                  </div>
                </div>
              </div>

              {/* My Submissions */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                <VolunteerSubmissionList volunteerId={user.user_id} refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  )
}

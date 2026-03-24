'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  Bell,
  LogOut,
  Trophy,
  TrendingUp,
  Star,
  Building2,
  MapPin,
  Award,
  Clock,
} from 'lucide-react'
import VolunteerSubmitForm from '@/components/VolunteerSubmitForm'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface ScoreData {
  total_updates: number
  total_reviews: number
  average_rating: number
  accurate_count: number
  inaccurate_count: number
  score: number
}



interface HistoryItemRaw {
  id: number
  type: 'hall' | 'area'
  name: string
  status: string
  time: string
  points: number
  confidence: string
}

interface HistoryItem {
  id: number
  type: 'hall' | 'area'
  name: string
  status: string
  time: Date
  points: number
  confidence: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  updates: number
  points: number
  isCurrentUser?: boolean
}

// ------------------------------------------------------------
// Helper function to get status color
// ------------------------------------------------------------
const getStatusColor = (status: string | null | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  switch (status.toLowerCase()) {
    case 'free':
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'full':
    case 'occupied':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// ------------------------------------------------------------
// Main Page Component (Client Component)
// ------------------------------------------------------------
export default function VolunteerPage() {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Get current user ID from localStorage
  const currentUserId = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}')?.user_id || '550e8400-e29b-41d4-a716-446655440000'
    : '550e8400-e29b-41d4-a716-446655440000'

  useEffect(() => {
    // Fetch volunteer data
    const fetchVolunteerData = async () => {
      try {
        const response = await fetch('/api/volunteer/data?userId=' + currentUserId)
        if (response.ok) {
          const data = await response.json()
          setScoreData(data.scoreData)
          setHistory(data.history.map((item: HistoryItemRaw) => ({
            ...item,
            time: new Date(item.time),
          })))
          setLeaderboard(data.leaderboard)
        }
      } catch (error) {
        console.error('Error fetching volunteer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVolunteerData()
  }, [currentUserId])

  // Handle form submission success - add new item to history and update score
  const handleSubmitSuccess = (newItem: HistoryItem) => {
    setHistory([newItem, ...history.slice(0, 4)])
    
    // Update score display
    if (scoreData) {
      setScoreData({
        ...scoreData,
        total_updates: scoreData.total_updates + 1,
        score: scoreData.score + newItem.points,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
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
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading volunteer data...</p>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
             <div className="flex items-center space-x-3">
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
                        </div>

            {/* Center Nav */}
            <div className="hidden md:flex space-x-4">
              <a href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Home
              </a>
              <a href="/lecture-halls" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Lecture Halls
              </a>
              <a href="/study-areas" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Study Areas
              </a>
              <a href="/Sunera/volunteer" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-600">
                Volunteer
              </a>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Panel</h1>
          <p className="text-gray-600">Help keep space information up-to-date</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submit Update Card - Using Client Component */}
            <VolunteerSubmitForm 
              volunteerId={currentUserId} 
              onSubmitSuccess={handleSubmitSuccess}
            />

            {/* Your Update History Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Update History</h2>
              <p className="text-sm text-gray-500 mt-1">Recent contributions</p>

              <div className="mt-4 space-y-3">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No updates yet.</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {item.type === 'hall' ? (
                            <Building2 className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <span className="text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                Math.floor((Date.now() - item.time.getTime()) / (1000 * 60)),
                                'minute'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          <span className="font-medium">+{item.points}</span>
                        </div>
                        <div className="text-xs text-gray-400">{item.confidence}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Your Score Card (Gradient) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Your Score</h2>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">{scoreData?.score || 0}</span>
                  <span className="ml-2 text-sm">points</span>
                </div>
                <p className="text-sm opacity-90">{scoreData?.total_updates || 0} total updates</p>
              </div>

              {/* Level Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Level Progress</span>
                  <span>Level 4</span>
                </div>
                <div className="w-full bg-blue-300 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs mt-1 opacity-80">52 points to Level 5</p>
              </div>

              {/* Weekly/Monthly */}
              <div className="mt-4 pt-4 border-t border-blue-400 flex justify-between text-sm">
                <div>
                  <p className="opacity-80">This Week</p>
                  <p className="font-semibold">+15 pts</p>
                </div>
                <div>
                  <p className="opacity-80">This Month</p>
                  <p className="font-semibold">+48 pts</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Top volunteers this month</p>
              <div className="space-y-3">
                {leaderboard.map(entry => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      entry.isCurrentUser ? 'border-2 border-blue-200 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          entry.rank === 1
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.rank === 2
                            ? 'bg-gray-100 text-gray-800'
                            : entry.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <span className="font-medium text-gray-900">{entry.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">{entry.updates} updates</span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 fill-current mr-1" />
                        <span className="font-medium">{entry.points}</span>
                      </div>
                      {entry.isCurrentUser && (
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievement Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Consistent Contributor</h3>
              <p className="text-sm text-gray-500 mt-1">You submitted 10 accurate updates this week.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
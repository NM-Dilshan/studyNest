import { prisma } from '@/lib/prisma'
import {
  Home,
  Bell,
  LogOut,
  Trophy,
  TrendingUp,
  Star,
  Building2,
  MapPin,
  Award,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface User {
  user_id: string
  name: string
  role: string
  reputation_score?: number
}

interface ScoreData {
  total_updates: number
  total_reviews: number
  average_rating: number
  accurate_count: number
  inaccurate_count: number
  score: number
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
const getStatusColor = (status: string) => {
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
// Main Page Component (Server Component)
// ------------------------------------------------------------
export default async function VolunteerPage() {
  // Mock user ID for demo (in real app, get from auth middleware)
  const currentUserId = '550e8400-e29b-41d4-a716-446655440000'

  let user: User | null = null
  let scoreData: ScoreData | null = null
  let history: HistoryItem[] = []
  let leaderboard: LeaderboardEntry[] = []

  try {
    // Fetch user data
    const userData = await prisma.users.findUnique({
      where: { user_id: currentUserId },
      select: {
        user_id: true,
        name: true,
        role: true,
      },
    })
    user = userData as User

    // Fetch volunteer scores
    const scores = await prisma.volunteer_scores.findUnique({
      where: { volunteer_id: currentUserId },
    })
    scoreData = scores || {
      total_updates: 0,
      total_reviews: 0,
      average_rating: 0,
      accurate_count: 0,
      inaccurate_count: 0,
      score: 0,
    }

    // Fetch recent hall updates
    const hallUpdates = await prisma.volunteer_hall_updates.findMany({
      where: { volunteer_id: currentUserId },
      select: {
        volunteer_hall_update_id: true,
        occupancy_level: true,
        confidence_level: true,
        created_at: true,
        lecture_halls: {
          select: { hall_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Fetch recent study area updates
    const areaUpdates = await prisma.volunteer_study_area_updates.findMany({
      where: { volunteer_id: currentUserId },
      select: {
        volunteer_study_area_update_id: true,
        crowd_status: true,
        confidence_level: true,
        created_at: true,
        study_areas: {
          select: { area_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Combine and sort history
    history = [
      ...hallUpdates.map((h: any) => ({
        id: h.volunteer_hall_update_id,
        type: 'hall' as const,
        name: h.lecture_halls?.hall_name || 'Unknown Hall',
        status: h.occupancy_level || 'Unknown',
        time: h.created_at,
        points: h.confidence_level === 'high' ? 5 : h.confidence_level === 'medium' ? 3 : 1,
        confidence: h.confidence_level || 'medium',
      })),
      ...areaUpdates.map((a: any) => ({
        id: a.volunteer_study_area_update_id,
        type: 'area' as const,
        name: a.study_areas?.area_name || 'Unknown Area',
        status: a.crowd_status,
        time: a.created_at,
        points: a.confidence_level === 'high' ? 5 : a.confidence_level === 'medium' ? 3 : 1,
        confidence: a.confidence_level || 'medium',
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5)

    // Fetch leaderboard
    const topVolunteers = await prisma.volunteer_scores.findMany({
      select: {
        volunteer_id: true,
        score: true,
        total_updates: true,
      },
      orderBy: { score: 'desc' },
      take: 5,
    })

    const volunteerIds = topVolunteers.map((v) => v.volunteer_id)
    const users = await prisma.users.findMany({
      where: { user_id: { in: volunteerIds } },
      select: { user_id: true, name: true },
    })

    leaderboard = topVolunteers.map((v, idx) => {
      const volunteerUser = users.find((u) => u.user_id === v.volunteer_id)
      return {
        rank: idx + 1,
        name: volunteerUser?.name || 'Anonymous',
        updates: v.total_updates || 0,
        points: v.score || 0,
        isCurrentUser: v.volunteer_id === currentUserId,
      }
    })
  } catch (error) {
    console.error('Error fetching volunteer data:', error)
  }

  // Since this is a server component, forms will use standard HTML submission
  // For now, we'll show a read-only view of the volunteer data

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudyNest</h1>
                <p className="text-xs text-gray-500">Campus Free Space Finder</p>
              </div>
            </div>

            {/* Center Nav */}
            <div className="hidden md:flex space-x-4">
              <a href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Home
              </a>
              <a href="/volunteer" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-600">
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
            {/* Submit Update Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Submit Space Update</h2>
              <p className="text-sm text-gray-500 mt-1">Report the current status of a lecture hall or study area</p>

              <form className="mt-6 space-y-5">
                {/* Row 1: Space Type + Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Space Type</label>
                    <select
                      name="spaceType"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="lecture-hall">Lecture Hall</option>
                      <option value="study-area">Study Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      name="location"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select location</option>
                      {/* We'd fetch real locations from DB; for now placeholder */}
                      <option value="hall-101">Hall A101</option>
                      <option value="hall-102">Hall B205</option>
                      <option value="area-library">Main Library</option>
                      <option value="area-room3">Study Room 3</option>
                    </select>
                  </div>
                </div>

                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['free', 'occupied', 'low crowd', 'medium crowd', 'high crowd', 'maintenance'].map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value={s} className="rounded" />
                        <span className="text-sm font-medium text-gray-700">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Confidence Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map(l => (
                      <label key={l} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="confidence" value={l} className="rounded" />
                        <span className="text-sm font-medium text-gray-700">{l.charAt(0).toUpperCase() + l.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    High confidence = +5 points, Medium = +3 points, Low = +1 point
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Submit Update
                </button>
              </form>
            </div>

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
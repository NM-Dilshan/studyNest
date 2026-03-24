'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, TrendingUp, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardStat {
  totalHalls: number
  hallsWithComplaints: number
  highPriorityHalls: number
  mediumPriorityHalls: number
  normalPriorityHalls: number
}

interface HallSummary {
  hall_id: string
  hall_name: string
  complaint_count: number
  priority: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStat | null>(null)
  const [hallSummary, setHallSummary] = useState<HallSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login/signIN')
      return
    }

    try {
      const user = JSON.parse(storedUser)
      if (user.role !== 'admin' && user.role !== 'volunteer') {
        router.push('/home')
        return
      }
    } catch {
      router.push('/login/signIN')
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/complaints/summary')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setHallSummary(data.data)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Get high and normal priority halls
  const highPriorityHalls = hallSummary.filter(h => h.priority === 'High')
  const normalPriorityHalls = hallSummary.filter(h => h.priority === 'Normal')
  const totalCritical = (stats?.highPriorityHalls || 0) + (stats?.normalPriorityHalls || 0)

  return (
    <div className="space-y-8">
      {/* Notification Alert Button */}
      {totalCritical > 0 && (
        <Link href="/admin/complaints">
          <button className="w-full relative overflow-hidden rounded-2xl border-2 border-red-400 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 p-6 hover:shadow-lg transition-all hover:scale-102 group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-200/20 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Content */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse" />
                  <AlertCircle className="text-red-600 relative" size={32} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-red-900">
                    🚨 {totalCritical} Hall{totalCritical > 1 ? 's' : ''} Need Attention
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {stats?.highPriorityHalls || 0} High Priority + {stats?.normalPriorityHalls || 0} Normal Priority
                  </p>
                </div>
              </div>
              <ArrowRight className="text-red-600 group-hover:translate-x-2 transition-transform" size={24} />
            </div>

            {/* Affected Halls */}
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-xs font-semibold text-red-700 mb-2">Affected Lecture Halls:</p>
              <div className="flex flex-wrap gap-2">
                {highPriorityHalls.map(hall => (
                  <span key={hall.hall_id} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">
                    🚨 {hall.hall_name}
                  </span>
                ))}
                {normalPriorityHalls.slice(0, 3).map(hall => (
                  <span key={hall.hall_id} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                    ✓ {hall.hall_name}
                  </span>
                ))}
                {normalPriorityHalls.length > 3 && (
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                    +{normalPriorityHalls.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </button>
        </Link>
      )}

      {/* Complaints Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={28} />
              Complaint Management System
            </h3>
            <p className="text-slate-600 mt-2">Monitor and manage student complaints</p>
          </div>
          <Link
            href="/admin/complaints"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg"
          >
            Go to Complaints <ArrowRight size={18} />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-600 font-medium mb-2">Total Halls</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.totalHalls || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-600 font-medium mb-2">Halls w/ Complaints</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.hallsWithComplaints || 0}</p>
          </div>
          <div className="bg-red-100 rounded-lg p-4 border border-red-300">
            <p className="text-sm text-red-700 font-medium mb-2">🚨 High Priority</p>
            <p className="text-3xl font-bold text-red-600">{stats?.highPriorityHalls || 0}</p>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 border border-orange-300">
            <p className="text-sm text-orange-700 font-medium mb-2">⚠️ Medium Priority</p>
            <p className="text-3xl font-bold text-orange-600">{stats?.mediumPriorityHalls || 0}</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
            <p className="text-sm text-green-700 font-medium mb-2">✓ Normal Priority</p>
            <p className="text-3xl font-bold text-green-600">{stats?.normalPriorityHalls || 0}</p>
          </div>
        </div>

        {/* High Priority Alert */}
        {(stats?.highPriorityHalls || 0) > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-red-900">
                {stats?.highPriorityHalls} Hall{(stats?.highPriorityHalls || 0) > 1 ? 's' : ''} Require Immediate Attention
              </p>
              <p className="text-sm text-red-700 mt-1">
                {hallSummary
                  .filter((h) => h.priority === 'High')
                  .map((h) => h.hall_name)
                  .join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hall Priority Summary */}
      {hallSummary.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-slate-900">Hall-wise Complaint Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hallSummary.slice(0, 6).map((hall) => (
              <div
                key={hall.hall_id}
                className={`rounded-xl p-4 border-2 ${
                  hall.priority === 'High'
                    ? 'bg-red-50 border-red-300'
                    : hall.priority === 'Medium'
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{hall.hall_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{hall.complaint_count} complaints</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      hall.priority === 'High'
                        ? 'bg-red-200 text-red-800'
                        : hall.priority === 'Medium'
                          ? 'bg-orange-200 text-orange-800'
                          : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {hall.priority === 'High' && '🚨 High'}
                    {hall.priority === 'Medium' && '⚠️ Medium'}
                    {hall.priority === 'Normal' && '✓ Normal'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hallSummary.length > 6 && (
            <Link
              href="/admin/complaints"
              className="inline-block text-blue-600 font-semibold hover:text-blue-700"
            >
              View all {hallSummary.length} halls →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * Admin Dashboard - Campus Complaint Management System
 *
 * Features:
 * - Complaint Heatmap by Location
 * - Recent Activity Timeline
 * - Response Time Analytics
 * - Complaint Trend Chart
 * - Top Issue Categories
 * - Urgent Complaints Widget
 * - Dashboard Statistics
 */

import { useMemo } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import DashboardCard from '@/components/dashboard/DashboardCard'
import ComplaintHeatmap from '@/components/dashboard/ComplaintHeatmap'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline'
import ResponseTimeAnalytics from '@/components/dashboard/ResponseTimeAnalytics'
import ComplaintTrendChart from '@/components/dashboard/ComplaintTrendChart'
import TopIssueCategories from '@/components/dashboard/TopIssueCategories'
import UrgentComplaintsWidget from '@/components/dashboard/UrgentComplaintsWidget'
import {
  mockComplaintLocations,
  mockActivityEvents,
  mockResponseTimeMetrics,
  mockComplaintTrends,
  mockIssueCategories,
  mockUrgentComplaints,
  mockDashboardStats,
} from '@/lib/mockDashboardData'
import {
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export default function EnhancedAdminDashboard() {
  // Calculate stats from mock data
  const stats = useMemo(() => mockDashboardStats, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Complaint Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage student complaints efficiently</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Generate Report
          </button>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Complaints"
            value={stats.totalComplaints}
            icon={<Ticket size={24} />}
            color="blue"
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard
            label="Pending"
            value={stats.pendingComplaints}
            icon={<Clock size={24} />}
            color="amber"
            trend={{ value: 8, isPositive: false }}
          />
          <StatCard
            label="Resolved"
            value={stats.resolvedComplaints}
            icon={<CheckCircle2 size={24} />}
            color="green"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            label="Avg Health Score"
            value={`${stats.healthScoreAverage}%`}
            icon={<AlertCircle size={24} />}
            color="purple"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Heatmap and Urgent */}
          <div className="lg:col-span-1 space-y-6">
            <ComplaintHeatmap locations={mockComplaintLocations} />
            <UrgentComplaintsWidget complaints={mockUrgentComplaints} />
          </div>

          {/* Middle Column - Activity and Response Time */}
          <div className="lg:col-span-1 space-y-6">
            <ActivityTimeline events={mockActivityEvents} />
            <ResponseTimeAnalytics metrics={mockResponseTimeMetrics} />
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-1 space-y-6">
            <ComplaintTrendChart trends={mockComplaintTrends} />
            <TopIssueCategories categories={mockIssueCategories} />
          </div>
        </div>

        {/* Additional Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
                → View All Complaints
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
                → Create New Report
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
                → Export Data
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">
                → Settings
              </button>
            </div>
          </DashboardCard>

          <DashboardCard title="Performance Metrics">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Response Rate</span>
                  <span className="text-lg font-bold text-green-600">92%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                  <span className="text-lg font-bold text-blue-600">72%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Satisfaction Rate</span>
                  <span className="text-lg font-bold text-purple-600">85%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="System Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Database</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Last Updated</span>
                <span className="text-xs font-medium text-gray-600">2 minutes ago</span>
              </div>
              <button className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Health Details →
              </button>
            </div>
          </DashboardCard>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <p className="text-sm text-gray-600">
            Last synchronized: {new Date().toLocaleTimeString()} • Auto-refresh enabled
          </p>
        </div>
      </div>
    </div>
  )
}

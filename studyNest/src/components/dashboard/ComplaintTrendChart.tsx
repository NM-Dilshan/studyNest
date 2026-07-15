'use client'

// Complaint Trend Chart - Shows complaints over time

import DashboardCard from './DashboardCard'
import { ComplaintTrend } from '@/types/dashboard'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ComplaintTrendChartProps {
  trends: ComplaintTrend[]
}

export default function ComplaintTrendChart({ trends }: ComplaintTrendChartProps) {
  return (
    <DashboardCard
      title="Complaint Trend"
      description="Daily complaint submissions and resolutions"
    >
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trends}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Total Submitted" radius={[8, 8, 0, 0]} />
            <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total This Week</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {trends.reduce((sum, t) => sum + t.count, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg Per Day</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(trends.reduce((sum, t) => sum + t.count, 0) / trends.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Resolution Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Math.round(
              (trends.reduce((sum, t) => sum + t.resolved, 0) /
                trends.reduce((sum, t) => sum + t.count, 0)) *
                100
            )}
            %
          </p>
        </div>
      </div>
    </DashboardCard>
  )
}

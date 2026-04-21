'use client'

// Response Time Analytics component

import DashboardCard from './DashboardCard'
import StatCard from './StatCard'
import { ResponseTimeMetric } from '@/types/dashboard'
import { Zap } from 'lucide-react'

interface ResponseTimeAnalyticsProps {
  metrics: ResponseTimeMetric[]
}

export default function ResponseTimeAnalytics({
  metrics,
}: ResponseTimeAnalyticsProps) {
  return (
    <DashboardCard
      title="Response Time Analytics"
      description="Average time to handle complaints"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">{metric.metricName}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {metric.averageTime}{metric.unit}
                </p>
              </div>
              <Zap size={24} className="text-blue-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Additional insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Average viewing time is improving (2.5 hours)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">!</span>
            <span>Resolution time is 48.7 hours - aim for 24-48 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>85% of complaints are being resolved successfully</span>
          </li>
        </ul>
      </div>
    </DashboardCard>
  )
}

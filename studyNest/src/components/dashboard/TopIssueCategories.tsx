'use client'

// Top Issue Categories component - Shows most common complaint types

import DashboardCard from './DashboardCard'
import { IssueCategory } from '@/types/dashboard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface TopIssueCategoriesProps {
  categories: IssueCategory[]
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

export default function TopIssueCategories({ categories }: TopIssueCategoriesProps) {
  // Sort by count descending
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count)

  return (
    <DashboardCard
      title="Top Issue Categories"
      description="Most common complaint types"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const payload = props.payload as IssueCategory | undefined
                  if (!payload) return ''
                  return `${payload.category} ${payload.percentage}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} complaints`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {sortedCategories.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="font-medium text-gray-700">{category.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {category.percentage}%
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  ({category.count})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total count */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total Complaints Analyzed:{' '}
          <span className="font-bold text-gray-900">
            {sortedCategories.reduce((sum, c) => sum + c.count, 0)}
          </span>
        </p>
      </div>
    </DashboardCard>
  )
}

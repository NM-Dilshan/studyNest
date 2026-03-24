'use client'

/**
 * Admin: Conflict Manager
 * Admins can mark halls as under maintenance, reserved, etc.
 */

import { useState, useEffect } from 'react'
import { getLectureHalls, updateHall } from '@/services/hallService'
import { getConflictedHalls } from '@/services/conflictService'
import { LectureHall } from '@/types/halls'

export default function ConflictManager() {
  const [allHalls, setAllHalls] = useState<LectureHall[]>([])
  const [conflictedHalls, setConflictedHalls] = useState<LectureHall[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allData, conflictData] = await Promise.all([getLectureHalls(), getConflictedHalls() as any])
      setAllHalls(allData)
      // Convert conflictData to full LectureHall objects
      const conflicted = allData.filter((h) => (conflictData as any[]).some((c: any) => c.hall_id === h.hall_id))
      setConflictedHalls(conflicted)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (hallId: string, newStatus: string, severity: string) => {
    try {
      await updateHall(hallId, {
        maintenance_status: newStatus as any,
        conflict_severity: severity as any,
      })
      await loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    available: { label: '✓ Available', color: 'bg-green-100 text-green-900' },
    under_maintenance: { label: '⚙️ Under Maintenance', color: 'bg-amber-100 text-amber-900' },
    reserved_exam: { label: '📝 Reserved for Exam', color: 'bg-red-100 text-red-900' },
    reserved_event: { label: '🎤 Reserved for Event', color: 'bg-blue-100 text-blue-900' },
    closed: { label: '🚫 Closed', color: 'bg-slate-200 text-slate-900' },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Conflict Manager</h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Active conflicts */}
            <div className="bg-white rounded-lg p-6 border border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Conflicts ({conflictedHalls.length})</h2>
              {conflictedHalls.length === 0 ? (
                <p className="text-gray-600">No active conflicts.</p>
              ) : (
                <div className="space-y-3">
                  {conflictedHalls.map((hall) => (
                    <div key={hall.hall_id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{hall.hall_name}</p>
                        <p className="text-sm text-gray-600">
                          📍 {hall.building}, Floor {hall.floor}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[hall.maintenance_status || 'available'].color}`}>
                          {statusConfig[hall.maintenance_status || 'available'].label}
                        </span>
                        <select
                          value={hall.maintenance_status || 'available'}
                          onChange={(e) => handleStatusChange(hall.hall_id, e.target.value, hall.conflict_severity || 'warning')}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="under_maintenance">Under Maintenance</option>
                          <option value="reserved_exam">Reserved for Exam</option>
                          <option value="reserved_event">Reserved for Event</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All halls status */}
            <div className="bg-white rounded-lg p-6 border border-gray-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Halls</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left font-medium">Hall Name</th>
                      <th className="px-4 py-2 text-left font-medium">Building</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Severity</th>
                      <th className="px-4 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allHalls.map((hall) => (
                      <tr key={hall.hall_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{hall.hall_name}</td>
                        <td className="px-4 py-2">{hall.building}</td>
                        <td className="px-4 py-2">
                          <select
                            value={hall.maintenance_status || 'available'}
                            onChange={(e) => handleStatusChange(hall.hall_id, e.target.value, hall.conflict_severity || 'warning')}
                            className="px-2 py-1 border border-gray-300 rounded text-xs w-full"
                          >
                            <option value="available">Available</option>
                            <option value="under_maintenance">Under Maintenance</option>
                            <option value="reserved_exam">Reserved for Exam</option>
                            <option value="reserved_event">Reserved for Event</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={hall.conflict_severity || 'warning'}
                            onChange={(e) => handleStatusChange(hall.hall_id, hall.maintenance_status || 'available', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs w-full"
                          >
                            <option value="warning">⚠️ Warning</option>
                            <option value="blocked">🚫 Blocked</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          {hall.maintenance_status !== 'available' && (
                            <button
                              onClick={() => handleStatusChange(hall.hall_id, 'available', 'warning')}
                              className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                            >
                              Clear
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearch } from '@/contexts/SearchContext'
import { Wifi, PlugZap, VolumeX, Wind, Plus, Trash2, Edit2, AlertCircle, Users } from 'lucide-react'

const StudyAreaCardMapPreview = dynamic(
  () => import('@/components/admin/StudyAreaCardMapPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 w-full bg-gray-100 text-gray-500 text-sm flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
)

export default function StudyAreaListPage() {
  const { searchValue } = useSearch()
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/study-areas')
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch study areas'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        setError(errorMessage)
        return
      }

      const data = await response.json()
      setAreas(data.areas || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (crowdStatus: string) => {
    switch (crowdStatus) {
      case 'Low Crowd':
        return { bg: 'bg-green-500', text: 'text-green-700', label: '✓ Low Crowd' }
      case 'Medium Crowd':
        return { bg: 'bg-yellow-500', text: 'text-yellow-700', label: '⚠ Medium Crowd' }
      case 'High Crowd':
        return { bg: 'bg-red-500', text: 'text-red-700', label: '✕ High Crowd' }
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-700', label: 'Unknown' }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/study-areas/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let errorMessage = 'Failed to delete study area'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        setError(errorMessage)
        return
      }

      setAreas(areas.filter(area => area.study_area_id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  // Filter areas based on search value from header
  const filteredAreas = areas.filter((area) => {
    const searchLower = searchValue.toLowerCase()
    return (
      area.area_name.toLowerCase().includes(searchLower) ||
      (area.building && area.building.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Study Areas</h2>
            <p className="text-gray-600 mt-2">Manage study areas with real-time occupancy analysis</p>
          </div>
          <Link
            href="/admin/study-area/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Study Area
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading study areas...</p>
            </div>
          </div>
        ) : areas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No study areas found</p>
            <Link
              href="/admin/study-area/add"
              className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              Create the first study area
            </Link>
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No results found for "{searchValue}"</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area) => {
              const occupancy = area.area_occupancy
              const currentCount = occupancy?.current_count || 0
              const occupancyPercent = occupancy?.occupancy_percentage || 0
              const crowdStatus = occupancy?.crowd_status || 'Low Crowd'
              const availableSeats = occupancy?.available_seats || 0
              const statusColor = getStatusColor(crowdStatus)

              return (
                <div
                  key={area.study_area_id}
                  className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* Card Header with Title and Crowd Status */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {area.area_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {area.building}
                          {area.floor && ` • Floor ${area.floor}`}
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColor.text} bg-opacity-20`}>
                        {statusColor.label}
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {currentCount} / {area.capacity}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{occupancyPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${statusColor.bg}`}
                          style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Map Preview */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      {typeof area.latitude === 'number' && typeof area.longitude === 'number' ? (
                        <StudyAreaCardMapPreview
                          latitude={area.latitude}
                          longitude={area.longitude}
                          radiusMeters={area.radius_meters || 20}
                          title={area.area_name}
                        />
                      ) : (
                        <div className="h-36 w-full bg-gray-100 text-gray-500 text-sm flex items-center justify-center">
                          Map location not available
                        </div>
                      )}
                    </div>

                    {/* Available Seats */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Available Seats</p>
                      <p className="text-2xl font-bold text-green-600">{availableSeats}</p>
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500">
                      Last updated: {occupancy?.updated_at ? new Date(occupancy.updated_at).toLocaleTimeString() : 'Never'}
                    </div>

                    {/* Facilities */}
                    <div className="flex flex-wrap gap-2">
                      {area.wifi && (
                        <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Wifi size={12} /> WiFi
                        </span>
                      )}
                      {area.charging_ports && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <PlugZap size={12} /> Charging
                        </span>
                      )}
                      {area.silent_zone && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <VolumeX size={12} /> Quiet
                        </span>
                      )}
                      {area.ac && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Wind size={12} /> AC
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <Link
                      href={`/admin/study-area/${area.study_area_id}/edit`}
                      className="flex-1 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-2 rounded transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(area.study_area_id)}
                      className="flex-1 text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1 py-2 rounded transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Study Area?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this study area? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition disabled:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

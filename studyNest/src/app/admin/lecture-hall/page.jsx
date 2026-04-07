'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearch } from '@/contexts/SearchContext'
import { HighlightText } from '@/components/HighlightText'

export default function LectureHallListPage() {
  const { searchValue } = useSearch()
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchHalls()
  }, [])

  const fetchHalls = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lecture-halls')
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch lecture halls'
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
      setHalls(data.halls || [])
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/lecture-halls/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let errorMessage = 'Failed to delete lecture hall'
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
      setHalls(halls.filter(hall => hall.hall_id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'under_maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'reserved_exam':
        return 'bg-blue-100 text-blue-800'
      case 'reserved_event':
        return 'bg-purple-100 text-purple-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return '✓ Available'
      case 'under_maintenance':
        return '🔧 Under Maintenance'
      case 'reserved_exam':
        return '📝 Reserved - Exam'
      case 'reserved_event':
        return '🎉 Reserved - Event'
      case 'closed':
        return '✕ Closed'
      default:
        return status
    }
  }

  // Filter halls based on search value from header
  const filteredHalls = halls.filter((hall) => {
    const searchLower = searchValue.toLowerCase()
    return (
      hall.hall_name.toLowerCase().includes(searchLower) ||
      (hall.building && hall.building.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lecture Halls</h2>
            <p className="text-gray-600 mt-2">Manage all lecture halls on campus</p>
          </div>
          <Link
            href="/admin/lecture-hall/add"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            + Add Lecture Hall
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Loading lecture halls...</p>
            </div>
          </div>
        ) : halls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No lecture halls found</p>
            <Link
              href="/admin/lecture-hall/add"
              className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
            >
              Create the first lecture hall
            </Link>
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No results found for "{searchValue}"</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hall Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Building</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Floor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHalls.map((hall) => (
                    <tr key={hall.hall_id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <HighlightText text={hall.hall_name} searchTerm={searchValue} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <HighlightText text={hall.building || '-'} searchTerm={searchValue} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hall.floor || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hall.capacity || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {hall.hall_type === 'lecture_hall' ? 'Lecture Hall' : 'Lab'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hall.maintenance_status)}`}>
                          {getStatusBadge(hall.maintenance_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 flex-wrap">
                          {hall.projector && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Projector</span>}
                          {hall.wifi && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">WiFi</span>}
                          {hall.ac && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">AC</span>}
                          {hall.whiteboard && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Whiteboard</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/lecture-hall/${hall.hall_id}/edit`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(hall.hall_id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Lecture Hall?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lecture hall? This action cannot be undone.
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

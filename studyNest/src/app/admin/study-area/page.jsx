'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearch } from '@/contexts/SearchContext'
import { HighlightText } from '@/components/HighlightText'

export default function StudyAreaListPage() {
  const { searchValue } = useSearch()
  const [studyAreas, setStudyAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Helper function to escape HTML special characters including quotes
  const escapeHtml = (text) => {
    if (!text) return text
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  useEffect(() => {
    fetchStudyAreas()
  }, [])

  const fetchStudyAreas = async () => {
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
      setStudyAreas(data.data || [])
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
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

      const data = await response.json()
      setStudyAreas(studyAreas.filter(area => area.study_area_id !== id))
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
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
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
      case 'maintenance':
        return '🔧 Maintenance'
      case 'closed':
        return '✕ Closed'
      default:
        return status
    }
  }

  // Filter study areas based on search value from header
  const filteredAreas = studyAreas.filter((area) => {
    const searchLower = searchValue.toLowerCase()
    return (
      area.area_name.toLowerCase().includes(searchLower) ||
      (area.building && area.building.toLowerCase().includes(searchLower))
    )
  })

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue])

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Study Areas</h2>
            <p className="text-gray-600 mt-2">Manage all study areas on campus</p>
          </div>
          <Link
            href="/admin/study-area/add"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            + Add Study Area
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
              <p className="text-gray-600 mt-4">Loading study areas...</p>
            </div>
          </div>
        ) : studyAreas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No study areas found</p>
            <Link
              href="/admin/study-area/add"
              className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
            >
              Create the first study area
            </Link>
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No results found for &quot;{escapeHtml(searchValue)}&quot;</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Area Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Building</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Floor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreas.map((area) => (
                    <tr key={area.study_area_id} className="border-b hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <HighlightText text={area.area_name} searchTerm={searchValue} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <HighlightText text={area.building || '-'} searchTerm={searchValue} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{area.floor || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{area.capacity || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(area.area_status)}`}>
                          {getStatusBadge(area.area_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 flex-wrap">
                          {area.wifi && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">WiFi</span>}
                          {area.ac && <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">AC</span>}
                          {area.charging_ports && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Charging</span>}
                          {area.silent_zone && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Silent</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/study-area/${area.study_area_id}/edit`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(area.study_area_id)}
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

            {/* Pagination Controls */}
            {filteredAreas.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredAreas.length)}</span> of <span className="font-medium">{filteredAreas.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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

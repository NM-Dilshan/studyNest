'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useSearch } from '@/contexts/SearchContext'
import { HighlightText } from '@/components/HighlightText'

export default function StudyAreaListPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const { searchValue } = useSearch()
  const [studyAreas, setStudyAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Static/Mock data for frontend testing
  const mockStudyAreas = [
    {
      study_area_id: '31cc9857-c8a2-4435-9045-cfd47f536fcf',
      area_name: 'Library Zone A',
      building: 'Main Building',
      floor: 0,
      capacity: 50,
      latitude: 40.7128,
      longitude: -74.0060,
      radius_meters: 20,
      area_status: 'available',
      wifi: true,
      charging_ports: true,
      silent_zone: false,
      ac: true,
      is_active: true,
      created_at: new Date('2025-03-25'),
    },
    {
      study_area_id: 'ebdae015-757d-4ea5-9d8f-bf64fb1443f6',
      area_name: 'Study Lounge B',
      building: 'Academic Block',
      floor: 2,
      capacity: 80,
      latitude: 40.7138,
      longitude: -74.0070,
      radius_meters: 25,
      area_status: 'low_crowd',
      wifi: true,
      charging_ports: true,
      silent_zone: true,
      ac: true,
      is_active: true,
      created_at: new Date('2025-03-25'),
    },
    {
      study_area_id: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
      area_name: 'Reading Corner C',
      building: 'Science Block',
      floor: 1,
      capacity: 30,
      latitude: 40.7148,
      longitude: -74.0050,
      radius_meters: 15,
      area_status: 'medium_crowd',
      wifi: true,
      charging_ports: false,
      silent_zone: true,
      ac: false,
      is_active: true,
      created_at: new Date('2025-03-24'),
    },
  ]

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
<<<<<<< HEAD
    // Initialize user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
    setIsHydrated(true)
  }, [])

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('user')
    router.push('/login/signIN')
  }

  useEffect(() => {
    if (isHydrated) {
      fetchStudyAreas()
    }
  }, [isHydrated])

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
=======
    // Use mock data instead of fetching from API
    setStudyAreas(mockStudyAreas)
    setLoading(false)
  }, [])

>>>>>>> bc5bb4dc82db9d055375b41f02e7c8fa78f65cd0

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      // For static data, just remove from state
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header currentPage="home" />

      {/* Main Content */}
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
                  {filteredAreas.map((area) => (
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

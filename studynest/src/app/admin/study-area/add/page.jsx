'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddStudyAreaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    area_name: '',
    building: '',
    floor: '',
    capacity: '',
    wifi: false,
    charging_ports: false,
    silent_zone: false,
    ac: false,
    area_status: 'available',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (!formData.area_name.trim()) {
      setError('Area name is required')
      return
    }

    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      setError('Capacity must be a number')
      return
    }

    if (formData.floor && isNaN(parseInt(formData.floor))) {
      setError('Floor must be a number')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/study-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          floor: formData.floor ? parseInt(formData.floor) : null,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create study area'
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
      setMessage('Study area created successfully!')
      setTimeout(() => {
        router.push('/admin/study-area')
      }, 1500)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">StudyNest Admin</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/admin/study-area" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          ← Back to Study Areas
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Add New Study Area</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Area Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Name *
              </label>
              <input
                type="text"
                name="area_name"
                value={formData.area_name}
                onChange={handleChange}
                placeholder="e.g., Library Zone A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Building & Floor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g., Building A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Capacity & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="area_status"
                  value={formData.area_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="closed">Closed</option>
                  <option value="crowded">Crowded</option>
                </select>
              </div>
            </div>

            {/* Features Checkboxes */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">WiFi Available</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="charging_ports"
                    checked={formData.charging_ports}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Charging Ports</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="silent_zone"
                    checked={formData.silent_zone}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Silent Zone</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ac"
                    checked={formData.ac}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Air Conditioning</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Creating...' : 'Create Study Area'}
              </button>
              <Link
                href="/admin/study-area"
                className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

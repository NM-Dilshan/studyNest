'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddLectureHallPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    hall_name: '',
    building: '',
    block: '',
    floor: '',
    hall_number: '',
    capacity: '',
    hall_type: 'lecture_hall',
    projector: false,
    wifi: false,
    ac: false,
    whiteboard: false,
    maintenance_status: 'available',
  })

  // Building configuration
  const buildings = {
    'New Building': {
      blocks: ['G', 'F'],
      floors: Array.from({ length: 14 }, (_, i) => i + 1), // 1-14
    },
    'Main Building': {
      blocks: ['A', 'B'],
      floors: ['B', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    let updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    }

    // Reset dependent fields when building changes
    if (name === 'building') {
      updatedData.block = ''
      updatedData.floor = ''
      updatedData.hall_number = ''
      updatedData.hall_name = ''
    }

    // Auto-generate hall_name when block, floor, or hall_number changes
    if (name === 'block' || name === 'floor' || name === 'hall_number') {
      if (updatedData.block && updatedData.floor && updatedData.hall_number) {
        const floorStr = String(updatedData.floor).padStart(2, '0')
        const hallNumStr = String(updatedData.hall_number).padStart(2, '0')
        updatedData.hall_name = `${updatedData.block}${floorStr}${hallNumStr}`
      } else {
        updatedData.hall_name = ''
      }
    }

    setFormData(updatedData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (!formData.building.trim()) {
      setError('Building is required')
      return
    }

    if (!formData.block.trim()) {
      setError('Block is required')
      return
    }

    if (!formData.floor) {
      setError('Floor is required')
      return
    }

    if (!formData.hall_number.trim()) {
      setError('Hall number is required')
      return
    }

    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      setError('Capacity must be a number')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/lecture-halls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          floor: isNaN(formData.floor) ? formData.floor : parseInt(formData.floor),
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create lecture hall'
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
      setMessage('Lecture hall created successfully!')
      setTimeout(() => {
        router.push('/admin/lecture-hall')
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
        <Link href="/admin/lecture-hall" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          ← Back to Lecture Halls
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Add New Lecture Hall</h2>

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
            {/* Building Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building *
              </label>
              <select
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Select Building --</option>
                <option value="New Building">New Building</option>
                <option value="Main Building">Main Building</option>
              </select>
            </div>

            {/* Block & Floor Selection */}
            {formData.building && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block *
                  </label>
                  <select
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Select Block --</option>
                    {buildings[formData.building]?.blocks.map(block => (
                      <option key={block} value={block}>{block}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor *
                  </label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Select Floor --</option>
                    {buildings[formData.building]?.floors.map(floor => (
                      <option key={floor} value={floor}>{floor}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Hall Name (Auto-generated) & Hall Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hall Name (Block + Floor + Number)
                </label>
                <input
                  type="text"
                  name="hall_name"
                  value={formData.hall_name}
                  readOnly
                  placeholder="e.g., G0505"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hall Number (will be padded to 2 digits) *
                </label>
                <input
                  type="text"
                  name="hall_number"
                  value={formData.hall_number}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Capacity & Hall Type */}
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
                  placeholder="e.g., 100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hall Type
                </label>
                <select
                  name="hall_type"
                  value={formData.hall_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
            </div>

            {/* Maintenance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Status
              </label>
              <select
                name="maintenance_status"
                value={formData.maintenance_status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="reserved_exam">Reserved - Exam</option>
                <option value="reserved_event">Reserved - Event</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Features Checkboxes */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="projector"
                    checked={formData.projector}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Projector Available</span>
                </label>

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
                    name="ac"
                    checked={formData.ac}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Air Conditioning</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="whiteboard"
                    checked={formData.whiteboard}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Whiteboard Available</span>
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
                {loading ? 'Creating...' : '+ Add Lecture Hall'}
              </button>
              <Link
                href="/admin/lecture-hall"
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

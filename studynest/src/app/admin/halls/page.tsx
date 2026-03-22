'use client'

/**
 * Admin: Hall Manager
 * Admins can view, create, edit, and soft-delete lecture halls
 */

import { useState, useEffect } from 'react'
import { getLectureHalls, createHall, updateHall, softDeleteHall } from '@/services/hallService'
import { LectureHall } from '@/types/halls'

export default function HallManager() {
  const [halls, setHalls] = useState<LectureHall[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    hall_name: '',
    building: '',
    floor: 0,
    capacity: 50,
    hall_type: 'lecture_hall',
    projector: false,
    wifi: true,
    ac: true,
    whiteboard: true,
    wheelchair_accessible: false,
    power_sockets: false,
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    loadHalls()
  }, [])

  const loadHalls = async () => {
    try {
      setLoading(true)
      const data = await getLectureHalls()
      setHalls(data)
    } catch (error) {
      console.error('Failed to load halls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateHall(editingId, formData as any)
      } else {
        await createHall(formData as any)
      }
      resetForm()
      await loadHalls()
    } catch (error) {
      console.error('Failed to save hall:', error)
    }
  }

  const handleDelete = async (hallId: string) => {
    if (confirm('Deactivate this hall?')) {
      try {
        await softDeleteHall(hallId)
        await loadHalls()
      } catch (error) {
        console.error('Failed to delete hall:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      hall_name: '',
      building: '',
      floor: 0,
      capacity: 50,
      hall_type: 'lecture_hall',
      projector: false,
      wifi: true,
      ac: true,
      whiteboard: true,
      wheelchair_accessible: false,
      power_sockets: false,
      latitude: 0,
      longitude: 0,
    })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hall Manager</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            {showForm ? '✕ Cancel' : '+ Add Hall'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Hall Name"
                  value={formData.hall_name}
                  onChange={(e) => setFormData({ ...formData, hall_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Building"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  step="0.000001"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  step="0.000001"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['projector', 'wifi', 'ac', 'whiteboard', 'wheelchair_accessible', 'power_sockets'].map((fac) => (
                  <label key={fac} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[fac as keyof typeof formData] as any}
                      onChange={(e) => setFormData({ ...formData, [fac]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">{fac}</span>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600">
                Save Hall
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : halls.length === 0 ? (
          <p className="text-gray-600">No halls found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map((hall) => (
              <div key={hall.hall_id} className="bg-white rounded-lg p-4 border border-gray-300 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg text-gray-900">{hall.hall_name}</h3>
                <p className="text-sm text-gray-600">
                  📍 {hall.building}, Floor {hall.floor}
                </p>
                <p className="text-sm text-gray-600">👥 Capacity: {hall.capacity}</p>
                <div className="flex flex-wrap gap-1 my-2">
                  {hall.projector && <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded">Projector</span>}
                  {hall.wifi && <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded">WiFi</span>}
                  {hall.ac && <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded">AC</span>}
                </div>
                <button
                  onClick={() => handleDelete(hall.hall_id)}
                  className="mt-3 w-full text-red-600 hover:text-red-900 font-medium text-sm py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

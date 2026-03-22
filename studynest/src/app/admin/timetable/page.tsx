'use client'

/**
 * Admin: Timetable Manager
 * Admins can view, edit, and delete timetable slots
 */

import { useState, useEffect } from 'react'
import { getTimetableSlots, createTimetableSlot, updateTimetableSlot, deleteTimetableSlot } from '@/services/timetableService'
import { TimetableSlot } from '@/types/halls'

export default function TimetableManager() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Placeholder form data
  const [formData, setFormData] = useState({
    hall_id: '',
    day_of_week: 'Monday' as any,
    start_time: '08:00',
    end_time: '09:00',
    subject_code: '',
    subject_name: '',
    group_name: '',
    lecturer_name: '',
  })

  useEffect(() => {
    loadSlots()
  }, [])

  const loadSlots = async () => {
    try {
      setLoading(true)
      const data = await getTimetableSlots()
      setSlots(data)
    } catch (error) {
      console.error('Failed to load timetable:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateTimetableSlot(editingId, formData)
      } else {
        await createTimetableSlot(formData as any)
      }
      setFormData({
        hall_id: '',
        day_of_week: 'Monday',
        start_time: '08:00',
        end_time: '09:00',
        subject_code: '',
        subject_name: '',
        group_name: '',
        lecturer_name: '',
      })
      setShowForm(false)
      setEditingId(null)
      await loadSlots()
    } catch (error) {
      console.error('Failed to save timetable slot:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this timetable slot?')) {
      try {
        await deleteTimetableSlot(id)
        await loadSlots()
      } catch (error) {
        console.error('Failed to delete slot:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Timetable Manager</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            {showForm ? '✕ Cancel' : '+ Add Slot'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Hall ID"
                  value={formData.hall_id}
                  onChange={(e) => setFormData({ ...formData, hall_id: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Lecturer Name"
                  value={formData.lecturer_name}
                  onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600">
                Save Slot
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-600">No timetable slots found.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Hall</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Day</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {slots.map((slot) => (
                  <tr key={slot.timetable_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{slot.hall_id}</td>
                    <td className="px-6 py-3 text-sm">{slot.day_of_week}</td>
                    <td className="px-6 py-3 text-sm">
                      {slot.start_time} – {slot.end_time}
                    </td>
                    <td className="px-6 py-3 text-sm">{slot.subject_name}</td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleDelete(slot.timetable_id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

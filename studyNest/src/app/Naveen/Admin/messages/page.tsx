'use client'

import { FormEvent, useEffect, useState } from 'react'
import { BellRing, Pencil, Trash2 } from 'lucide-react'

type AdminMessage = {
  message_id: number
  title: string
  message: string
  scheduled_at: string
  expires_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

type MessageForm = {
  title: string
  message: string
  scheduledAt: string
  expiresAt: string
  isActive: boolean
  createdBy: string
}

const toDatetimeLocalValue = (isoValue: string | null | undefined) => {
  if (!isoValue) return ''
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

const initialForm = (): MessageForm => ({
  title: '',
  message: '',
  scheduledAt: toDatetimeLocalValue(new Date().toISOString()),
  expiresAt: '',
  isActive: true,
  createdBy: 'Admin',
})

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [form, setForm] = useState<MessageForm>(initialForm())
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState<AdminMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/messages?includeInactive=true')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load messages')
      }

      setMessages(Array.isArray(data.messages) ? data.messages : [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const resetForm = () => {
    setForm(initialForm())
    setEditingMessageId(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required')
      return
    }

    if (form.expiresAt && new Date(form.expiresAt) <= new Date(form.scheduledAt)) {
      setError('Expire time must be after scheduled time')
      return
    }

    try {
      setSaving(true)
      const endpoint = editingMessageId
        ? `/api/admin/messages/${editingMessageId}`
        : '/api/admin/messages'

      const method = editingMessageId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          isActive: form.isActive,
          createdBy: form.createdBy,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save message')
      }

      setSuccess(editingMessageId ? 'Message updated successfully' : 'Message created successfully')
      resetForm()
      await loadMessages()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save message')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (message: AdminMessage) => {
    setError(null)
    setSuccess(null)
    setEditingMessageId(message.message_id)
    setForm({
      title: message.title,
      message: message.message,
      scheduledAt: toDatetimeLocalValue(message.scheduled_at),
      expiresAt: toDatetimeLocalValue(message.expires_at),
      isActive: message.is_active,
      createdBy: message.created_by || 'Admin',
    })
  }

  const handleDelete = async (messageId: number) => {
    setError(null)
    setSuccess(null)

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete message')
      }

      setSuccess('Message deleted successfully')
      if (editingMessageId === messageId) {
        resetForm()
      }
      setPendingDeleteMessage(null)
      await loadMessages()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete message')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Broadcast Messages</h1>
              <p className="text-sm text-gray-600">
                Schedule, edit, and remove messages shown to all students.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Exam week reminder"
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display From</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write the full message that should appear on student home page."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hide After (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <input
                  type="text"
                  value={form.createdBy}
                  onChange={(event) => setForm((prev) => ({ ...prev, createdBy: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin name"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingMessageId ? 'Update Message' : 'Publish Message'}
              </button>

              {editingMessageId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Broadcast Messages</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">No messages yet. Create your first broadcast message.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Display Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((message) => (
                    <tr key={message.message_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-semibold text-gray-900">{message.title}</p>
                        <p className="text-sm text-gray-600 mt-1 max-w-xl line-clamp-2">{message.message}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-top">
                        <p>{new Date(message.scheduled_at).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.expires_at
                            ? `Hides: ${new Date(message.expires_at).toLocaleString()}`
                            : 'No expiry'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            message.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {message.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(message)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteMessage(message)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {pendingDeleteMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Message?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete
              <span className="font-semibold text-gray-900"> {pendingDeleteMessage.title}</span>.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPendingDeleteMessage(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(pendingDeleteMessage.message_id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

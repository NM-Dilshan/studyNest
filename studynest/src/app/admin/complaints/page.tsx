'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Clock, Eye, Filter, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Complaint {
  complaint_id: number
  student_id: string
  hall_id: string
  issue_category: string
  description: string
  status: string
  created_at: string
  lecture_halls?: {
    hall_name: string
  }
  users?: {
    name: string
  }
  complaint_count?: number
  priority?: string
}

interface HallSummary {
  hall_id: string
  hall_name: string
  complaint_count: number
  priority: string
}

const statusColors: { [key: string]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Viewed': 'bg-blue-100 text-blue-800 border-blue-300',
  'In Progress': 'bg-orange-100 text-orange-800 border-orange-300',
  'Resolved': 'bg-green-100 text-green-800 border-green-300',
}

const priorityColors: { [key: string]: string } = {
  'Normal': 'bg-green-100 text-green-800',
  'Medium': 'bg-orange-100 text-orange-800',
  'High': 'bg-red-100 text-red-800',
}

const statusIcons: { [key: string]: React.ReactNode } = {
  'Pending': <Clock size={16} />,
  'Viewed': <Eye size={16} />,
  'In Progress': <TrendingUp size={16} />,
  'Resolved': <CheckCircle size={16} />,
}

export default function AdminComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [hallSummary, setHallSummary] = useState<HallSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hallFilter, setHallFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'complaints' | 'summary'>('complaints')

  useEffect(() => {
    // Load admin complaints directly without authentication block
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [complaintsRes, summaryRes] = await Promise.all([
        fetch('/api/admin/complaints'),
        fetch('/api/admin/complaints/summary'),
      ])

      if (complaintsRes.ok) {
        const data = await complaintsRes.json()
        if (data.success) {
          setComplaints(data.data)
        }
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        if (data.success) {
          setHallSummary(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (complaintId: number, newStatus: string) => {
    try {
      setUpdating(complaintId)
      const response = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        setComplaints(complaints.map(c =>
          c.complaint_id === complaintId ? { ...c, status: newStatus } : c
        ))
      } else {
        alert('Error updating status: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error updating complaint:', err)
      alert('Error updating complaint status')
    } finally {
      setUpdating(null)
    }
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.complaint_id?.toString().includes(searchQuery.toLowerCase()) ||
      complaint.issue_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.lecture_halls?.hall_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesHall = !hallFilter || complaint.hall_id === hallFilter

    return matchesSearch && matchesStatus && matchesHall
  })

  const getPriority = (complaintCount: number): string => {
    if (complaintCount > 10) return 'High'
    if (complaintCount > 6) return 'Medium'
    if (complaintCount > 3) return 'Normal'
    return 'Normal'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Complaint Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and resolve student complaints</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'complaints'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <TrendingUp size={18} />
            Hall Summary
          </button>
        </div>

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by ID, category, student, hall..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Viewed">Viewed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Hall Filter */}
                <select
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white cursor-pointer"
                >
                  <option value="">All Halls</option>
                  {hallSummary.map(hall => (
                    <option key={hall.hall_id} value={hall.hall_id}>
                      {hall.hall_name} ({hall.complaint_count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 font-medium mb-1">Total Complaints</p>
                <p className="text-3xl font-bold text-slate-900">{complaints.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {complaints.filter(c => c.status === 'Pending').length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold text-orange-600">
                  {complaints.filter(c => c.status === 'In Progress').length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-sm text-slate-600 font-medium mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {complaints.filter(c => c.status === 'Resolved').length}
                </p>
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map(complaint => (
                  <div
                    key={complaint.complaint_id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Left Column */}
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {complaint.issue_category}
                            </h3>
                            <p className="text-sm text-slate-500">
                              Complaint ID: <span className="font-mono font-semibold">#{complaint.complaint_id}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityColors[getPriority(complaint.complaint_count || 0)]}`}>
                            {getPriority(complaint.complaint_count || 0)} Priority
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold text-slate-700">Hall:</span>{' '}
                            <span className="text-slate-600">{complaint.lecture_halls?.hall_name || 'N/A'}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">Student:</span>{' '}
                            <span className="text-slate-600">{complaint.users?.name || complaint.student_id}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">Date:</span>{' '}
                            <span className="text-slate-600">
                              {new Date(complaint.created_at).toLocaleDateString()} at{' '}
                              {new Date(complaint.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">Description</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg line-clamp-4">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[complaint.status]}`}>
                          {statusIcons[complaint.status]}
                          <span className="ml-1">{complaint.status}</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.complaint_id, e.target.value)}
                          disabled={updating === complaint.complaint_id}
                          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Viewed">Viewed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        {updating === complaint.complaint_id && (
                          <span className="text-xs text-blue-600 font-medium">Updating...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <AlertCircle className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate-600 font-medium">No complaints found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* High Priority */}
              <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-red-900">🚨 Immediately Fix</h3>
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div className="space-y-3">
                  {hallSummary.filter(h => getPriority(h.complaint_count) === 'High').length > 0 ? (
                    hallSummary
                      .filter(h => getPriority(h.complaint_count) === 'High')
                      .map(hall => (
                        <div key={hall.hall_id} className="bg-white rounded-lg p-3 border-l-4 border-red-600">
                          <p className="font-bold text-slate-900">{hall.hall_name}</p>
                          <p className="text-sm text-slate-600">{hall.complaint_count} complaints</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-600 text-sm">No high-priority halls</p>
                  )}
                </div>
              </div>

              {/* Medium Priority */}
              <div className="bg-green-100 rounded-xl border-2 border-green-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-green-900">⚠️ Medium Priority</h3>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div className="space-y-3">
                  {hallSummary.filter(h => getPriority(h.complaint_count) === 'Medium').length > 0 ? (
                    hallSummary
                      .filter(h => getPriority(h.complaint_count) === 'Medium')
                      .map(hall => (
                        <div key={hall.hall_id} className="bg-white rounded-lg p-3 border-l-4 border-green-600">
                          <p className="font-bold text-slate-900">{hall.hall_name}</p>
                          <p className="text-sm text-slate-600">{hall.complaint_count} complaints</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-600 text-sm">No medium-priority halls</p>
                  )}
                </div>
              </div>

              {/* Normal Priority */}
              <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-green-900">✓ Normal Priority</h3>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="space-y-3">
                  {hallSummary.filter(h => getPriority(h.complaint_count) === 'Normal').length > 0 ? (
                    hallSummary
                      .filter(h => getPriority(h.complaint_count) === 'Normal')
                      .map(hall => (
                        <div key={hall.hall_id} className="bg-white rounded-lg p-3 border-l-4 border-green-600">
                          <p className="font-bold text-slate-900">{hall.hall_name}</p>
                          <p className="text-sm text-slate-600">{hall.complaint_count} complaints</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-600 text-sm">No normal-priority halls</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Hall Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Complaint Count</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Priority Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hallSummary
                      .sort((a, b) => b.complaint_count - a.complaint_count)
                      .map(hall => (
                        <tr key={hall.hall_id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{hall.hall_name}</td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                              {hall.complaint_count}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${priorityColors[hall.priority]}`}>
                              {hall.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getPriority(hall.complaint_count) === 'High' && (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <AlertCircle size={16} /> Urgent
                              </span>
                            )}
                            {getPriority(hall.complaint_count) === 'Medium' && (
                              <span className="text-orange-600 font-semibold flex items-center gap-1">
                                <TrendingUp size={16} /> Monitor
                              </span>
                            )}
                            {getPriority(hall.complaint_count) === 'Normal' && (
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle size={16} /> Normal
                              </span>
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
      </main>
    </div>
  )
}

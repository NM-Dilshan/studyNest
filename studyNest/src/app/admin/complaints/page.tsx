'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Eye,
  Filter,
  Search,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'
import { useComplaintHighlight } from '@/hooks/useComplaintHighlight'
import { buildComplaintNotification } from '@/utils/notificationService'

interface Complaint {
  complaint_id: number
  student_id: string
  hall_id: string | null
  study_area_id?: string | null
  issue_category: string
  description: string
  photo_url?: string | null
  status: string
  created_at: string
  lecture_halls?: {
    hall_name: string
  }
  study_areas?: {
    area_name: string
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

interface StudyAreaSummary {
  study_area_id: string
  area_name: string
  complaint_count: number
  priority: string
}

interface ComplaintGroup {
  locationKey: string
  locationName: string
  complaints: Complaint[]
  latestComplaint: Complaint
  highestPriority: string
}

const statusBadgeStyles: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Viewed: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-orange-50 text-orange-700 border-orange-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const priorityBadgeStyles: Record<string, string> = {
  Normal: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-orange-50 text-orange-700 border-orange-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
}

const normalizeStatus = (status: string) =>
  status.trim().toLowerCase().replace(/[\s_]+/g, '-')

const getStatusSelectClass = (status: string) => {
  const variant =
    normalizeStatus(status) === 'pending'
      ? 'status-select--pending'
      : normalizeStatus(status) === 'viewed'
        ? 'status-select--viewed'
        : normalizeStatus(status) === 'in-progress'
          ? 'status-select--in-progress'
          : normalizeStatus(status) === 'resolved'
            ? 'status-select--resolved'
            : 'status-select--pending'

  return `admin-status-select ${variant}`
}

export default function AdminComplaintsPage() {
  useComplaintHighlight()

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [hallSummary, setHallSummary] = useState<HallSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hallFilter, setHallFilter] = useState('')
  const [studyAreaFilter, setStudyAreaFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'complaints' | 'summary'>('complaints')
  const [summaryPriorityFilter, setSummaryPriorityFilter] = useState<'all' | 'high' | 'medium' | 'normal'>('all')
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null)
  const [viewGroup, setViewGroup] = useState<ComplaintGroup | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<Complaint | null>(null)
  const seenComplaintIdsRef = useRef<Set<number>>(new Set())
  const { addNotification } = useNotifications()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [complaintsRes, summaryRes] = await Promise.all([
        fetch('/api/admin/complaints'),
        fetch('/api/admin/complaints/summary'),
      ])

      if (complaintsRes.ok) {
        const data = await complaintsRes.json()
        if (data.success) {
          const nextComplaints: Complaint[] = Array.isArray(data.data) ? data.data : []
          setComplaints(nextComplaints)

          if (seenComplaintIdsRef.current.size === 0) {
            nextComplaints.forEach((complaint) => {
              seenComplaintIdsRef.current.add(complaint.complaint_id)
            })
          } else {
            const newlyArrived = nextComplaints.filter(
              (complaint) => !seenComplaintIdsRef.current.has(complaint.complaint_id)
            )

            newlyArrived.forEach((complaint) => {
              seenComplaintIdsRef.current.add(complaint.complaint_id)
              addNotification(buildComplaintNotification(complaint))
            })
          }
        }
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        if (data.success) {
          setHallSummary(Array.isArray(data.data) ? data.data : [])
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setComplaints([])
      setHallSummary([])
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    fetchData()
    const interval = window.setInterval(fetchData, 30000)
    return () => window.clearInterval(interval)
  }, [fetchData])

  const getPriority = (complaintCount: number): string => {
    if (complaintCount > 10) return 'High'
    if (complaintCount > 6) return 'Medium'
    return 'Normal'
  }

  const getStatusClass = (status: string) =>
    statusBadgeStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200'

  const getPriorityClass = (priority: string) =>
    priorityBadgeStyles[priority] || 'bg-slate-100 text-slate-700 border-slate-200'

  const getLocationName = (complaint: Complaint) =>
    complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name || 'N/A'

  const studyAreaOptions = Array.from(
    new Map(
      complaints
        .filter((c) => c.study_area_id && c.study_areas?.area_name)
        .map((c) => [c.study_area_id as string, c.study_areas?.area_name as string])
    ).entries()
  ).map(([id, name]) => ({ id, name }))

  const runWithdraw = async (complaintId: number) => {
    try {
      setWithdrawing(complaintId)
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setComplaints((prev) => prev.filter((c) => c.complaint_id !== complaintId))
        if (viewComplaint?.complaint_id === complaintId) {
          setViewComplaint(null)
        }
        if (viewGroup) {
          setViewGroup(null)
        }
        setWithdrawTarget(null)
      } else {
        alert('Failed to withdraw complaint: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error withdrawing complaint:', err)
      alert('Error withdrawing complaint')
    } finally {
      setWithdrawing(null)
    }
  }

  const handleStatusUpdate = async (complaintId: number, status: string) => {
    try {
      setStatusUpdating(complaintId)

      const response = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        alert(data.error || data.message || 'Failed to update complaint status')
        return
      }

      setComplaints((prev) =>
        prev.map((c) => (c.complaint_id === complaintId ? { ...c, status } : c))
      )

      setViewComplaint((prev) =>
        prev && prev.complaint_id === complaintId ? { ...prev, status } : prev
      )
    } catch (err) {
      console.error('Error updating complaint status:', err)
      alert('Error updating complaint status')
    } finally {
      setStatusUpdating(null)
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const q = searchQuery.toLowerCase()

    const matchesSearch =
      complaint.complaint_id?.toString().includes(q) ||
      complaint.issue_category?.toLowerCase().includes(q) ||
      complaint.users?.name?.toLowerCase().includes(q) ||
      complaint.lecture_halls?.hall_name?.toLowerCase().includes(q) ||
      complaint.study_areas?.area_name?.toLowerCase().includes(q)

    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesHall = !hallFilter || complaint.hall_id === hallFilter
    const matchesStudyArea = !studyAreaFilter || complaint.study_area_id === studyAreaFilter

    return matchesSearch && matchesStatus && matchesHall && matchesStudyArea
  })

  const groupedComplaints: ComplaintGroup[] = Object.values(
    filteredComplaints.reduce((acc, complaint) => {
      const locationKey = complaint.hall_id
        ? `hall:${complaint.hall_id}`
        : complaint.study_area_id
          ? `study:${complaint.study_area_id}`
          : `other:${getLocationName(complaint)}`

      if (!acc[locationKey]) {
        acc[locationKey] = {
          locationKey,
          locationName: getLocationName(complaint),
          complaints: [],
          latestComplaint: complaint,
          highestPriority: 'Normal',
        }
      }

      acc[locationKey].complaints.push(complaint)
      return acc
    }, {} as Record<string, ComplaintGroup>)
  ).map((group) => {
    const sorted = [...group.complaints].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const highestPriority = sorted.reduce((best, complaint) => {
      const current = complaint.priority || getPriority(complaint.complaint_count || 0)
      const rank = { Normal: 1, Medium: 2, High: 3 } as const
      return rank[current as keyof typeof rank] > rank[best as keyof typeof rank] ? current : best
    }, 'Normal')

    return {
      ...group,
      complaints: sorted,
      latestComplaint: sorted[0],
      highestPriority,
    }
  })

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending' || c.status === 'Viewed').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  }

  const hasImmediateComplaints = complaints.some(
    (c) => (c.priority || getPriority(c.complaint_count || 0)) === 'High'
  )

  const handleHallSummaryClick = (hallId: string) => {
    setActiveTab('complaints')
    setHallFilter(hallId)
    setStatusFilter('')
    setStudyAreaFilter('')
    setSearchQuery('')
  }

  const studyAreaSummary: StudyAreaSummary[] = Object.values(
    complaints.reduce((acc, complaint) => {
      const studyAreaId = complaint.study_area_id
      const areaName = complaint.study_areas?.area_name

      if (!studyAreaId || !areaName) {
        return acc
      }

      if (!acc[studyAreaId]) {
        acc[studyAreaId] = {
          study_area_id: studyAreaId,
          area_name: areaName,
          complaint_count: 0,
          priority: 'Normal',
        }
      }

      acc[studyAreaId].complaint_count += 1
      acc[studyAreaId].priority = getPriority(acc[studyAreaId].complaint_count)

      return acc
    }, {} as Record<string, StudyAreaSummary>)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#2E6F95]/20 border-t-[#2E6F95] rounded-full animate-spin" />
          <p className="mt-4 text-slate-600 font-semibold">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="admin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#admin-grid)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#2E6F95]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-[#4FA3C7]/10 blur-3xl" />

      <main className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <header className="rounded-[24px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md shadow-[0_14px_35px_rgba(30,41,59,0.08)] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Complaint Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage and resolve student complaints</p>
          </div>
          <Link href="/Naveen/Admin/dashboard" className="text-sm font-bold text-[#2E6F95] hover:text-[#255B79]">
            Back to Admin
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition-all ${
              activeTab === 'complaints'
                ? 'bg-[#2E6F95] border-[#2E6F95] text-white shadow-lg shadow-[#2E6F95]/25'
                : 'bg-[var(--bg-glass)] border-slate-200 text-slate-700 hover:bg-[var(--bg-soft)]'
            }`}
          >
            All Complaints
            {hasImmediateComplaints && (
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-[#2E6F95] border-[#2E6F95] text-white shadow-lg shadow-[#2E6F95]/25'
                : 'bg-[var(--bg-glass)] border-slate-200 text-slate-700 hover:bg-[var(--bg-soft)]'
            }`}
          >
            <TrendingUp size={16} /> Hall Summary
          </button>
        </div>

        {activeTab === 'complaints' && (
          <>
            {/* Filter Bar */}
            <section className="rounded-[22px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md shadow-[0_12px_32px_rgba(30,41,59,0.07)] p-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by ID, category, student, hall..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[var(--bg-card)] pl-12 pr-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95]"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[var(--bg-card)] pl-12 pr-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Viewed">Viewed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <select
                  value={hallFilter}
                  onChange={(e) => setHallFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[var(--bg-card)] px-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] cursor-pointer"
                >
                  <option value="">All Halls</option>
                  {hallSummary.map((hall) => (
                    <option key={hall.hall_id} value={hall.hall_id}>
                      {hall.hall_name}
                    </option>
                  ))}
                </select>

                <select
                  value={studyAreaFilter}
                  onChange={(e) => setStudyAreaFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[var(--bg-card)] px-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] cursor-pointer"
                >
                  <option value="">All Study Areas</option>
                  {studyAreaOptions.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Complaints" value={stats.total} valueClass="text-slate-900" />
              <StatCard label="Pending" value={stats.pending} valueClass="text-amber-600" />
              <StatCard label="In Progress" value={stats.inProgress} valueClass="text-orange-600" />
              <StatCard label="Resolved" value={stats.resolved} valueClass="text-emerald-600" />
            </section>

            {/* Complaint Cards */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {groupedComplaints.length > 0 ? (
                groupedComplaints.map((group) => {
                  const complaint = group.latestComplaint
                  const priority = group.highestPriority
                  return (
                    <article
                      key={group.locationKey}
                      id={`complaint-${complaint.complaint_id}`}
                      data-complaint-ids={group.complaints
                        .map((item) => `|${item.complaint_id}|`)
                        .join('')}
                      className="rounded-[24px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md p-5 shadow-[0_16px_38px_rgba(30,41,59,0.08)] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-3xl font-black tracking-tight text-emerald-600">
                            {group.locationName}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Latest Complaint ID: <span className="font-semibold">#{complaint.complaint_id}</span>
                          </p>
                          <p className="text-sm font-semibold text-slate-700 mt-1">
                            {complaint.issue_category}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            {group.complaints.length} complaint{group.complaints.length > 1 ? 's' : ''} in this location
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide ${getPriorityClass(priority)}`}
                        >
                          {priority} Priority
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-bold text-slate-800">Status:</span>{' '}
                            <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide ${getStatusClass(complaint.status)}`}>
                              {statusUpdating === complaint.complaint_id ? 'Updating...' : complaint.status}
                            </span>
                          </p>
                          <p>
                            <span className="font-bold text-slate-800">Date:</span>{' '}
                            <span className="font-medium text-slate-700">
                              {new Date(complaint.created_at).toLocaleDateString()} at{' '}
                              {new Date(complaint.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-1">Description</p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {complaint.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewGroup(group)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                          >
                            <Eye size={15} /> View All ({group.complaints.length})
                          </button>

                          <button
                            onClick={() => setWithdrawTarget(complaint)}
                            disabled={withdrawing === complaint.complaint_id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-300 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-60"
                          >
                            <XCircle size={15} />
                            {withdrawing === complaint.complaint_id ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={complaint.status}
                            onChange={(e) => handleStatusUpdate(complaint.complaint_id, e.target.value)}
                            disabled={statusUpdating === complaint.complaint_id}
                            className={getStatusSelectClass(complaint.status)}
                          >
                            <option value="Pending" className="status-option status-option--pending">PENDING</option>
                            <option value="Viewed" className="status-option status-option--viewed">VIEWED</option>
                            <option value="In Progress" className="status-option status-option--in-progress">IN PROGRESS</option>
                            <option value="Resolved" className="status-option status-option--resolved">RESOLVED</option>
                          </select>

                          <span className="px-4 py-2 rounded-full border text-xs font-black tracking-wide bg-emerald-50 text-emerald-600 border-emerald-100">
                            {group.locationName}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="xl:col-span-2 rounded-[24px] border border-white/70 bg-[var(--bg-glass)] p-12 text-center shadow-[0_14px_34px_rgba(30,41,59,0.08)]">
                  <AlertCircle className="mx-auto text-slate-400 mb-3" size={30} />
                  <p className="font-semibold text-slate-600">No complaints found matching your filters</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'summary' && (
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Hall Summary</h3>

            {(() => {
              const sorted = hallSummary.slice().sort((a, b) => b.complaint_count - a.complaint_count)
              const immediate = sorted.filter((h) => getPriority(h.complaint_count) === 'High')
              const medium = sorted.filter((h) => getPriority(h.complaint_count) === 'Medium')
              const normal = sorted.filter((h) => getPriority(h.complaint_count) === 'Normal')

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setSummaryPriorityFilter((prev) => (prev === 'high' ? 'all' : 'high'))}
                    className={`text-left rounded-2xl border bg-gradient-to-br from-rose-50 to-rose-100/70 p-5 shadow-[0_8px_18px_rgba(244,63,94,0.12)] transition ${summaryPriorityFilter === 'high' ? 'ring-2 ring-rose-300 border-rose-300' : 'border-rose-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-black tracking-tight text-rose-900">🚨 Immediately Fix</p>
                      <AlertCircle size={20} className="text-rose-700" />
                    </div>
                    {immediate.length > 0 ? (
                      <div className="space-y-2">
                        {immediate.slice(0, 2).map((hall) => (
                          <div key={`high-${hall.hall_id}`} className="rounded-xl border border-rose-200 bg-white/80 px-3 py-2">
                            <p className="text-sm font-bold text-rose-900">{hall.hall_name}</p>
                            <p className="text-xs text-rose-700">{hall.complaint_count} complaints</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-rose-900">No high-priority halls</p>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSummaryPriorityFilter((prev) => (prev === 'medium' ? 'all' : 'medium'))}
                    className={`text-left rounded-2xl border bg-gradient-to-br from-amber-50 to-amber-100/70 p-5 shadow-[0_8px_18px_rgba(245,158,11,0.12)] transition ${summaryPriorityFilter === 'medium' ? 'ring-2 ring-amber-300 border-amber-300' : 'border-amber-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-black tracking-tight text-amber-900">⚠️ Medium Priority</p>
                      <TrendingUp size={20} className="text-amber-700" />
                    </div>
                    {medium.length > 0 ? (
                      <div className="space-y-2">
                        {medium.slice(0, 2).map((hall) => (
                          <div key={`med-${hall.hall_id}`} className="rounded-xl border border-amber-200 bg-white/80 px-3 py-2">
                            <p className="text-sm font-bold text-amber-900">{hall.hall_name}</p>
                            <p className="text-xs text-amber-700">{hall.complaint_count} complaints</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-900">No medium-priority halls</p>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSummaryPriorityFilter((prev) => (prev === 'normal' ? 'all' : 'normal'))}
                    className={`text-left rounded-2xl border bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-5 shadow-[0_8px_18px_rgba(16,185,129,0.12)] transition ${summaryPriorityFilter === 'normal' ? 'ring-2 ring-emerald-300 border-emerald-300' : 'border-emerald-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-black tracking-tight text-emerald-900">✓ Normal Priority</p>
                      <CheckCircle2 size={20} className="text-emerald-700" />
                    </div>
                    {normal.length > 0 ? (
                      <div className="space-y-2">
                        {normal.slice(0, 2).map((hall) => (
                          <div key={`nor-${hall.hall_id}`} className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2">
                            <p className="text-sm font-bold text-emerald-900">{hall.hall_name}</p>
                            <p className="text-xs text-emerald-700">{hall.complaint_count} complaint{hall.complaint_count === 1 ? '' : 's'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-900">No normal-priority halls</p>
                    )}
                  </button>
                </div>
              )
            })()}

            {hallSummary.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                          Complaint
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                          Complaint Count
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                          Priority Level
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hallSummary
                        .slice()
                        .sort((a, b) => b.complaint_count - a.complaint_count)
                        .filter((hall) => {
                          const p = getPriority(hall.complaint_count)
                          if (summaryPriorityFilter === 'high') return p === 'High'
                          if (summaryPriorityFilter === 'medium') return p === 'Medium'
                          if (summaryPriorityFilter === 'normal') return p === 'Normal'
                          return true
                        })
                        .map((hall, idx, arr) => {
                          const priority = getPriority(hall.complaint_count)
                          const status =
                            priority === 'High'
                              ? 'Immediately Fix'
                              : priority === 'Medium'
                                ? 'Medium Priority'
                                : 'Normal'

                          const statusClass =
                            status === 'Immediately Fix'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : status === 'Medium Priority'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'

                          return (
                            <tr
                              key={hall.hall_id}
                              className={`${idx !== arr.length - 1 ? 'border-b border-gray-100' : ''} cursor-pointer hover:bg-blue-50`}
                              onClick={() => handleHallSummaryClick(hall.hall_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  handleHallSummaryClick(hall.hall_id)
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`View complaints for ${hall.hall_name}`}
                            >
                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-blue-700 hover:underline">{hall.hall_name}</p>
                              </td>
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                  {hall.complaint_count}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getPriorityClass(priority)}`}>
                                  {priority}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusClass}`}>
                                  {status === 'Immediately Fix' ? '⛔' : status === 'Medium Priority' ? '⚠️' : '✅'}
                                  {status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 font-medium">No hall summary data available.</p>
            )}

            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Study Area Summary</h3>

              {studyAreaSummary.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                            Study Area
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                            Complaint Count
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                            Priority Level
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyAreaSummary
                          .slice()
                          .sort((a, b) => b.complaint_count - a.complaint_count)
                          .filter((area) => {
                            const p = getPriority(area.complaint_count)
                            if (summaryPriorityFilter === 'high') return p === 'High'
                            if (summaryPriorityFilter === 'medium') return p === 'Medium'
                            if (summaryPriorityFilter === 'normal') return p === 'Normal'
                            return true
                          })
                          .map((area, idx, arr) => {
                            const priority = getPriority(area.complaint_count)
                            const status =
                              priority === 'High'
                                ? 'Immediately Fix'
                                : priority === 'Medium'
                                  ? 'Medium Priority'
                                  : 'Normal'

                            const statusClass =
                              status === 'Immediately Fix'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : status === 'Medium Priority'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'

                            return (
                              <tr
                                key={area.study_area_id}
                                className={`${idx !== arr.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50`}
                              >
                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-gray-900">{area.area_name}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                    {area.complaint_count}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getPriorityClass(priority)}`}>
                                    {priority}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusClass}`}>
                                    {status === 'Immediately Fix' ? '⛔' : status === 'Medium Priority' ? '⚠️' : '✅'}
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">No study area summary data available.</p>
              )}
            </div>
          </section>
        )}
      </main>

      {viewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close group modal"
            className="absolute inset-0 bg-slate-900/45"
            onClick={() => setViewGroup(null)}
          />
          <div className="relative w-full max-w-4xl rounded-[24px] border border-white/70 bg-[var(--bg-card)] p-6 shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2E6F95]">Location Complaints</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{viewGroup.locationName}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {viewGroup.complaints.length} complaint{viewGroup.complaints.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setViewGroup(null)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh] pr-1 space-y-3">
              {viewGroup.complaints.map((item) => (
                <div
                  key={item.complaint_id}
                  className="rounded-2xl border border-slate-200 bg-[var(--bg-soft)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">Complaint #{item.complaint_id}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{item.issue_category}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString()} at{' '}
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide ${getStatusClass(item.status)}`}>
                      {statusUpdating === item.complaint_id ? 'Updating...' : item.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{item.description}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setViewGroup(null)
                        setViewComplaint(item)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                      <Eye size={14} /> View Details
                    </button>

                    <select
                      value={item.status}
                      onChange={(e) => handleStatusUpdate(item.complaint_id, e.target.value)}
                      disabled={statusUpdating === item.complaint_id}
                      className={getStatusSelectClass(item.status)}
                    >
                      <option value="Pending" className="status-option status-option--pending">PENDING</option>
                      <option value="Viewed" className="status-option status-option--viewed">VIEWED</option>
                      <option value="In Progress" className="status-option status-option--in-progress">IN PROGRESS</option>
                      <option value="Resolved" className="status-option status-option--resolved">RESOLVED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close view modal"
            className="absolute inset-0 bg-slate-900/45"
            onClick={() => setViewComplaint(null)}
          />
          <div className="relative w-full max-w-2xl rounded-[24px] border border-white/70 bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2E6F95]">Complaint View</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{viewComplaint.issue_category}</h3>
                <p className="text-sm text-slate-500 mt-1">Complaint ID #{viewComplaint.complaint_id}</p>
              </div>
              <button
                onClick={() => setViewComplaint(null)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-5">
              <div className="rounded-2xl border border-slate-200 bg-[var(--bg-soft)] p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lecture Hall</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{getLocationName(viewComplaint)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[var(--bg-soft)] p-4 mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm leading-relaxed text-slate-700">{viewComplaint.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[var(--bg-soft)] p-4 mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Attached Image</p>
              {viewComplaint.photo_url ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewComplaint.photo_url}
                    alt={`Complaint ${viewComplaint.complaint_id} attachment`}
                    className="w-full max-h-72 object-cover rounded-xl border border-slate-200 bg-white"
                  />
                  <a
                    href={viewComplaint.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg border border-[#2E6F95]/30 text-[#2E6F95] text-xs font-bold hover:bg-[#2E6F95]/5"
                  >
                    Open Full Image
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No image attached for this complaint.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CircleDot size={16} className="text-[#2E6F95]" />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Progress</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={viewComplaint.status}
                  onChange={(e) => handleStatusUpdate(viewComplaint.complaint_id, e.target.value)}
                  disabled={statusUpdating === viewComplaint.complaint_id}
                  className={getStatusSelectClass(viewComplaint.status)}
                >
                  <option value="Pending" className="status-option status-option--pending">PENDING</option>
                  <option value="Viewed" className="status-option status-option--viewed">VIEWED</option>
                  <option value="In Progress" className="status-option status-option--in-progress">IN PROGRESS</option>
                  <option value="Resolved" className="status-option status-option--resolved">RESOLVED</option>
                </select>
                <span className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wide ${getStatusClass(viewComplaint.status)}`}>
                  {statusUpdating === viewComplaint.complaint_id ? 'Updating...' : viewComplaint.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close withdraw modal"
            className="absolute inset-0 bg-slate-900/45"
            onClick={() => setWithdrawTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-[22px] border border-white/80 bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Withdraw</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 mb-5">
              Are you sure you want to withdraw complaint <span className="font-bold">#{withdrawTarget.complaint_id}</span>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setWithdrawTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => runWithdraw(withdrawTarget.complaint_id)}
                disabled={withdrawing === withdrawTarget.complaint_id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {withdrawing === withdrawTarget.complaint_id ? 'Withdrawing...' : 'Confirm Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: number
  valueClass: string
}) {
  return (
    <div className="rounded-[20px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md p-4 shadow-[0_10px_28px_rgba(30,41,59,0.07)]">
      <p className="text-sm text-slate-600 font-medium mb-1">{label}</p>
      <p className={`text-5xl font-black ${valueClass}`}>{value}</p>
    </div>
  )
}

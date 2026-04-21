'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Search, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

export default function MyComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const studentId = localStorage.getItem('studentId')

    if (!storedUser || !studentId) {
      router.push('/login/signIN')
      return
    }

    // Fetch complaints from API
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        setFetchError('')
        const response = await fetch(`/api/complaints?studentId=${studentId}`)
        const data = await response.json()
        if (data.success) {
          setComplaints(Array.isArray(data.data) ? data.data : [])
        } else {
          setFetchError(data.message || 'Failed to load complaints')
          setComplaints([])
        }
      } catch (err) {
        console.error('Error fetching complaints:', err)
        setFetchError('Unable to load complaints right now. Please refresh and try again.')
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [router])

  const getStatusBadgeClass = (status) => {
    const value = (status || '').toLowerCase()

    if (value.includes('resolve')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (value.includes('progress')) {
      return 'bg-blue-50 text-blue-700 border-blue-200'
    }
    if (value.includes('pending') || value.includes('viewed') || value.includes('submit')) {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }

    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const normalizeStatus = (status) =>
    (status || '').trim().toLowerCase().replace(/[\s_]+/g, '-')

  const getStatusSelectClass = (status) => {
    const normalized = normalizeStatus(status)

    if (normalized === 'pending') {
      return 'complaint-status-select complaint-status-select--pending'
    }

    if (normalized === 'viewed') {
      return 'complaint-status-select complaint-status-select--viewed'
    }

    if (normalized === 'in-progress') {
      return 'complaint-status-select complaint-status-select--in-progress'
    }

    if (normalized === 'resolved') {
      return 'complaint-status-select complaint-status-select--resolved'
    }

    return 'complaint-status-select'
  }

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((complaint) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      complaint.issue_category?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.lecture_halls?.hall_name?.toLowerCase().includes(searchLower) ||
      complaint.study_areas?.area_name?.toLowerCase().includes(searchLower) ||
      complaint.complaint_id?.toString().includes(searchLower) ||
      complaint.status?.toLowerCase().includes(searchLower)
    )

    const matchesStatus =
      !statusFilter || (complaint.status || '').toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return
    }

    try {
      setDeleting(complaintId)
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        // Remove from list
        setComplaints(complaints.filter(c => c.complaint_id !== complaintId))
      } else {
        alert('Failed to delete complaint: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting complaint:', err)
      alert('Error deleting complaint')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AppBackground>
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="complaints-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M0 38 L38 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#complaints-grid)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#2E6F95]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-[30%] -right-24 h-80 w-80 rounded-full bg-[#4FA3C7]/10 blur-3xl" />

      <MainHeader />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Complaint Center"
          title="My Complaints"
          subtitle="Track and manage your submitted reports with status visibility and quick actions."
          actions={
            <Link
              href="/Naveen/complaints"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-8 py-3 font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_28%,transparent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-primary-dark)]"
            >
              <Plus size={20} strokeWidth={3} /> File New Complaint
            </Link>
          }
          className="mb-10"
        />

        {/* SEARCH & FILTER BAR */}
        <div className="themed-surface mb-8 rounded-[28px] p-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--brand-primary)]" size={18} />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="themed-input w-full rounded-2xl py-4 pl-12 pr-4 shadow-sm"
              />
            </div>
            <div className="relative sm:min-w-[210px]">
              <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-primary)]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${getStatusSelectClass(statusFilter)} w-full pl-10`}
              >
                <option value="">All Statuses</option>
                <option value="Pending" className="complaint-status-option complaint-status-option--pending">PENDING</option>
                <option value="Viewed" className="complaint-status-option complaint-status-option--viewed">VIEWED</option>
                <option value="In Progress" className="complaint-status-option complaint-status-option--in-progress">IN PROGRESS</option>
                <option value="Resolved" className="complaint-status-option complaint-status-option--resolved">RESOLVED</option>
              </select>
            </div>
          </div>
        </div>

        {fetchError ? (
          <div className="mb-7 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
            {fetchError}
          </div>
        ) : null}

        {/* COMPLAINTS LIST */}
        <div className="space-y-6">
          <AnimatePresence>
            {loading ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : filteredComplaints.length > 0 ? (
              filteredComplaints.map((item, idx) => (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  key={item.complaint_id}
                  className="themed-surface rounded-[30px] p-6 transition-all hover:shadow-[var(--surface-shadow-strong)]"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    {/* Left - Complaint Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.14em] ${getStatusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-bold tracking-wide text-[var(--text-muted)]">
                          Reference #{item.complaint_id}
                        </span>
                      </div>

                      <h3 className="mb-2 text-2xl font-black tracking-tight text-[var(--text-main)]">
                        {item.issue_category}
                      </h3>

                      <p className="mb-3 text-sm font-medium text-[var(--text-soft)]">
                        <span className="font-bold text-[var(--brand-primary)]">
                          {item.lecture_halls?.hall_name || item.study_areas?.area_name || 'Unknown Location'}
                        </span>
                        <span className="mx-2 text-[var(--surface-border-strong)]">•</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </p>

                      <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                        {item.description}
                      </p>
                    </div>

                    {/* Right - Action Buttons */}
                    <div className="flex gap-3 flex-wrap lg:flex-col lg:min-w-[180px]">
                      <Link
                        href={`/Naveen/my-complaints/${item.complaint_id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[color-mix(in_srgb,var(--brand-primary)_28%,transparent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-primary-dark)]"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(item.complaint_id)}
                        disabled={deleting === item.complaint_id}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/45 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-500 transition-all hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {deleting === item.complaint_id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4"
              >
                <EmptyState
                  title="No complaints found"
                  description="No complaints match your current search and status filters."
                  action={
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('')
                      }}
                      className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-dark)]"
                    >
                      Clear Filters
                    </button>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </AppBackground>
  )
}

function SkeletonCard() {
  return (
    <div className="themed-surface animate-pulse rounded-[30px] p-8">
      <div className="mb-6 h-6 w-40 rounded-full bg-[var(--surface-card-muted)]" />
      <div className="mb-4 h-8 w-2/3 rounded-xl bg-[var(--surface-card-muted)]" />
      <div className="mb-8 h-4 w-1/2 rounded-lg bg-[var(--surface-card-muted)]" />
      <div className="h-20 w-full rounded-2xl bg-[var(--surface-card-muted)]" />
    </div>
  )
}
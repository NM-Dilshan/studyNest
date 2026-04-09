'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Search, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'

export default function MyComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState(null)

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
        const response = await fetch(`/api/complaints?studentId=${studentId}`)
        const data = await response.json()
        if (data.success) {
          setComplaints(Array.isArray(data.data) ? data.data : [])
        }
      } catch (err) {
        console.error('Error fetching complaints:', err)
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
        {/* TITLE & ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Complaints</h2>
            <p className="text-slate-500 font-medium mt-1">Track and manage your submitted reports</p>
          </div>
          <Link
            href="/Naveen/complaints"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#2E6F95] text-white font-bold shadow-lg shadow-[#2E6F95]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#2E6F95]/30 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> File New Complaint
          </Link>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mb-8 rounded-[28px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md p-4 shadow-[0_16px_40px_rgba(30,41,59,0.08)]">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E6F95] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[#2E6F95]/10 focus:border-[#2E6F95] transition-all shadow-sm"
              />
            </div>
            <div className="relative sm:min-w-[210px]">
              <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2E6F95]" />
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
                  className="rounded-[30px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md p-6 shadow-[0_18px_45px_rgba(30,41,59,0.09)] hover:shadow-[0_22px_50px_rgba(30,41,59,0.12)] transition-all"
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
                        <span className="text-xs text-slate-500 font-bold tracking-wide">
                          Reference #{item.complaint_id}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        {item.issue_category}
                      </h3>

                      <p className="text-sm text-slate-600 mb-3 font-medium">
                        <span className="font-bold text-[#2E6F95]">
                          {item.lecture_halls?.hall_name || item.study_areas?.area_name || 'Unknown Location'}
                        </span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Right - Action Buttons */}
                    <div className="flex gap-3 flex-wrap lg:flex-col lg:min-w-[180px]">
                      <Link
                        href={`/Naveen/my-complaints/${item.complaint_id}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2E6F95] text-white text-sm font-bold shadow-md shadow-[#2E6F95]/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2E6F95]/30 transition-all"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(item.complaint_id)}
                        disabled={deleting === item.complaint_id}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-rose-300 bg-transparent text-rose-600 text-sm font-bold hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="text-center py-16 rounded-[28px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md shadow-[0_16px_40px_rgba(30,41,59,0.08)]"
              >
                <p className="text-slate-500 font-semibold">No complaints found matching your search</p>
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
    <div className="rounded-[30px] border border-white/70 bg-[var(--bg-glass)] p-8 animate-pulse shadow-[0_18px_45px_rgba(30,41,59,0.09)]">
      <div className="h-6 w-40 bg-slate-200 rounded-full mb-6" />
      <div className="h-8 w-2/3 bg-slate-200 rounded-xl mb-4" />
      <div className="h-4 w-1/2 bg-slate-100 rounded-lg mb-8" />
      <div className="h-20 w-full bg-slate-100 rounded-2xl" />
    </div>
  )
}
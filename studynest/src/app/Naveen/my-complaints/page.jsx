'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronLeft, Plus, Filter, Search, Trash2, Edit2, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusProgression } from '@/components/StatusProgression'

export default function MyComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter(complaint => {
    const searchLower = searchQuery.toLowerCase()
    return (
      complaint.issue_category?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.lecture_halls?.hall_name?.toLowerCase().includes(searchLower) ||
      complaint.study_areas?.area_name?.toLowerCase().includes(searchLower) ||
      complaint.complaint_id?.toString().includes(searchLower) ||
      complaint.status?.toLowerCase().includes(searchLower)
    )
  })

  const handleEdit = (complaintId) => {
    router.push(`/Naveen/my-complaints/edit/${complaintId}`)
  }

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
    <div className={`min-h-screen bg-[#F4F9F8] text-slate-900 font-sans`}>
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2E6F95] flex items-center justify-center shadow-lg shadow-[#2E6F95]/20">
               <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#2E6F95]">StudyNest</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-500">
              <Link href="/home" className="hover:text-[#2E6F95] transition-colors">HOME</Link>
              <Link href="#" className="text-[#2E6F95]">MY COMPLAINTS</Link>
            </nav>
            <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* TITLE & ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">My Complaints</h2>
            <p className="text-slate-500 font-medium mt-1">Track and manage your submitted reports</p>
          </div>
          <Link 
            href="/Naveen/complaints"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#2E6F95] text-white rounded-2xl font-bold hover:bg-[#4FA3C7] transition-all hover:shadow-xl hover:shadow-[#2E6F95]/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> File New Complaint
          </Link>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E6F95] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 focus:border-[#2E6F95] transition-all shadow-sm"
            />
          </div>
          <button className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={20} className="text-[#2E6F95]" />
          </button>
        </div>

        {/* COMPLAINTS LIST */}
        <div className="space-y-6">
          <AnimatePresence>
            {loading ? (
              [1, 2].map(i => <SkeletonCard key={i} />)
            ) : filteredComplaints.length > 0 ? (
              filteredComplaints.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.complaint_id}
                  className="bg-white rounded-[16px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left - Complaint Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-[#F4F9F8] text-[#2E6F95] text-[9px] font-bold uppercase rounded-full border border-[#2E6F95]/10">
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{item.complaint_id}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-1 truncate group-hover:text-[#2E6F95] transition-colors">
                        {item.issue_category}
                      </h3>

                      <p className="text-xs text-slate-500 mb-3">
                        <span className="font-bold text-[#4FA3C7]">{item.lecture_halls?.hall_name || item.study_areas?.area_name}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </p>

                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Right - Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/Naveen/my-complaints/${item.complaint_id}`}>
                        <button className="px-4 py-2 bg-[#2E6F95] text-white rounded-lg text-xs font-bold hover:bg-[#4FA3C7] transition-all flex items-center gap-1 whitespace-nowrap">
                          <Eye size={14} /> View
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleEdit(item.complaint_id)}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.complaint_id)}
                        disabled={deleting === item.complaint_id}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-slate-400 font-medium">No complaints found matching your search</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] p-8 animate-pulse border border-slate-100">
      <div className="h-6 w-32 bg-slate-100 rounded-full mb-6" />
      <div className="h-8 w-2/3 bg-slate-100 rounded-xl mb-4" />
      <div className="h-4 w-1/2 bg-slate-50 rounded-lg mb-8" />
      <div className="h-24 w-full bg-slate-50 rounded-2xl" />
    </div>
  )
}
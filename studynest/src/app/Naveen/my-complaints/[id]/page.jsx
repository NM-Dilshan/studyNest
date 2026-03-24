'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LogOut, ChevronLeft, MessageSquare, Clock, MapPin, User, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { StatusProgression } from '@/components/StatusProgression'

export default function ComplaintDetailPage() {
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id
  
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const studentId = localStorage.getItem('studentId')

    if (!storedUser || !studentId) {
      router.push('/login/signIN')
      return
    }

    // Fetch complaint details from API
    const fetchComplaint = async () => {
      try {
        console.log('Fetching complaint with ID:', complaintId, 'Type:', typeof complaintId)
        const response = await fetch(`/api/complaints/${complaintId}`)
        const data = await response.json()
        
        console.log('Fetch response status:', response.status)
        console.log('Fetch response data:', data)
        
        if (data.success && data.data) {
          setComplaint(data.data)
        } else {
          setComplaint(null)
        }
      } catch (err) {
        console.error('Error fetching complaint:', err)
        setComplaint(null)
      } finally {
        setLoading(false)
      }
    }

    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId, router])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return
    }

    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        router.push('/Naveen/my-complaints')
      } else {
        alert('Failed to delete complaint: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting complaint:', err)
      alert('Error deleting complaint')
    }
  }

  const handleEdit = () => {
    router.push(`/Naveen/my-complaints/edit/${complaintId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F8] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-[#2E6F95] rounded-full animate-spin" />
          <p className="mt-4 text-slate-400 font-medium text-sm tracking-widest uppercase">Loading Details</p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-[#F4F9F8]">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link href="/Naveen/my-complaints" className="flex items-center gap-2 text-[#2E6F95] font-bold hover:text-[#4FA3C7] transition-colors">
              <ChevronLeft size={20} /> Back
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center py-20 bg-white rounded-[20px] border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">Complaint not found</p>
          </div>
        </main>
      </div>
    )
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-50 text-red-600 border-red-100',
      'Medium': 'bg-amber-50 text-amber-600 border-amber-100',
      'Low': 'bg-green-50 text-green-600 border-green-100'
    }
    return colors[priority] || 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-[#F4F9F8]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/Naveen/my-complaints" className="flex items-center gap-2 text-[#2E6F95] font-bold hover:text-[#4FA3C7] transition-colors">
            <ChevronLeft size={20} /> Back
          </Link>
          
          <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority} Priority
            </span>
            <span className="px-4 py-1.5 bg-[#F4F9F8] text-[#2E6F95] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#2E6F95]/10">
              {complaint.status}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{complaint.issue_category}</h2>
          <p className="text-slate-500 font-bold">ID: {complaint.complaint_id}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Photo */}
          {complaint.photo_url && (
            <div className="bg-white rounded-[16px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="w-full h-64 relative">
                <img src={complaint.photo_url} alt="Complaint" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Status Progression */}
          <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Status Progress</h3>
            <StatusProgression currentStatus={complaint.status} />
          </div>

          {/* Updates Log */}
          {complaint.updates && complaint.updates.length > 0 && (
            <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> Activity Log
              </h3>
              
              <div className="space-y-4">
                {complaint.updates.map((update, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-slate-50 last:border-b-0 last:pb-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#2E6F95] text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      {idx < complaint.updates.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{update.status}</span>
                        <span className="text-xs text-slate-400">{new Date(update.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-[#2E6F95]" />
                <p className="text-xs text-slate-500 font-bold uppercase">Location</p>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name}
              </p>
            </div>

            <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-[#2E6F95]" />
                <p className="text-xs text-slate-500 font-bold uppercase">Submitted</p>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px]">📋</span>
                <p className="text-xs text-slate-500 font-bold uppercase">Category</p>
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-2">
                {complaint.issue_category}
              </p>
            </div>

            <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px]">⚡</span>
                <p className="text-xs text-slate-500 font-bold uppercase">Priority</p>
              </div>
              <p className={`text-sm font-bold ${getPriorityColor(complaint.priority).split(' ')[1]}`}>
                {complaint.priority}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all"
            >
              <Edit2 size={16} /> Edit Complaint
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

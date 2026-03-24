'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LogOut, ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditComplaintPage() {
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id
  
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    issue_category: '',
    description: '',
    photo_url: ''
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login/signIN')
      return
    }

    // Fetch complaint details
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${complaintId}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setComplaint(data.data)
          setFormData({
            issue_category: data.data.issue_category,
            description: data.data.description,
            photo_url: data.data.photo_url || ''
          })
        } else {
          alert('Complaint not found')
          router.push('/Naveen/my-complaints')
        }
      } catch (err) {
        console.error('Error fetching complaint:', err)
        alert('Error loading complaint')
        router.push('/Naveen/my-complaints')
      } finally {
        setLoading(false)
      }
    }

    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.issue_category.trim()) {
      alert('Please enter issue category')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Please enter description')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Complaint updated successfully')
        router.push(`/Naveen/my-complaints/${complaintId}`)
      } else {
        alert('Error updating complaint: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error updating complaint:', err)
      alert('Error updating complaint')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F8] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-[#2E6F95] rounded-full animate-spin" />
          <p className="mt-4 text-slate-400 font-medium text-sm tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F9F8]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/Naveen/my-complaints/${complaintId}`} className="flex items-center gap-2 text-[#2E6F95] font-bold hover:text-[#4FA3C7] transition-colors">
            <ChevronLeft size={20} /> Back
          </Link>
          
          <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Edit Complaint</h2>
          <p className="text-slate-500">Update your complaint details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[16px] border border-slate-100 p-8 shadow-sm">
          {/* Issue Category */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">Issue Category</label>
            <select
              name="issue_category"
              value={formData.issue_category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 focus:border-[#2E6F95] transition-all bg-white cursor-pointer"
            >
              <option value="">-- Select a category --</option>
              <option value="Noise">Noise</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="AC">AC</option>
              <option value="Lights">Lights</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Safety">Safety</option>
              <option value="Locked hall">Locked hall</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              rows="6"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 focus:border-[#2E6F95] transition-all resize-none"
            />
          </div>

          {/* Photo URL */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-2">Photo URL (Optional)</label>
            <input
              type="text"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 focus:border-[#2E6F95] transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2E6F95] text-white rounded-lg font-bold hover:bg-[#4FA3C7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-800 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

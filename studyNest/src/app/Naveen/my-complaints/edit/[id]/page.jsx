'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LogOut, ChevronLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function EditComplaintPage() {
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id
  
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    issue_category: '',
    description: '',
    photo_file: null,
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
            photo_file: null,
            photo_url: data.data.photo_url || ''
          })
          // Set preview if image exists
          if (data.data.photo_url) {
            setImagePreview(data.data.photo_url)
          }
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.issue_category.trim()) {
      newErrors.issue_category = 'Please select an issue category'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        photo_file: 'Please upload a valid image file'
      }))
      return
    }

    // Validate file size (15MB max)
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > 15) {
      setErrors(prev => ({
        ...prev,
        photo_file: `File size must be less than 15MB (current: ${fileSizeMB.toFixed(2)}MB)`
      }))
      return
    }

    // Clear errors
    setErrors(prev => ({
      ...prev,
      photo_file: ''
    }))

    setFormData(prev => ({
      ...prev,
      photo_file: file
    }))

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      photo_file: null,
      photo_url: ''
    }))
    setImagePreview(null)
    setErrors(prev => ({
      ...prev,
      photo_file: ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      
      // Prepare form data
      const submitData = {
        issue_category: formData.issue_category,
        description: formData.description,
        photo_url: formData.photo_url
      }

      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2E6F95] rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 font-semibold text-sm tracking-widest uppercase">Loading complaint...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href={`/Naveen/my-complaints/${complaintId}`} 
              className="flex items-center gap-2 text-[#2E6F95] hover:text-[#4FA3C7] font-semibold transition-colors hover:scale-105 duration-200"
            >
              <ChevronLeft size={20} /> Back
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-lg font-bold text-slate-800">Edit Complaint</h1>
          </div>
          
          <button 
            onClick={() => router.push('/home')}
            className="p-2.5 hover:bg-red-50 hover:text-red-500 text-slate-600 rounded-full transition-all duration-200 hover:scale-110"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page Title Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Update Your Complaint
          </h2>
          <p className="text-slate-500 text-lg">Make changes to your complaint details below</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* Issue Category */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-3">
              Issue Category 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="issue_category"
              value={formData.issue_category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 transition-all bg-white cursor-pointer font-medium ${
                errors.issue_category 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-slate-200 focus:border-[#2E6F95]'
              }`}
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
            {errors.issue_category && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.issue_category}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-3">
              Description 
              <span className="text-red-500 ml-1">*</span>
              <span className="ml-2 text-xs font-normal text-slate-500">
                ({formData.description.length}/1000)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail... (minimum 10 characters)"
              rows="6"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6F95]/20 transition-all resize-none font-medium ${
                errors.description 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-slate-200 focus:border-[#2E6F95]'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-3">
              Complaint Photo 
              <span className="text-slate-500 font-normal text-xs ml-2">(Optional, Max 15MB)</span>
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs max-h-64 rounded-lg border-2 border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all shadow-lg hover:scale-110"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              errors.photo_file 
                ? 'border-red-300 bg-red-50' 
                : 'border-slate-300 bg-slate-50 hover:border-[#2E6F95] hover:bg-blue-50'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-[#2E6F95]/10 p-4 rounded-full">
                    <Upload size={24} className="text-[#2E6F95]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500 mt-1">PNG, JPG, GIF up to 15MB</p>
                  </div>
                </div>
              </label>
            </div>
            {errors.photo_file && (
              <p className="text-red-500 text-sm mt-2 font-medium">{errors.photo_file}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2E6F95] to-[#1e5a7a] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 duration-200"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-800 rounded-lg font-bold hover:bg-slate-200 transition-all hover:scale-105 duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

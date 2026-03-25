'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Layers3,
  Users,
  Wifi,
  PlugZap,
  VolumeX,
  Wind,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react'

export default function AddStudyAreaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    area_name: '',
    building: '',
    floor: '',
    capacity: '',
    wifi: false,
    charging_ports: false,
    silent_zone: false,
    ac: false,
    area_status: 'available',
  })

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!formData.area_name.trim()) {
      setError('Area name is required')
      return
    }

    if (formData.capacity && isNaN(parseInt(formData.capacity, 10))) {
      setError('Capacity must be a number')
      return
    }

    if (formData.floor && isNaN(parseInt(formData.floor, 10))) {
      setError('Floor must be a number')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/study-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
          floor: formData.floor ? parseInt(formData.floor, 10) : null,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create study area'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        setError(errorMessage)
        return
      }

      await response.json()
      setMessage('Study area created successfully!')

      setTimeout(() => {
        router.push('/admin/study-area')
      }, 1500)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 36 L36 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/study-area"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#2E6F95]">
                StudyNest Admin
              </p>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Add Study Area
              </h1>
            </div>
          </div>

          <Link
            href="/admin/study-area"
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
          >
            Study Area List
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Add New Study Area
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
            Create a study space with location details, capacity, features, and current availability.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Area Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Area Name *
                </label>
                <input
                  type="text"
                  name="area_name"
                  value={formData.area_name}
                  onChange={handleChange}
                  placeholder="e.g., Library Zone A"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Building2 size={14} />
                    Building
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    placeholder="e.g., Building A"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Layers3 size={14} />
                    Floor
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Users size={14} />
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </label>
                  <select
                    name="area_status"
                    value={formData.area_status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="available">Available</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="closed">Closed</option>
                    <option value="crowded">Crowded</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
                <Plus size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Available Features</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FeatureToggle
                name="wifi"
                label="WiFi Available"
                checked={formData.wifi}
                onChange={handleChange}
                icon={Wifi}
              />
              <FeatureToggle
                name="charging_ports"
                label="Charging Ports"
                checked={formData.charging_ports}
                onChange={handleChange}
                icon={PlugZap}
              />
              <FeatureToggle
                name="silent_zone"
                label="Silent Zone"
                checked={formData.silent_zone}
                onChange={handleChange}
                icon={VolumeX}
              />
              <FeatureToggle
                name="ac"
                label="Air Conditioning"
                checked={formData.ac}
                onChange={handleChange}
                icon={Wind}
              />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-3 rounded-2xl bg-[#2E6F95] px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#2E6F95]/20 transition-all hover:-translate-y-0.5 hover:shadow-[#2E6F95]/35 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Study Area'}
              <Plus size={18} />
            </button>

            <Link
              href="/admin/study-area"
              className="inline-flex min-h-[54px] flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

interface FeatureToggleProps {
  name: string
  label: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: React.ComponentType<{ size?: number; className?: string }>
}

function FeatureToggle({
  name,
  label,
  checked,
  onChange,
  icon: Icon,
}: FeatureToggleProps) {
  return (
    <label
      className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
        checked
          ? 'border-[#2E6F95] bg-[#2E6F95]/5 text-[#2E6F95]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          checked ? 'bg-[#2E6F95]/10' : 'bg-slate-100'
        }`}
      >
        <Icon size={18} />
      </div>
      <span className="text-sm font-semibold">{label}</span>
      {checked && <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[#2E6F95]" />}
    </label>
  )
}
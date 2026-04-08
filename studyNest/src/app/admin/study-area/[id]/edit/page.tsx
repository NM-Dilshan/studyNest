'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Layers3,
  Users,
  MapPin,
} from 'lucide-react'
import {
  validateFormData,
  formDataToPayload,
  STUDY_AREA_VALIDATION,
  validateAreaName,
  validateBuilding,
  validateFloor,
  validateCapacity,
  type StudyAreaFormData,
  type ValidationErrors,
} from '@/lib/validation/studyAreaValidation'
import DeviceLocationPicker from '@/components/admin/DeviceLocationPicker'

export default function EditStudyAreaPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  const [location, setLocation] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    source: null as 'device' | 'manual' | null,
    radius: 20,
  })

  const [formData, setFormData] = useState<StudyAreaFormData>({
    area_name: '',
    building: '',
    floor: '',
    capacity: '',
    latitude: '0',
    longitude: '0',
    radius_meters: '20',
    area_status: 'available',
    wifi: false,
    charging_ports: false,
    silent_zone: false,
    ac: false,
  })

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10'

  // Fetch study area data on mount
  useEffect(() => {
    if (!id) {
      setError('Study area ID is required')
      setLoading(false)
      return
    }

    const fetchStudyArea = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/study-areas/${id}`)

        if (!response.ok) {
          let errorMessage = 'Failed to fetch study area'
          try {
            const data = await response.json()
            errorMessage = data.error || errorMessage
          } catch (parseError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
          setError(errorMessage)
          setLoading(false)
          return
        }

        const data = await response.json()
        const area = data.area

        // Set form data
        setFormData({
          area_name: area.name || '',
          building: area.building || '',
          floor: area.floor ? String(area.floor) : '',
          capacity: area.capacity ? String(area.capacity) : '',
          latitude: String(area.latitude || '0'),
          longitude: String(area.longitude || '0'),
          radius_meters: String(area.radiusMeters || '20'),
          area_status: 'available',
          wifi: area.facilities?.wifi || false,
          charging_ports: area.facilities?.chargingPorts || false,
          silent_zone: area.facilities?.silentZone || false,
          ac: area.facilities?.ac || false,
        })

        // Set location state
        setLocation({
          latitude: area.latitude,
          longitude: area.longitude,
          source: 'manual',
          radius: area.radiusMeters || 20,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStudyArea()
  }, [id])

  // Real-time field validation
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'area_name':
        return validateAreaName(value as string)
      case 'building':
        return validateBuilding(value as string)
      case 'floor':
        return validateFloor(value as string)
      case 'capacity':
        return validateCapacity(value as string)
      default:
        return null
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    const newValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (touchedFields[name]) {
      const error = validateField(name, newValue)
      setFieldErrors((prev) => {
        const updated = { ...prev }
        if (error) {
          updated[name] = error
        } else {
          delete updated[name]
        }
        return updated
      })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }))

    const error = validateField(name, value)
    setFieldErrors((prev) => {
      const updated = { ...prev }
      if (error) {
        updated[name] = error
      } else {
        delete updated[name]
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!location.latitude || !location.longitude) {
      setError('Location must be selected on the map')
      return
    }

    setTouchedFields({
      area_name: true,
      building: true,
      floor: true,
      capacity: true,
    })

    const updatedFormData: StudyAreaFormData = {
      ...formData,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      radius_meters: String(location.radius),
    }

    const validationResult = validateFormData(updatedFormData)

    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors)
      setError(
        Object.keys(validationResult.errors).length === 1
          ? Object.values(validationResult.errors)[0]
          : 'Please fix all validation errors before submitting'
      )
      return
    }

    setFieldErrors({})

    try {
      setSubmitting(true)

      const payload = formDataToPayload(updatedFormData)

      const response = await fetch(`/api/study-areas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.errors) {
          setFieldErrors(responseData.errors)
          setError(responseData.error || 'Please fix the validation errors below')
        } else {
          setError(responseData.error || 'Failed to update study area. Please try again.')
        }
        return
      }

      setMessage('✓ Study area updated successfully!')
      setFieldErrors({})

      setTimeout(() => {
        router.push('/admin/study-area')
      }, 1500)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E6F95]"></div>
          <p className="text-slate-600 mt-4">Loading study area...</p>
        </div>
      </div>
    )
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
                Edit Study Area
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
            Update Study Area
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
            Modify location details, capacity, features, and availability information.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <p className="text-rose-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <p className="text-emerald-700 text-sm font-medium">{message}</p>
          </div>
        )}

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
                  onBlur={handleBlur}
                  placeholder="e.g., Library Zone A"
                  maxLength={STUDY_AREA_VALIDATION.AREA_NAME.MAX_LENGTH}
                  className={`${inputClass} ${touchedFields.area_name && fieldErrors.area_name ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                />
                {touchedFields.area_name && fieldErrors.area_name ? (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.area_name}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formData.area_name.length}/{STUDY_AREA_VALIDATION.AREA_NAME.MAX_LENGTH}
                  </p>
                )}
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
                    onBlur={handleBlur}
                    placeholder="e.g., Building A"
                    className={`${inputClass} ${touchedFields.building && fieldErrors.building ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                  />
                  {touchedFields.building && fieldErrors.building && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.building}</p>
                  )}
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
                    onBlur={handleBlur}
                    min="0"
                    placeholder="e.g., 1, 2, 3"
                    className={`${inputClass} ${touchedFields.floor && fieldErrors.floor ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                  />
                  {touchedFields.floor && fieldErrors.floor ? (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.floor}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">Only positive numbers allowed</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Users size={14} />
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                  max="2000"
                  placeholder="e.g., 50"
                  className={`${inputClass} ${touchedFields.capacity && fieldErrors.capacity ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                />
                {touchedFields.capacity && fieldErrors.capacity ? (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{fieldErrors.capacity}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Only positive numbers allowed. Max: 2000</p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Radius */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Location & Radius</h3>
            </div>

            <p className="mb-6 text-sm font-medium text-slate-500">
              Update the location for this study area. Click on the map to move the marker or adjust the radius.
            </p>

            <DeviceLocationPicker
              value={location}
              onChange={setLocation}
            />
          </div>

          {/* Features */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800">Available Features</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { name: 'wifi', label: 'WiFi Available' },
                { name: 'charging_ports', label: 'Charging Ports' },
                { name: 'silent_zone', label: 'Silent Zone' },
                { name: 'ac', label: 'Air Conditioning' },
              ].map((feature) => (
                <label
                  key={feature.name}
                  className="group relative flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-[#2E6F95]/30 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    name={feature.name}
                    checked={formData[feature.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="h-5 w-5 rounded-full border-slate-300 text-[#2E6F95] accent-[#2E6F95]"
                  />
                  <span className="text-sm font-medium text-slate-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-[#2E6F95] py-3 px-6 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#1f4a63] disabled:bg-slate-400"
            >
              {submitting ? 'Updating...' : '✓ Save Changes'}
            </button>
            <Link
              href="/admin/study-area"
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 px-6 text-center text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

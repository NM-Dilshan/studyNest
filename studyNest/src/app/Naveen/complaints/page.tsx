'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building2,
  ShieldAlert,
  FileText,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/MainHeader'

export default function ComplaintsPage() {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<{ studentId: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [mounted, setMounted] = useState(false)

  const buildingConfig: Record<
    string,
    { blocks: string[]; floors: (string | number)[] }
  > = {
    'New Building': {
      blocks: ['G', 'F'],
      floors: Array.from({ length: 14 }, (_, i) => i + 1),
    },
    'Main Building': {
      blocks: ['A', 'B'],
      floors: ['B', '1', '2', '3', '4', '5', '6', '7', '8'],
    },
  }

  const [formData, setFormData] = useState({
    building: '',
    complaintType: '',
    block: '',
    floor: '',
    locationId: '',
    locationName: '',
    issueCategory: '',
    description: '',
    photoUrl: '',
    studentId: '',
  })

  const [buildings, setBuildings] = useState<string[]>([])
  interface LectureHall {
    hall_id: string
    hall_name: string
    building: string
    block: string
    floor: string | number
  }

  interface StudyArea {
    study_area_id: string
    area_name: string
    building?: string
  }

  const normalizeStudyArea = (raw: Record<string, unknown>): StudyArea => ({
    study_area_id: String(raw.study_area_id ?? raw.id ?? ''),
    area_name: String(raw.area_name ?? raw.areaName ?? raw.name ?? 'Unnamed Area'),
    building: String(raw.building ?? ''),
  })

  const [hallLocations, setHallLocations] = useState<LectureHall[]>([])
  const [studyAreaLocations, setStudyAreaLocations] = useState<StudyArea[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [availableFloors, setAvailableFloors] = useState<(string | number)[]>([])
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([])
  const [lectureHallsData, setLectureHallsData] = useState<LectureHall[]>([])
  const [studyAreasData, setStudyAreasData] = useState<StudyArea[]>([])
  const [loadingStep2, setLoadingStep2] = useState(false)

  const studyAreaBuildings = useMemo(
    () =>
      Array.from(
        new Set(
          studyAreasData
            .map((area) => area.building)
            .filter((building): building is string => Boolean(building?.trim()))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [studyAreasData]
  )

  // Filter out Arts Block and Science Block from both lecture halls and study areas
  const filteredLectureHallBuildings = buildings.filter(
    (b) => b !== 'Arts Block' && b !== 'Science Block'
  )
  const filteredStudyAreaBuildings = studyAreaBuildings.filter(
    (b) => b !== 'Arts Block' && b !== 'Science Block'
  )

  const buildingOptions =
    formData.complaintType === 'study_area' ? filteredStudyAreaBuildings : filteredLectureHallBuildings

  const issueCategories = [
    'Noise',
    'Wi-Fi',
    'AC',
    'Lights',
    'Cleanliness',
    'Safety',
    'Locked hall',
    'Other',
  ]

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#2E6F95] focus:bg-white focus:ring-4 focus:ring-[#2E6F95]/10'

  const validateDescription = (description: string) => {
    const cleaned = description.trim()

    if (!cleaned) {
      return 'Please enter a description'
    }

    // Allow only letters, numbers, and spaces.
    if (!/^[A-Za-z0-9\s]+$/.test(cleaned)) {
      return 'Description can contain only letters and numbers'
    }

    // Block descriptions that are numbers-only.
    if (!/[A-Za-z]/.test(cleaned)) {
      return 'Description cannot be numbers only'
    }

    return ''
  }

  const getTotalSteps = () => {
    if (!formData.complaintType) return 3
    if (formData.complaintType === 'lecture_hall') return 8
    if (formData.complaintType === 'study_area') return 6
    return 3
  }

  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    if (studentId) {
      setUser({ studentId })
      setIsAuthenticated(true)
    }

    setCheckingAuth(false)
    setMounted(true)
    fetchBuildings()
  }, [])

  useEffect(() => {
    if (step === 1) {
      setLoadingStep2(true)
      Promise.all([fetchAllLectureHalls(), fetchAllStudyAreas()]).finally(() => {
        setLoadingStep2(false)
      })
    }
  }, [step])

  useEffect(() => {
    if (formData.building && buildingConfig[formData.building]) {
      setAvailableBlocks(buildingConfig[formData.building].blocks)
      setAvailableFloors(buildingConfig[formData.building].floors)
    }
  }, [formData.building])

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings')
      const data = await response.json()
      if (data.success) {
        setBuildings(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching buildings:', err)
    }
  }

  const fetchAllLectureHalls = async () => {
    try {
      const response = await fetch('/api/lecture-halls')
      const data = await response.json()
      if (data.success || Array.isArray(data)) {
        const halls = Array.isArray(data) ? data : data.data || []
        setLectureHallsData(halls)
      }
    } catch (err) {
      console.error('Error fetching lecture halls:', err)
    }
  }

  const fetchAllStudyAreas = async () => {
    try {
      const response = await fetch('/api/study-areas')
      const data = await response.json()
      if (data.success || Array.isArray(data)) {
        const rawAreas = Array.isArray(data) ? data : data.data || []
        const areas = rawAreas.map((area: Record<string, unknown>) =>
          normalizeStudyArea(area)
        )
        setStudyAreasData(areas)
      }
    } catch (err) {
      console.error('Error fetching study areas:', err)
    }
  }

  const fetchStudyAreasByBuilding = async (buildingName: string) => {
    setLoadingData(true)
    try {
      // Prefer already-loaded study areas for instant filtering and reliability.
      const filteredFromLocal = studyAreasData.filter(
        (area) =>
          (area.building || '').trim().toLowerCase() ===
          buildingName.trim().toLowerCase()
      )

      if (filteredFromLocal.length > 0) {
        setStudyAreaLocations(filteredFromLocal)
        return
      }

      // Fallback to API if local list is empty.
      const response = await fetch(
        `/api/study-areas/by-building/${encodeURIComponent(buildingName)}`
      )
      const data = await response.json()
      if (data.success) {
        const normalized = (data.data || []).map(
          (area: Record<string, unknown>) => normalizeStudyArea(area)
        )
        setStudyAreaLocations(normalized)
      }
    } catch (err) {
      console.error('Error fetching study areas:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchHallsByBuildingBlockFloor = async (
    buildingName: string,
    block: string,
    floor: string
  ) => {
    setLoadingData(true)
    try {
      const filtered = lectureHallsData.filter(
        (h) =>
          h.building === buildingName &&
          h.block === block &&
          String(h.floor) === String(floor)
      )
      setHallLocations(filtered)
    } catch (err) {
      console.error('Error filtering halls:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleBuildingChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const building = e.target.value
    setFormData((prev) => ({
      ...prev,
      building,
      block: '',
      floor: '',
      locationId: '',
      locationName: '',
    }))
    setHallLocations([])
    setStudyAreaLocations([])

    if (formData.complaintType === 'study_area' && building) {
      fetchStudyAreasByBuilding(building)
    }
  }

  const handleComplaintTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const type = e.target.value
    setFormData((prev) => ({
      ...prev,
      complaintType: type,
      block: '',
      floor: '',
      locationId: '',
      locationName: '',
    }))

    // If building is already selected, immediately load matching study areas.
    if (type === 'study_area' && formData.building) {
      const filtered = studyAreasData.filter(
        (area) =>
          (area.building || '').trim().toLowerCase() ===
          formData.building.trim().toLowerCase()
      )
      setStudyAreaLocations(filtered)
    }
  }

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      block: e.target.value,
      floor: '',
      locationId: '',
      locationName: '',
    }))
  }

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const floor = e.target.value
    setFormData((prev) => ({
      ...prev,
      floor,
      locationId: '',
      locationName: '',
    }))

    if (formData.building && formData.block) {
      fetchHallsByBuildingBlockFloor(formData.building, formData.block, floor)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const selectedLocation =
      formData.complaintType === 'lecture_hall'
        ? hallLocations.find((loc) => loc.hall_id === selectedId)
        : studyAreaLocations.find((loc) => loc.study_area_id === selectedId)

    const locationName = selectedLocation
      ? 'hall_name' in selectedLocation
        ? selectedLocation.hall_name
        : selectedLocation.area_name
      : ''

    setFormData((prev) => ({
      ...prev,
      locationId: selectedId,
      locationName,
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        e.target.value = ''
        return
      }

      const maxSizeInBytes = 15 * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        setError('Photo size must be 15MB or less')
        e.target.value = ''
        return
      }

      setError('')
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photoUrl: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photoUrl: '',
    }))

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  const validateStep = () => {
    setError('')

    const isLectureHall = formData.complaintType === 'lecture_hall'
    const isStudyArea = formData.complaintType === 'study_area'

    switch (step) {
      case 1:
        if (!formData.complaintType) {
          setError('Please select complaint type')
          return false
        }
        return true
      case 2:
        if (!formData.building) {
          setError('Please select a building')
          return false
        }
        return true
      case 3:
        if (isLectureHall && !formData.block) {
          setError('Please select a block')
          return false
        }
        if (isStudyArea && !formData.locationId) {
          setError('Please select a study area')
          return false
        }
        return true
      case 4:
        if (isLectureHall && !formData.floor) {
          setError('Please select a floor')
          return false
        }
        if (isStudyArea && !formData.issueCategory) {
          setError('Please select an issue category')
          return false
        }
        return true
      case 5:
        if (isLectureHall && !formData.locationId) {
          setError('Please select a lecture hall')
          return false
        }
        if (isStudyArea) {
          const descriptionError = validateDescription(formData.description)
          if (descriptionError) {
            setError(descriptionError)
            return false
          }
        }
        return true
      case 6:
        if (isLectureHall && !formData.issueCategory) {
          setError('Please select an issue category')
          return false
        }
        return true
      case 7:
        if (isLectureHall) {
          const descriptionError = validateDescription(formData.description)
          if (descriptionError) {
            setError(descriptionError)
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setError('')

    const descriptionError = validateDescription(formData.description)
    if (descriptionError) {
      setError(descriptionError)
      return
    }

    if (formData.photoUrl && !String(formData.photoUrl).startsWith('data:image/')) {
      setError('Invalid photo format. Please upload a valid image.')
      return
    }

    const studentId = localStorage.getItem('studentId') || 'anonymous'

    const selectedLectureHall =
      formData.complaintType === 'lecture_hall'
        ? lectureHallsData.find(
            (hall) =>
              hall.hall_id === formData.locationId ||
              hall.hall_name === formData.locationId ||
              hall.hall_name === formData.locationName
          )
        : null

    const selectedStudyArea =
      formData.complaintType === 'study_area'
        ? studyAreasData.find(
            (area) =>
              area.study_area_id === formData.locationId ||
              area.area_name === formData.locationId ||
              area.area_name === formData.locationName
          )
        : null

    const normalizedLocationId =
      formData.complaintType === 'lecture_hall'
        ? selectedLectureHall?.hall_id || formData.locationId
        : selectedStudyArea?.study_area_id || formData.locationId

    setLoading(true)
    try {
      const payload = {
        student_id: studentId,
        [formData.complaintType === 'lecture_hall' ? 'hall_id' : 'study_area_id']:
          normalizedLocationId,
        issue_category: formData.issueCategory,
        description: formData.description,
        photo_url: formData.photoUrl || null,
        status: 'Pending',
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit complaint')
        return
      }

      setSuccess(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!success) return

    const timer = setTimeout(() => {
      router.push('/Naveen/my-complaints')
    }, 1500)

    return () => clearTimeout(timer)
  }, [success, router])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E6F95] mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const totalSteps = getTotalSteps()
  const progressPercent = (step / totalSteps) * 100

  const StepHeader = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ComponentType<{ size: number }>
    title: string
    description: string
  }) => (
    <div className="mb-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E6F95]/10 text-[#2E6F95]">
        <Icon size={22} />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 36 L36 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <MainHeader />

      <div className="relative z-10 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#2E6F95]">
              StudyNest Support
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              File a Complaint
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
              Help us improve your campus spaces by reporting issues clearly and quickly.
            </p>
          </div>

          <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-[#2E6F95] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Complaint Submitted!
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-slate-600">
                  Thank you for reporting the issue. Your complaint has been saved successfully and will be reviewed shortly.
                </p>
                <p className="mt-3 text-sm font-semibold text-[#2E6F95]">
                  Redirecting to My Complaints...
                </p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div>
                    <StepHeader
                      icon={ShieldAlert}
                      title="What do you want to complain about?"
                      description="Choose the type of campus space where the issue happened."
                    />

                    {loadingStep2 ? (
                      <div className="py-10 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#2E6F95] mb-4"></div>
                        <p className="text-slate-600">Loading available options...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <OptionCard
                          checked={formData.complaintType === 'lecture_hall'}
                          title="Lecture Hall"
                          description={`Report issues in lecture halls (${lectureHallsData.length} available)`}
                        >
                          <input
                            type="radio"
                            name="complaintType"
                            value="lecture_hall"
                            checked={formData.complaintType === 'lecture_hall'}
                            onChange={handleComplaintTypeChange}
                            className="h-5 w-5"
                          />
                        </OptionCard>

                        <OptionCard
                          checked={formData.complaintType === 'study_area'}
                          title="Study Area"
                          description={`Report issues in study areas (${studyAreasData.length} available)`}
                        >
                          <input
                            type="radio"
                            name="complaintType"
                            value="study_area"
                            checked={formData.complaintType === 'study_area'}
                            onChange={handleComplaintTypeChange}
                            className="h-5 w-5"
                          />
                        </OptionCard>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <StepHeader
                      icon={Building2}
                      title="Where is the issue?"
                      description="Select the building where the complaint occurred."
                    />
                    <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Building *
                    </label>
                    <select
                      value={formData.building}
                      onChange={handleBuildingChange}
                      className={inputClass}
                    >
                      <option value="">-- Select a building --</option>
                      {buildingOptions.map((building) => (
                        <option key={building} value={building}>
                          {building}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 3 && formData.complaintType === 'lecture_hall' && (
                  <div>
                    <StepHeader
                      icon={MapPin}
                      title="Select Block"
                      description="Choose the block where the lecture hall is located."
                    />
                    <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Block *
                    </label>
                    <select
                      value={formData.block}
                      onChange={handleBlockChange}
                      className={inputClass}
                    >
                      <option value="">-- Select a block --</option>
                      {availableBlocks.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 3 && formData.complaintType === 'study_area' && (
                  <div>
                    <StepHeader
                      icon={MapPin}
                      title="Select Study Area"
                      description="Choose the study area where the issue happened."
                    />
                    {loadingData ? (
                      <p className="text-slate-600">Loading...</p>
                    ) : (
                      <>
                        <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Study Area *
                        </label>
                        <select
                          value={formData.locationId}
                          onChange={handleLocationChange}
                          className={inputClass}
                        >
                          <option value="">-- Select a study area --</option>
                          {studyAreaLocations.map((loc) => (
                            <option key={loc.study_area_id} value={loc.study_area_id}>
                              {loc.area_name || 'Unnamed Area'}
                            </option>
                          ))}
                        </select>

                        {formData.locationId && (
                          <div className="mt-6">
                            <h3 className="mb-4 text-sm font-bold text-slate-900">Selected Study Area Details</h3>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <table className="w-full">
                                <tbody>
                                  {(() => {
                                    const selected = studyAreaLocations.find(
                                      (loc) => loc.study_area_id === formData.locationId
                                    )
                                    return selected ? (
                                      <>
                                        <tr className="border-b border-slate-200">
                                          <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                                            Area Name
                                          </td>
                                          <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                            {selected.area_name || 'N/A'}
                                          </td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                          <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                                            Building
                                          </td>
                                          <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                            {selected.building || 'N/A'}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                                            Study Area ID
                                          </td>
                                          <td className="px-4 py-3 text-sm font-mono text-slate-600">
                                            {selected.study_area_id}
                                          </td>
                                        </tr>
                                      </>
                                    ) : null
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {step === 4 && formData.complaintType === 'lecture_hall' && (
                  <div>
                    <StepHeader
                      icon={Building2}
                      title="Select Floor"
                      description="Choose the floor where the lecture hall is located."
                    />
                    <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Floor *
                    </label>
                    <select
                      value={formData.floor}
                      onChange={handleFloorChange}
                      className={inputClass}
                    >
                      <option value="">-- Select a floor --</option>
                      {availableFloors.map((floor) => (
                        <option key={floor} value={floor}>
                          {floor}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 5 && formData.complaintType === 'lecture_hall' && (
                  <div>
                    <StepHeader
                      icon={MapPin}
                      title="Select Lecture Hall"
                      description="Choose the exact hall where the issue happened."
                    />
                    {loadingData ? (
                      <p className="text-slate-600">Loading...</p>
                    ) : (
                      <>
                        <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Lecture Hall *
                        </label>
                        <select
                          value={formData.locationId}
                          onChange={handleLocationChange}
                          className={inputClass}
                        >
                          <option value="">-- Select a lecture hall --</option>
                          {hallLocations.map((loc) => (
                            <option key={loc.hall_id} value={loc.hall_id}>
                              {loc.hall_name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                )}

                {step === 4 && formData.complaintType === 'study_area' && (
                  <div>
                    <StepHeader
                      icon={ShieldAlert}
                      title="What is the issue?"
                      description="Select the category that best matches the problem."
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {issueCategories.map((category) => (
                        <IssueCard
                          key={category}
                          checked={formData.issueCategory === category}
                          label={category}
                        >
                          <input
                            type="radio"
                            name="issueCategory"
                            value={category}
                            checked={formData.issueCategory === category}
                            onChange={handleInputChange}
                            className="h-4 w-4"
                          />
                        </IssueCard>
                      ))}
                    </div>
                  </div>
                )}

                {step === 6 && formData.complaintType === 'lecture_hall' && (
                  <div>
                    <StepHeader
                      icon={ShieldAlert}
                      title="What is the issue?"
                      description="Select the category that best matches the problem."
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {issueCategories.map((category) => (
                        <IssueCard
                          key={category}
                          checked={formData.issueCategory === category}
                          label={category}
                        >
                          <input
                            type="radio"
                            name="issueCategory"
                            value={category}
                            checked={formData.issueCategory === category}
                            onChange={handleInputChange}
                            className="h-4 w-4"
                          />
                        </IssueCard>
                      ))}
                    </div>
                  </div>
                )}

                {((step === 7 && formData.complaintType === 'lecture_hall') ||
                  (step === 5 && formData.complaintType === 'study_area')) && (
                  <div>
                    <StepHeader
                      icon={FileText}
                      title="Describe your complaint"
                      description="Give enough detail so the issue can be reviewed properly."
                    />

                    <div className="space-y-6">
                      <div>
                        <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Please describe your complaint in detail..."
                          className={`${inputClass} min-h-[140px] resize-none`}
                          rows={5}
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Use letters or letters with numbers. Numbers-only text is not allowed. ({formData.description.length} / 1000)
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Photo (Optional)
                        </label>
                        <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 transition hover:bg-slate-100">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Upload className="h-5 w-5" />
                            <span className="text-sm font-semibold">
                              Click to upload (image only, max 15MB)
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={photoInputRef}
                            className="hidden"
                          />
                        </label>

                        {formData.photoUrl && (
                          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-emerald-700">
                                Photo uploaded successfully
                              </p>
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                              >
                                <X className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                            <img
                              src={formData.photoUrl}
                              alt="Complaint preview"
                              className="max-h-64 rounded-xl border border-slate-200 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {((step === 8 && formData.complaintType === 'lecture_hall') ||
                  (step === 6 && formData.complaintType === 'study_area')) && (
                  <div>
                    <StepHeader
                      icon={CheckCircle}
                      title="Review your complaint"
                      description="Please confirm the details before submitting."
                    />

                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <ReviewRow label="Building" value={formData.building} />
                      <ReviewRow
                        label="Type"
                        value={
                          formData.complaintType === 'lecture_hall'
                            ? 'Lecture Hall'
                            : 'Study Area'
                        }
                      />
                      <ReviewRow label="Location" value={formData.locationName} />
                      <ReviewRow label="Issue" value={formData.issueCategory} />
                      <div className="border-b border-slate-200 pb-3">
                        <p className="text-sm font-semibold text-slate-500">
                          Description
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formData.description}
                        </p>
                      </div>
                      {formData.photoUrl && (
                        <div>
                          <p className="text-sm font-semibold text-slate-500">
                            Photo
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            Attached
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Back
                    </button>
                  )}

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading || loadingData}
                      className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2E6F95] px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#2E6F95]/20 transition hover:-translate-y-0.5 hover:bg-[#245a79] hover:shadow-[#2E6F95]/35 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex min-h-[54px] flex-1 items-center justify-center rounded-2xl bg-[#2E6F95] px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#2E6F95]/20 transition hover:-translate-y-0.5 hover:bg-[#245a79] hover:shadow-[#2E6F95]/35 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OptionCard({
  checked,
  title,
  description,
  children,
}: {
  checked: boolean
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex cursor-pointer items-start rounded-2xl border-2 p-5 transition-all ${
        checked
          ? 'border-[#2E6F95] bg-[#2E6F95]/5'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {children}
      <div className="ml-3 flex-1">
        <span className="block font-bold text-slate-900">{title}</span>
        <span className="text-sm text-slate-500">{description}</span>
      </div>
    </label>
  )
}

function IssueCard({
  checked,
  label,
  children,
}: {
  checked: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex cursor-pointer items-center rounded-2xl border-2 p-4 transition-all ${
        checked
          ? 'border-[#2E6F95] bg-[#2E6F95]/5'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {children}
      <span className="ml-3 text-sm font-semibold text-slate-900">{label}</span>
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  )
}
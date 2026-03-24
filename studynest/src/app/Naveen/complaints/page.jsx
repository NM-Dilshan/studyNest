'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { ChevronRight, ChevronLeft, Upload, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ComplaintsPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Building configuration
  const buildingConfig = {
    'New Building': { 
      blocks: ['G', 'F'],
      floors: Array.from({ length: 14 }, (_, i) => i + 1)
    },
    'Main Building': { 
      blocks: ['A', 'B'],
      floors: ['B', '1', '2', '3', '4', '5', '6', '7', '8']
    }
  }

  // Form data
  const [formData, setFormData] = useState({
    building: '',
    complaintType: '', // 'lecture_hall' or 'study_area'
    block: '',
    floor: '',
    locationId: '',
    locationName: '',
    issueCategory: '',
    description: '',
    photoUrl: '',
    studentId: '',
  })

  // Dropdowns data
  const [buildings, setBuildings] = useState([])
  const [hallLocations, setHallLocations] = useState([])
  const [studyAreaLocations, setStudyAreaLocations] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [availableFloors, setAvailableFloors] = useState([])
  const [availableBlocks, setAvailableBlocks] = useState([])
  const [lectureHallsData, setLectureHallsData] = useState([])
  const [studyAreasData, setStudyAreasData] = useState([])
  const [loadingStep2, setLoadingStep2] = useState(false)

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

  // Calculate total steps based on complaint type
  const getTotalSteps = () => {
    if (!formData.complaintType) return 3 // Step 1: Building, Step 2: Type
    if (formData.complaintType === 'lecture_hall') return 8 // Building, Type, Block, Floor, Hall, Issue, Description, Review
    if (formData.complaintType === 'study_area') return 6 // Building, Type, Area, Issue, Description, Review
    return 3
  }

  // Fetch buildings on mount
  useEffect(() => {
    // Get student ID if available
    const studentId = localStorage.getItem('studentId')
    if (studentId) {
      setUser({ studentId })
      setIsAuthenticated(true)
    }
    
    // Always allow page to load - no auth required
    setCheckingAuth(false)
    setMounted(true)

    fetchBuildings()
  }, [])

  // Fetch all lecture halls and study areas when step 2 is reached
  useEffect(() => {
    if (step === 2) {
      setLoadingStep2(true)
      Promise.all([fetchAllLectureHalls(), fetchAllStudyAreas()]).finally(() => {
        setLoadingStep2(false)
      })
    }
  }, [step])

  // Update available blocks and floors when building changes
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
        const halls = Array.isArray(data) ? data : (data.data || [])
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
        const areas = Array.isArray(data) ? data : (data.data || [])
        setStudyAreasData(areas)
      }
    } catch (err) {
      console.error('Error fetching study areas:', err)
    }
  }

  const fetchHallsByBuilding = async (buildingName) => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/lecture-halls/by-building/${encodeURIComponent(buildingName)}`)
      const data = await response.json()
      if (data.success) {
        setHallLocations(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching halls:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchHallsByBuildingBlockFloor = async (buildingName, block, floor) => {
    setLoadingData(true)
    try {
      // Filter from lectureHallsData by building, block, and floor
      const filtered = lectureHallsData.filter(h => 
        h.building === buildingName && h.block === block && String(h.floor) === String(floor)
      )
      setHallLocations(filtered)
    } catch (err) {
      console.error('Error filtering halls:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchStudyAreasByBuilding = async (buildingName) => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/study-areas/by-building/${encodeURIComponent(buildingName)}`)
      const data = await response.json()
      if (data.success) {
        setStudyAreaLocations(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching study areas:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleBuildingChange = (e) => {
    const building = e.target.value
    setFormData(prev => ({
      ...prev,
      building,
      complaintType: '',
      block: '',
      floor: '',
      locationId: '',
      locationName: '',
    }))
    setHallLocations([])
    setStudyAreaLocations([])
  }

  const handleComplaintTypeChange = (e) => {
    const type = e.target.value
    setFormData(prev => ({
      ...prev,
      complaintType: type,
      block: '',
      floor: '',
      locationId: '',
      locationName: '',
    }))
    
    // Fetch locations for study areas immediately
    if (type === 'study_area') {
      fetchStudyAreasByBuilding(formData.building)
    }
  }

  const handleBlockChange = (e) => {
    setFormData(prev => ({
      ...prev,
      block: e.target.value,
      floor: '',
      locationId: '',
      locationName: '',
    }))
  }

  const handleFloorChange = (e) => {
    const floor = e.target.value
    setFormData(prev => ({
      ...prev,
      floor,
      locationId: '',
      locationName: '',
    }))
    // Fetch halls filtered by building, block, and floor
    if (formData.building && formData.block) {
      fetchHallsByBuildingBlockFloor(formData.building, formData.block, floor)
    }
  }

  const handleLocationChange = (e) => {
    const selectedId = e.target.value
    const selectedLocation = formData.complaintType === 'lecture_hall'
      ? hallLocations.find(loc => loc.hall_id === selectedId)
      : studyAreaLocations.find(loc => loc.study_area_id === selectedId)
    
    setFormData(prev => ({
      ...prev,
      locationId: selectedId,
      locationName: selectedLocation ? (selectedLocation.hall_name || selectedLocation.area_name) : '',
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoUrl: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = () => {
    setError('')

    const isLectureHall = formData.complaintType === 'lecture_hall'
    const isStudyArea = formData.complaintType === 'study_area'
    
    switch (step) {
      case 1:
        if (!formData.building) {
          setError('Please select a building')
          return false
        }
        return true
      case 2:
        if (!formData.complaintType) {
          setError('Please select complaint type')
          return false
        }
        return true
      // For lecture halls: Block || For study areas: Select location
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
      // For lecture halls: Floor || For study areas: Issue category
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
      // For lecture halls: Select hall || For study areas: Description
      case 5:
        if (isLectureHall && !formData.locationId) {
          setError('Please select a lecture hall')
          return false
        }
        if (isStudyArea && !formData.description.trim()) {
          setError('Please enter a description')
          return false
        }
        return true
      // For lecture halls: Issue category
      case 6:
        if (isLectureHall && !formData.issueCategory) {
          setError('Please select an issue category')
          return false
        }
        return true
      // For lecture halls: Description
      case 7:
        if (isLectureHall && !formData.description.trim()) {
          setError('Please enter a description')
          return false
        }
        return true
      // Review step - no validation
      case 8:
      case 6:
        if (step === 8 && isLectureHall) return true
        if (step === 6 && isStudyArea) return true
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setError('')

    // Get studentId from localStorage (optional - for tracking)
    const studentId = localStorage.getItem('studentId') || 'anonymous'

    setLoading(true)
    try {
      const payload = {
        student_id: studentId,
        [formData.complaintType === 'lecture_hall' ? 'hall_id' : 'study_area_id']: formData.locationId,
        issue_category: formData.issueCategory,
        description: formData.description,
        photo_url: formData.photoUrl || null,
        status: 'Pending',
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit complaint')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/Naveen/my-complaints')
      }, 2000)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show nothing if not mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E6F95] mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const totalSteps = getTotalSteps()
  const progressPercent = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Component */}
      <Header currentPage="complaints" />

      {/* Main Content */}
      <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File a Complaint</h1>
          <p className="text-gray-600">Help us improve StudyNest by reporting issues</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-lg h-2">
            <div
              className="bg-[#2E6F95] h-2 rounded-lg transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Screen */}
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for helping us improve StudyNest. We will review your complaint shortly.
              </p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Select Building */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Where is the issue?</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Building *
                    </label>
                    <select
                      value={formData.building}
                      onChange={handleBuildingChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E6F95] focus:border-transparent"
                    >
                      <option value="">-- Select a building --</option>
                      {buildings.map(building => (
                        <option key={building} value={building}>
                          {building}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Select Complaint Type */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What do you want to complain about?</h2>
                  
                  {loadingStep2 ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E6F95] mb-4"></div>
                      <p className="text-gray-600">Loading available options...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Lecture Halls Option */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{
                          borderColor: formData.complaintType === 'lecture_hall' ? '#2E6F95' : '#e5e7eb',
                          backgroundColor: formData.complaintType === 'lecture_hall' ? '#f0f9fc' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="complaintType"
                          value="lecture_hall"
                          checked={formData.complaintType === 'lecture_hall'}
                          onChange={handleComplaintTypeChange}
                          className="w-5 h-5 mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <span className="font-medium text-gray-900 block">Lecture Hall</span>
                          <span className="text-sm text-gray-600">Report issues in lecture halls ({lectureHallsData.length} available)</span>
                        </div>
                      </label>

                      {/* Study Areas Option */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{
                          borderColor: formData.complaintType === 'study_area' ? '#2E6F95' : '#e5e7eb',
                          backgroundColor: formData.complaintType === 'study_area' ? '#f0f9fc' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="complaintType"
                          value="study_area"
                          checked={formData.complaintType === 'study_area'}
                          onChange={handleComplaintTypeChange}
                          className="w-5 h-5 mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <span className="font-medium text-gray-900 block">Study Area</span>
                          <span className="text-sm text-gray-600">Report issues in study areas ({studyAreasData.length} available)</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}
              {step === 3 && formData.complaintType === 'lecture_hall' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Block</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block *
                    </label>
                    <select
                      value={formData.block}
                      onChange={handleBlockChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E6F95] focus:border-transparent"
                    >
                      <option value="">-- Select a block --</option>
                      {availableBlocks.map(block => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: For Study Area - Select Location */}
              {step === 3 && formData.complaintType === 'study_area' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Study Area</h2>
                  {loadingData ? (
                    <p className="text-gray-600">Loading...</p>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Study Area *
                      </label>
                      <select
                        value={formData.locationId}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E6F95] focus:border-transparent"
                      >
                        <option value="">-- Select a study area --</option>
                        {studyAreaLocations.map(loc => (
                          <option key={loc.study_area_id} value={loc.study_area_id}>
                            {loc.area_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: For Lecture Hall - Select Floor */}
              {step === 4 && formData.complaintType === 'lecture_hall' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Floor</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor *
                    </label>
                    <select
                      value={formData.floor}
                      onChange={handleFloorChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E6F95] focus:border-transparent"
                    >
                      <option value="">-- Select a floor --</option>
                      {availableFloors.map(floor => (
                        <option key={floor} value={floor}>
                          {floor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 5: For Lecture Hall - Enter Hall Number */}
              {/* Step 5: For Lecture Hall - Select Lecture Hall from List */}
              {step === 5 && formData.complaintType === 'lecture_hall' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Lecture Hall</h2>
                  {loadingData ? (
                    <p className="text-gray-600">Loading...</p>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lecture Hall *
                      </label>
                      <select
                        value={formData.locationId}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E6F95] focus:border-transparent"
                      >
                        <option value="">-- Select a lecture hall --</option>
                        {hallLocations.map(loc => (
                          <option key={loc.hall_id} value={loc.hall_id}>
                            {loc.hall_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: For Study Area - Issue Category */}
              {step === 4 && formData.complaintType === 'study_area' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What is the issue?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {issueCategories.map(category => (
                      <label
                        key={category}
                        className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{
                          borderColor: formData.issueCategory === category ? '#2E6F95' : '#e5e7eb',
                          backgroundColor: formData.issueCategory === category ? '#f0f9fc' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="issueCategory"
                          value={category}
                          checked={formData.issueCategory === category}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: For Lecture Hall - Issue Category */}
              {step === 6 && formData.complaintType === 'lecture_hall' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What is the issue?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {issueCategories.map(category => (
                      <label
                        key={category}
                        className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{
                          borderColor: formData.issueCategory === category ? '#2E6F95' : '#e5e7eb',
                          backgroundColor: formData.issueCategory === category ? '#f0f9fc' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="issueCategory"
                          value={category}
                          checked={formData.issueCategory === category}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7 (LH) / Step 5 (SA): Description and Photo */}
              {((step === 7 && formData.complaintType === 'lecture_hall') || (step === 5 && formData.complaintType === 'study_area')) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Describe Your Complaint</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Please describe your complaint in detail..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        rows="5"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.description.length} / 1000 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Click to upload</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {formData.photoUrl && (
                        <div className="mt-3">
                          <p className="text-sm text-green-600 mb-2">✓ Photo uploaded</p>
                          <img
                            src={formData.photoUrl}
                            alt="Complaint"
                            className="max-w-xs rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8 (LH) / Step 6 (SA): Review */}
              {((step === 8 && formData.complaintType === 'lecture_hall') || (step === 6 && formData.complaintType === 'study_area')) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Complaint</h2>
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Building:</span>
                      <span className="font-medium text-gray-900">{formData.building}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">
                        {formData.complaintType === 'lecture_hall' ? 'Lecture Hall' : 'Study Area'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{formData.locationName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Issue:</span>
                      <span className="font-medium text-gray-900">{formData.issueCategory}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-gray-600">Description:</span>
                      <p className="font-medium text-gray-900 mt-1">{formData.description}</p>
                    </div>
                    {formData.photoUrl && (
                      <div className="py-2">
                        <span className="text-gray-600">Photo:</span>
                        <p className="text-sm text-green-600 mt-1">✓ Photo attached</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={loading || loadingData}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2E6F95] text-white rounded-lg font-medium hover:bg-[#1f4b66] disabled:opacity-50 transition"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[#2E6F95] text-white rounded-lg font-medium hover:bg-[#1f4b66] disabled:opacity-50 transition"
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

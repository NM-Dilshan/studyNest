'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import { useLocationTracking } from '@/hooks/useLocationTracking'
import { StudyAreaSummary } from '@/components/study-areas/StudyAreaSummary'
import { CrowdStatus } from '@/lib/geofence'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import AppButton from '@/components/ui/AppButton'
import AppLinkButton from '@/components/ui/AppLinkButton'
import StudyAreaFilters, { CrowdFilter, FeatureFilter } from '@/components/study-areas/StudyAreaFilters'
import StudyAreaGrid, { StudyAreaGridItem } from '@/components/study-areas/StudyAreaGrid'

interface StudyAreaData {
  study_area_id: string
  area_name: string
  building: string | null
  capacity: number
  latitude?: number | null
  longitude?: number | null
  lat?: number | null
  lng?: number | null
  radius_meters: number
  wifi: boolean
  charging_ports: boolean
  silent_zone: boolean
  ac: boolean
  cafe?: boolean
}

interface OccupancyData {
  occupancy_id: string
  study_area_id: string
  current_count: number
  available_seats: number
  occupancy_percentage: number
  crowd_status: CrowdStatus
  updated_at: string
}

interface StudyAreaApiResponse extends StudyAreaData {
  area_occupancy?: {
    occupancy_id: string
    study_area_id: string
    current_count: number
    available_seats: number
    occupancy_percentage: number
    crowd_status: CrowdStatus
    updated_at: string
  }
}

interface StudyAreaStats {
  lowCrowdAreas: number
  mediumCrowdAreas: number
  highCrowdAreas: number
  totalStudentsInside: number
  totalAvailableSeats: number
  totalCapacity: number
}

interface InsideUser {
  id: string
  label: string
  joinedAt: number
  study_area_id?: string | null
  latitude: number
  longitude: number
}

const calculateOccupancy = (count: number, capacity: number) => {
  const safeCount = Math.max(0, count)
  const safeCapacity = Math.max(0, capacity)
  const availableSeats = Math.max(0, safeCapacity - safeCount)
  const occupancyPercentage = safeCapacity > 0 ? (safeCount / safeCapacity) * 100 : 0

  return {
    currentCount: safeCount,
    availableSeats,
    occupancyPercentage,
  }
}

const getCrowdStatusFromPercentage = (occupancyPercentage: number): CrowdStatus => {
  if (occupancyPercentage <= 30) return 'Low Crowd'
  if (occupancyPercentage <= 70) return 'Medium Crowd'
  return 'High Crowd'
}

export default function StudyAreaFinderPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [studyAreas, setStudyAreas] = useState<StudyAreaData[]>([])
  const [occupancyData, setOccupancyData] = useState<Map<string, OccupancyData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StudyAreaStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [crowdFilter, setCrowdFilter] = useState<CrowdFilter>('all')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [liveStudents, setLiveStudents] = useState<InsideUser[]>([])

  const location = useLocationTracking(userId, true)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserId(user.user_id)
      } else {
        setError('Please log in to use the Study Area Finder')
        setIsLoading(false)
      }
    } catch (userError) {
      console.error('Error getting user:', userError)
      setError('Failed to authenticate')
      setIsLoading(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const [response, liveResponse] = await Promise.all([
        fetch('/api/study-areas'),
        fetch('/api/study-areas/live'),
      ])
      if (!response.ok) throw new Error('Failed to fetch')
      if (!liveResponse.ok) throw new Error('Failed to fetch live locations')

      const data = await response.json()
      const liveData = await liveResponse.json()
      const areas: StudyAreaApiResponse[] = data.areas || []
      setStudyAreas(areas)
      setLiveStudents(
        Array.isArray(liveData.students)
          ? liveData.students.map((student: any, index: number) => ({
              id: student.user_id || `live-${index}`,
              label: `User ${index + 1}`,
              joinedAt: student.updated_at ? new Date(student.updated_at).getTime() : Date.now(),
              latitude: student.latitude,
              longitude: student.longitude,
              study_area_id: student.study_area_id,
            }))
          : []
      )

      const occupancyMap = new Map<string, OccupancyData>()
      const occupancyList: OccupancyData[] = []

      areas.forEach((area) => {
        if (area.area_occupancy) {
          const normalizedCrowdStatus = getCrowdStatusFromPercentage(area.area_occupancy.occupancy_percentage)
          const occupancy: OccupancyData = {
            occupancy_id: area.area_occupancy.occupancy_id,
            study_area_id: area.area_occupancy.study_area_id,
            current_count: area.area_occupancy.current_count,
            available_seats: area.area_occupancy.available_seats,
            occupancy_percentage: area.area_occupancy.occupancy_percentage,
            crowd_status: normalizedCrowdStatus,
            updated_at: area.area_occupancy.updated_at,
          }
          occupancyMap.set(occupancy.study_area_id, occupancy)
          occupancyList.push(occupancy)
        }
      })

      setOccupancyData(occupancyMap)

      const lowCrowd = occupancyList.filter((o) => o.crowd_status === 'Low Crowd').length || 0
      const mediumCrowd = occupancyList.filter((o) => o.crowd_status === 'Medium Crowd').length || 0
      const highCrowd = occupancyList.filter((o) => o.crowd_status === 'High Crowd').length || 0
      const totalStudents = occupancyList.reduce((sum, o) => sum + o.current_count, 0) || 0
      const totalAvailable = occupancyList.reduce((sum, o) => sum + o.available_seats, 0) || 0
      const totalCapacity = areas.reduce((sum: number, a: StudyAreaData) => sum + (a.capacity || 0), 0)

      setStats({
        lowCrowdAreas: lowCrowd,
        mediumCrowdAreas: mediumCrowd,
        highCrowdAreas: highCrowd,
        totalStudentsInside: totalStudents,
        totalAvailableSeats: totalAvailable,
        totalCapacity,
      })

      setError(null)
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError)
      setError('Failed to load study areas')
      setLiveStudents([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [userId, fetchData])

  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [userId, fetchData])

  useEffect(() => {
    if (location.permissionStatus === 'granted' && !location.isTracking) {
      location.startTracking()
    }
  }, [location.permissionStatus, location.isTracking, location])

  useEffect(() => {
    if (!userId || !location.currentLocation) return
    fetchData()
  }, [userId, location.currentLocation, fetchData])

  const handleEnableLocation = async () => {
    await location.requestPermission()
  }

  const currentUserLocation = useMemo(() => {
    if (!location.currentLocation) return null
    return {
      latitude: location.currentLocation.latitude,
      longitude: location.currentLocation.longitude,
    }
  }, [location.currentLocation])

  const availableBuildings = useMemo(() => {
    const unique = new Set<string>()
    studyAreas.forEach((area) => {
      if (area.building && area.building.trim()) {
        unique.add(area.building.trim())
      }
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [studyAreas])

  const filteredAreas = useMemo(() => {
    return studyAreas.filter((area) => {
      const occupancy = occupancyData.get(area.study_area_id)
      const crowdStatus = (occupancy?.crowd_status || 'Low Crowd').toLowerCase()
      const areaName = area.area_name.toLowerCase()
      const building = (area.building || '').toLowerCase()

      const matchesSearch =
        searchTerm.trim().length === 0 ||
        areaName.includes(searchTerm.toLowerCase()) ||
        building.includes(searchTerm.toLowerCase())

      const matchesCrowd =
        crowdFilter === 'all' ||
        (crowdFilter === 'low' && crowdStatus.includes('low')) ||
        (crowdFilter === 'medium' && crowdStatus.includes('medium')) ||
        (crowdFilter === 'high' && crowdStatus.includes('high'))

      const matchesBuilding =
        buildingFilter === 'all' ||
        (area.building || '').toLowerCase() === buildingFilter.toLowerCase()

      const matchesFeature =
        featureFilter === 'all' ||
        (featureFilter === 'wifi' && area.wifi) ||
        (featureFilter === 'quiet' && area.silent_zone) ||
        (featureFilter === 'charging' && area.charging_ports) ||
        (featureFilter === 'ac' && area.ac)

      return matchesSearch && matchesCrowd && matchesBuilding && matchesFeature
    })
  }, [studyAreas, occupancyData, searchTerm, crowdFilter, buildingFilter, featureFilter])

  const gridItems = useMemo<StudyAreaGridItem[]>(() => {
    return filteredAreas.map((area) => {
      const occupancy = occupancyData.get(area.study_area_id)
      const latitude = area.lat ?? area.latitude
      const longitude = area.lng ?? area.longitude
      const insideUsers = liveStudents
        .filter((student) => student.study_area_id === area.study_area_id)
        .map((student) => ({
          id: student.id,
          label: student.label,
          joinedAt: student.joinedAt,
          latitude: student.latitude,
          longitude: student.longitude,
        }))
      const occupancySummary = calculateOccupancy(insideUsers.length, area.capacity)
      const crowdStatus = getCrowdStatusFromPercentage(occupancySummary.occupancyPercentage)

      return {
        id: area.study_area_id,
        name: area.area_name,
        building: area.building,
        latitude,
        longitude,
        radiusMeters: area.radius_meters,
        currentCount: occupancySummary.currentCount,
        availableSeats: occupancySummary.availableSeats,
        occupancyPercentage: occupancySummary.occupancyPercentage,
        crowdStatus,
        capacity: area.capacity,
        updatedAt: occupancy?.updated_at,
        insideUsers,
        features: {
          wifi: area.wifi,
          quietZone: area.silent_zone,
          cafe: area.cafe,
          chargingPorts: area.charging_ports,
          ac: area.ac,
        },
      }
    })
  }, [filteredAreas, liveStudents, occupancyData])

  const handleResetFilters = () => {
    setSearchTerm('')
    setCrowdFilter('all')
    setBuildingFilter('all')
    setFeatureFilter('all')
  }

  if (!userId) {
    return (
      <AppBackground>
        <div className="themed-page-main min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <EmptyState
              title="Please log in"
              description="You need an active StudyNest session to access live study area occupancy."
              icon={<AlertCircle className="h-10 w-10" />}
              action={
                <AppLinkButton href="/login/signIN" variant="primary">
                  Go to Login
                </AppLinkButton>
              }
            />
          </div>
        </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <MainHeader />

      <main className="themed-page-main min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:py-10">
          <AnimatedSection>
            <PageHeader
              eyebrow="Live Occupancy"
              title="Study Area Finder"
              subtitle="Discover the best study zones with real-time crowd signals, seat availability, and feature-based filtering."
              actions={
                <div className="flex flex-wrap gap-2">
                  <AppButton onClick={fetchData} variant="primary" aria-label="Refresh study area data">
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </AppButton>
                  {location.permissionStatus !== 'granted' ? (
                    <AppButton onClick={handleEnableLocation} variant="secondary" aria-label="Enable live location">
                      Enable Location
                    </AppButton>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                      Location On
                    </span>
                  )}
                </div>
              }
            />
          </AnimatedSection>

          <AnimatedSection className="mt-6" delay={0.04}>
            <StudyAreaSummary stats={stats} isLoading={isLoading} />
          </AnimatedSection>

          <AnimatedSection className="mt-6" delay={0.06}>
            <StudyAreaFilters
              searchTerm={searchTerm}
              crowdFilter={crowdFilter}
              buildingFilter={buildingFilter}
              featureFilter={featureFilter}
              availableBuildings={availableBuildings}
              visibleCount={filteredAreas.length}
              totalCount={studyAreas.length}
              onSearchChange={setSearchTerm}
              onCrowdChange={setCrowdFilter}
              onBuildingChange={setBuildingFilter}
              onFeatureChange={setFeatureFilter}
              onReset={handleResetFilters}
              onRefresh={fetchData}
              isRefreshing={isRefreshing}
            />
          </AnimatedSection>

          <AnimatedSection className="mt-6" delay={0.08}>
            <GlassCard className="p-5">
              <h2 className="mb-4 text-xl font-semibold text-[var(--text-main)]">All Study Areas</h2>
              <StudyAreaGrid
                isLoading={isLoading}
                items={gridItems}
                userLocation={currentUserLocation}
              />
            </GlassCard>
          </AnimatedSection>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="assertive"
              className="themed-panel-danger mt-6 flex items-start gap-3 rounded-xl p-4"
            >
              <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="mb-1 font-semibold">Error Loading Data</h3>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          <AnimatedSection className="mt-6" delay={0.12}>
            <GlassCard className="themed-panel-info p-6 text-center">
              <p className="themed-panel-title mb-2 text-sm">
                <strong>Your Privacy is Protected</strong>
              </p>
              <p className="themed-panel-copy text-sm">
                StudyNest only tracks aggregated occupancy counts. Your exact location is never stored
                permanently, displayed to other users, or shared. Location data automatically expires every 5
                minutes. You can revoke location access at any time.
              </p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </main>
    </AppBackground>
  )
}

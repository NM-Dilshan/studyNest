/**
 * Study Area Finder Page
 * Uses polling for occupancy updates instead of Supabase Realtime
 * 
 * Features:
 * - Location permission request
 * - GPS toggle button for quick enable/disable
 * - Polling-based occupancy updates
 * - Privacy-safe aggregated data only
 */

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import { useLocationTracking } from '@/hooks/useLocationTracking'
import { StudyAreaSummary } from '@/components/study-areas/StudyAreaSummary'
import { StudyAreaMap } from '@/components/study-areas/StudyAreaMap'
import { determineCrowdStatus, CrowdStatus } from '@/lib/geofence'
import { AlertCircle, MapPin, RefreshCcw } from 'lucide-react'
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
  study_area_id: string;
  area_name: string;
  building: string | null;
  capacity: number;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  radius_meters: number;
  wifi: boolean;
  charging_ports: boolean;
  silent_zone: boolean;
  ac: boolean;
  cafe?: boolean;
}

interface OccupancyData {
  occupancy_id: string;
  study_area_id: string;
  current_count: number;
  available_seats: number;
  occupancy_percentage: number;
  crowd_status: CrowdStatus;
  updated_at: string;
}

interface StudyAreaStats {
  lowCrowdAreas: number;
  mediumCrowdAreas: number;
  highCrowdAreas: number;
  totalStudentsInside: number;
  totalAvailableSeats: number;
  totalCapacity: number;
}

export default function StudyAreaFinderPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [studyAreas, setStudyAreas] = useState<StudyAreaData[]>([]);
  const [occupancyData, setOccupancyData] = useState<Map<string, OccupancyData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudyAreaStats | null>(null);
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [crowdFilter, setCrowdFilter] = useState<CrowdFilter>('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Location tracking
  const location = useLocationTracking(userId, true);

  // Get authenticated user from localStorage (set by signin)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.user_id);
      } else {
        setError('Please log in to use the Study Area Finder');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error getting user:', err);
      setError('Failed to authenticate');
      setIsLoading(false);
    }
  }, []);

  // Fetch study areas and occupancy data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/study-areas');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const areas = data.areas || [];
      
      setStudyAreas(areas);

      // Build occupancy map
      const occupancyMap = new Map<string, OccupancyData>();
      const occupancyList: OccupancyData[] = [];
      
      areas.forEach((area: any) => {
        if (area.area_occupancy) {
          const occupancy: OccupancyData = {
            occupancy_id: area.area_occupancy.occupancy_id,
            study_area_id: area.area_occupancy.study_area_id,
            current_count: area.area_occupancy.current_count,
            available_seats: area.area_occupancy.available_seats,
            occupancy_percentage: area.area_occupancy.occupancy_percentage,
            crowd_status: area.area_occupancy.crowd_status as CrowdStatus,
            updated_at: area.area_occupancy.updated_at,
          };
          occupancyMap.set(occupancy.study_area_id, occupancy);
          occupancyList.push(occupancy);
        }
      });
      
      setOccupancyData(occupancyMap);

      // Calculate stats
      const lowCrowd = occupancyList.filter((o) => o.crowd_status === 'Low Crowd').length || 0;
      const mediumCrowd = occupancyList.filter((o) => o.crowd_status === 'Medium Crowd').length || 0;
      const highCrowd = occupancyList.filter((o) => o.crowd_status === 'High Crowd').length || 0;
      const totalStudents = occupancyList.reduce((sum, o) => sum + o.current_count, 0) || 0;
      const totalAvailable = occupancyList.reduce((sum, o) => sum + o.available_seats, 0) || 0;
      const totalCapacity = areas.reduce((sum: number, a: StudyAreaData) => sum + (a.capacity || 0), 0);

      setStats({
        lowCrowdAreas: lowCrowd,
        mediumCrowdAreas: mediumCrowd,
        highCrowdAreas: highCrowd,
        totalStudentsInside: totalStudents,
        totalAvailableSeats: totalAvailable,
        totalCapacity: totalCapacity,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load study areas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Polling for occupancy updates (every 30 seconds instead of real-time)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [userId, fetchData]);

  // Auto-start tracking after permission granted
  useEffect(() => {
    if (location.permissionStatus === 'granted' && !location.isTracking) {
      location.startTracking();
    }
  }, [location.permissionStatus, location.isTracking, location]);

  const availableBuildings = useMemo(() => {
    const unique = new Set<string>();
    studyAreas.forEach((area) => {
      if (area.building && area.building.trim()) {
        unique.add(area.building.trim());
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [studyAreas]);

  const filteredAreas = useMemo(() => {
    return studyAreas.filter((area) => {
      const occupancy = occupancyData.get(area.study_area_id);
      const crowdStatus = (occupancy?.crowd_status || 'Low Crowd').toLowerCase();
      const areaName = area.area_name.toLowerCase();
      const building = (area.building || '').toLowerCase();

      const matchesSearch =
        searchTerm.trim().length === 0 ||
        areaName.includes(searchTerm.toLowerCase()) ||
        building.includes(searchTerm.toLowerCase());

      const matchesCrowd =
        crowdFilter === 'all' ||
        (crowdFilter === 'low' && crowdStatus.includes('low')) ||
        (crowdFilter === 'medium' && crowdStatus.includes('medium')) ||
        (crowdFilter === 'high' && crowdStatus.includes('high'));

      const matchesBuilding =
        buildingFilter === 'all' ||
        (area.building || '').toLowerCase() === buildingFilter.toLowerCase();

      const matchesFeature =
        featureFilter === 'all' ||
        (featureFilter === 'wifi' && area.wifi) ||
        (featureFilter === 'quiet' && area.silent_zone) ||
        (featureFilter === 'charging' && area.charging_ports) ||
        (featureFilter === 'ac' && area.ac);

      return matchesSearch && matchesCrowd && matchesBuilding && matchesFeature;
    });
  }, [studyAreas, occupancyData, searchTerm, crowdFilter, buildingFilter, featureFilter]);

  const gridItems = useMemo<StudyAreaGridItem[]>(() => {
    return filteredAreas.map((area) => {
      const occupancy = occupancyData.get(area.study_area_id);

      return {
        id: area.study_area_id,
        name: area.area_name,
        building: area.building,
        currentCount: occupancy?.current_count || 0,
        availableSeats: occupancy?.available_seats || area.capacity,
        occupancyPercentage: occupancy?.occupancy_percentage || 0,
        crowdStatus: occupancy?.crowd_status || 'Low Crowd',
        capacity: area.capacity,
        updatedAt: occupancy?.updated_at,
        features: {
          wifi: area.wifi,
          quietZone: area.silent_zone,
          cafe: area.cafe,
          chargingPorts: area.charging_ports,
          ac: area.ac,
        },
      };
    });
  }, [filteredAreas, occupancyData]);

  const mapAreas = useMemo(() => {
    return studyAreas
      .filter((area) => {
        const latitude = area.lat ?? area.latitude;
        const longitude = area.lng ?? area.longitude;
        return typeof latitude === 'number' && typeof longitude === 'number';
      })
      .map((area) => {
        const occupancy = occupancyData.get(area.study_area_id);
        const latitude = (area.lat ?? area.latitude) as number;
        const longitude = (area.lng ?? area.longitude) as number;

        return {
          id: area.study_area_id,
          name: area.area_name,
          latitude,
          longitude,
          radiusMeters: area.radius_meters,
          crowdStatus: occupancy?.crowd_status || 'Low Crowd',
          currentCount: occupancy?.current_count || 0,
          capacity: area.capacity,
        };
      });
  }, [studyAreas, occupancyData]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCrowdFilter('all');
    setBuildingFilter('all');
    setFeatureFilter('all');
  };

  if (!userId) {
    return (
      <AppBackground>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_45%,#020617_100%)] p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <EmptyState
              title="Please log in"
              description="You need an active StudyNest session to access live study area occupancy."
              icon={<AlertCircle className="h-10 w-10" />}
              action={
                <AppLinkButton
                  href="/login/signIN"
                  variant="primary"
                  className="text-slate-950"
                >
                  Go to Login
                </AppLinkButton>
              }
            />
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <MainHeader />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1e293b_0%,#0f172a_50%,#020617_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:py-10">
          <AnimatedSection>
            <PageHeader
              eyebrow="Live Occupancy"
              title="Study Area Finder"
              subtitle="Discover the best study zones with real-time crowd signals, seat availability, and feature-based filtering."
              actions={
                <AppButton
                  onClick={fetchData}
                  variant="primary"
                  className="bg-cyan-400/10 text-cyan-100"
                  aria-label="Refresh study area data"
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </AppButton>
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
            <GlassCard className="border-white/15 bg-slate-950/55 p-5">
              <h2 className="mb-4 text-xl font-semibold text-white">All Study Areas</h2>
              <StudyAreaGrid
                isLoading={isLoading}
                items={gridItems}
                onAreaHover={setHoveredAreaId}
              />
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection className="mt-6" delay={0.1}>
            <StudyAreaMap
              areas={mapAreas}
              hoveredAreaId={hoveredAreaId}
            />
          </AnimatedSection>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="assertive"
            className="mt-6 flex items-start gap-3 rounded-xl border border-rose-300/30 bg-rose-400/10 p-4"
          >
            <AlertCircle className="mt-0.5 flex-shrink-0 text-rose-200" size={20} />
            <div>
              <h3 className="mb-1 font-semibold text-rose-100">Error Loading Data</h3>
              <p className="text-sm text-rose-100/85">{error}</p>
            </div>
          </motion.div>
        )}

          <AnimatedSection className="mt-6" delay={0.12}>
            <GlassCard className="border-cyan-300/25 bg-cyan-400/10 p-6 text-center">
              <p className="mb-2 text-sm text-cyan-100">
                <strong>🔒 Your Privacy is Protected</strong>
              </p>
              <p className="text-sm text-cyan-100/85">
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

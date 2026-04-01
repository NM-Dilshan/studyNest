/**
 * Study Area Finder Page
 * Uses polling for occupancy updates instead of Supabase Realtime
 * 
 * Features:
 * - Location permission request
 * - Polling-based occupancy updates
 * - Privacy-safe aggregated data only
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { LocationPermissionBanner } from '@/components/study-areas/LocationPermissionBanner';
import { StudyAreaCard } from '@/components/study-areas/StudyAreaCard';
import { StudyAreaSummary } from '@/components/study-areas/StudyAreaSummary';
import { StudyAreaMap } from '@/components/study-areas/StudyAreaMap';
import { determineCrowdStatus, CrowdStatus } from '@/lib/geofence';
import { Loader, AlertCircle } from 'lucide-react';

interface StudyAreaData {
  study_area_id: string;
  area_name: string;
  building: string | null;
  capacity: number;
  lat: number;
  lng: number;
  radius_meters: number;
  wifi: boolean;
  charging_ports: boolean;
  silent_zone: boolean;
  ac: boolean;
  cafe: boolean;
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h1>
            <p className="text-gray-600 mb-6">
              You need to log in to the StudyNest app to use the Study Area Finder.
            </p>
            <a
              href="/login/signIN"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header currentPage="student-area" />

      {/* Study Area Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Area Finder</h1>
          <p className="text-gray-600">
            Check real-time crowd levels and find your perfect study space
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Location permission banner */}
        <div className="mb-8">
          <LocationPermissionBanner
            permissionStatus={location.permissionStatus}
            isTracking={location.isTracking}
            error={location.error}
            onRequestPermission={location.requestPermission}
            onRevoke={location.revokePermission}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="text-blue-600 animate-spin mr-3" size={24} />
            <span className="text-gray-600 font-medium">Loading study areas...</span>
          </div>
        )}

        {/* Summary cards and tips */}
        {!isLoading && <StudyAreaSummary stats={stats} />}

        {/* Study areas grid */}
        {!isLoading && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Study Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {studyAreas.map((area, index) => {
                const occupancy = occupancyData.get(area.study_area_id);
                const crowdStatus: CrowdStatus = occupancy?.crowd_status || 'Low Crowd';

                return (
                  <div
                    key={area.study_area_id || `area-${index}`}
                    onMouseEnter={() => setHoveredAreaId(area.study_area_id)}
                    onMouseLeave={() => setHoveredAreaId(null)}
                  >
                    <StudyAreaCard
                      id={area.study_area_id}
                      name={area.area_name}
                      currentCount={occupancy?.current_count || 0}
                      availableSeats={occupancy?.available_seats || area.capacity}
                      occupancyPercentage={occupancy?.occupancy_percentage || 0}
                      crowdStatus={crowdStatus}
                      lastUpdated={new Date(occupancy?.updated_at || new Date())}
                      capacity={area.capacity}
                      features={{
                        wifi: area.wifi,
                        quietZone: area.silent_zone,
                        café: area.cafe,
                        chargingPorts: area.charging_ports,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Map section */}
        {!isLoading && (
          <div className="mb-8">
            <StudyAreaMap
              areas={studyAreas.map((area) => {
                const occupancy = occupancyData.get(area.study_area_id);
                return {
                  id: area.study_area_id,
                  name: area.area_name,
                  latitude: area.lat,
                  longitude: area.lng,
                  radiusMeters: area.radius_meters,
                  crowdStatus: occupancy?.crowd_status || 'Low Crowd',
                  currentCount: occupancy?.current_count || 0,
                  capacity: area.capacity,
                };
              })}
              hoveredAreaId={hoveredAreaId}
            />
          </div>
        )}

        {/* Privacy statement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900 mb-2">
            <strong>🔒 Your Privacy is Protected</strong>
          </p>
          <p className="text-sm text-blue-700">
            StudyNest only tracks aggregated occupancy counts. Your exact location is never stored
            permanently, displayed to other users, or shared. Location data automatically expires every 5
            minutes. You can revoke location access at any time.
          </p>
        </div>
      </main>
    </div>
  );
}

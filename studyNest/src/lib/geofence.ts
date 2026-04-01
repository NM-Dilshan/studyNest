/**
<<<<<<< HEAD
 * Geofence Utility Functions
 * Privacy-safe location utilities for Study Area Finder
 * 
 * These functions help determine if a student's location falls within
 * a study area boundary without storing or displaying exact coordinates.
 */

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface CircularGeofence {
  type: 'circle';
  center: LocationPoint;
  radiusMeters: number;
}

export interface PolygonCoordinate {
  latitude: number;
  longitude: number;
}

export interface PolygonGeofence {
  type: 'polygon';
  coordinates: PolygonCoordinate[];
}

export type Geofence = CircularGeofence | PolygonGeofence;

/**
 * Haversine Formula: Calculate distance between two points on Earth
 * Returns distance in meters
 * 
 * @param point1 - First location (lat, lng)
 * @param point2 - Second location (lat, lng)
 * @returns Distance in meters
 */
export function haversineDistance(
  point1: LocationPoint,
  point2: LocationPoint
): number {
  const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1 = toRad(point1.latitude);
  const lon1 = toRad(point1.longitude);
  const lat2 = toRad(point2.latitude);
  const lon2 = toRad(point2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return distance;
}

/**
 * Check if a point is inside a circular geofence
 * 
 * @param point - Location to check
 * @param geofence - Circular geofence definition
 * @returns true if point is inside the circle
 */
export function isPointInCircle(
  point: LocationPoint,
  geofence: CircularGeofence
): boolean {
  const distance = haversineDistance(point, geofence.center);
  return distance <= geofence.radiusMeters;
}

/**
 * Ray Casting Algorithm: Check if a point is inside a polygon
 * Useful for irregular study area shapes
 * 
 * @param point - Location to check
 * @param polygon - Array of polygon coordinates
 * @returns true if point is inside the polygon
 */
export function isPointInPolygon(
  point: LocationPoint,
  polygon: PolygonCoordinate[]
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
    j = i;
  }

  return inside;
}

/**
 * Check if a point is inside any geofence (supports both circle and polygon)
 * 
 * @param point - Location to check
 * @param geofence - Geofence definition (circle or polygon)
 * @returns true if point is inside the geofence
 */
export function isPointInGeofence(
  point: LocationPoint,
  geofence: Geofence
): boolean {
  if (geofence.type === 'circle') {
    return isPointInCircle(point, geofence);
  } else if (geofence.type === 'polygon') {
    return isPointInPolygon(point, geofence.coordinates);
  }
  return false;
}

/**
 * Calculate occupancy percentage
 * 
 * @param currentCount - Number of students currently inside
 * @param capacity - Maximum capacity of the area
 * @returns Occupancy percentage (0-100)
 */
export function calculateOccupancyPercentage(
  currentCount: number,
  capacity: number
): number {
  if (capacity <= 0) return 0;
  const percentage = (currentCount / capacity) * 100;
  return Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
}

/**
 * Determine crowd status based on occupancy percentage
 * 
 * @param occupancyPercentage - Occupancy percentage (0-100)
 * @returns Crowd status label
 */
export type CrowdStatus = 'Low Crowd' | 'Medium Crowd' | 'High Crowd';

export function getCrowdStatus(occupancyPercentage: number): CrowdStatus {
  if (occupancyPercentage <= 30) {
    return 'Low Crowd';
  } else if (occupancyPercentage <= 70) {
    return 'Medium Crowd';
  } else {
    return 'High Crowd';
  }
}

/**
 * Get visual indicator for crowd status
 * 
 * @param status - Crowd status
 * @returns Object with color, icon, and description
 */
export function getCrowdIndicator(status: CrowdStatus) {
  const indicators: Record<CrowdStatus, { color: string; icon: string; bgColor: string }> = {
    'Low Crowd': {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: '✓',
    },
    'Medium Crowd': {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: '⚠',
    },
    'High Crowd': {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: '!',
    },
  };

  return indicators[status];
}

/**
 * Format location for logging (privacy-safe)
 * Returns hash or zone identifier instead of exact coordinates
 * 
 * @param point - Location point
 * @returns Anonymized location string
 */
export function getAnonymizedLocation(point: LocationPoint): string {
  // Simple hash-based anonymization: quantize to 2 decimal places
  // This gives ~1-1.5 km resolution, hiding exact location
  const latQuantized = Math.floor(point.latitude * 100) / 100;
  const lngQuantized = Math.floor(point.longitude * 100) / 100;
  return `Zone_${latQuantized}_${lngQuantized}`;
}

/**
 * Check if location update is meaningful (moved more than threshold)
 * Helps reduce unnecessary updates
 * 
 * @param oldLocation - Previous location
 * @param newLocation - Current location
 * @param thresholdMeters - Minimum distance to consider as meaningful (default: 10m)
 * @returns true if the movement is significant
 */
export function isMeaningfulLocationChange(
  oldLocation: LocationPoint | null,
  newLocation: LocationPoint,
  thresholdMeters: number = 10
): boolean {
  if (!oldLocation) return true;
  
  const distance = haversineDistance(oldLocation, newLocation);
  return distance >= thresholdMeters;
}

/**
 * Calculate center point of an area (for map visualization)
 * 
 * @param points - Array of location points
 * @returns Centroid point
 */
export function calculateCentroid(points: LocationPoint[]): LocationPoint {
  if (points.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sumLat = points.reduce((sum, p) => sum + p.latitude, 0);
  const sumLng = points.reduce((sum, p) => sum + p.longitude, 0);

  return {
    latitude: sumLat / points.length,
    longitude: sumLng / points.length,
  };
}

/**
 * Get time-remaining string for location expiry
 * 
 * @param expiresAt - Expiry timestamp
 * @returns Human-readable time remaining
 */
export function getTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
=======
 * Geofencing utilities for study area location tracking
 * Implements Haversine formula for distance calculation
 * and privacy-safe occupancy detection
 */

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 - latitude of point 1
 * @param lng1 - longitude of point 1
 * @param lat2 - latitude of point 2
 * @param lng2 - longitude of point 2
 * @returns distance in meters
 */
export function calculateDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check if a location is inside a study area radius
 * @param studentLat - student's current latitude
 * @param studentLng - student's current longitude
 * @param areaLat - study area center latitude
 * @param areaLng - study area center longitude
 * @param radiusMeters - study area radius in meters (default 20)
 * @returns true if inside the area, false otherwise
 */
export function isInsideStudyArea(
  studentLat: number,
  studentLng: number,
  areaLat: number,
  areaLng: number,
  radiusMeters: number = 20
): boolean {
  const distance = calculateDistanceInMeters(
    studentLat,
    studentLng,
    areaLat,
    areaLng
  );
  return distance <= radiusMeters;
}

/**
 * Determine crowd level based on occupancy percentage
 */
export function determineCrowdLevel(occupancyPercentage: number): string {
  if (occupancyPercentage <= 30) return 'Low Crowd';
  if (occupancyPercentage <= 70) return 'Medium Crowd';
  return 'High Crowd';
}

/**
 * Determine trend based on count change
 */
export function determineTrend(
  currentCount: number,
  previousCount: number | null
): string {
  if (previousCount === null) return 'Stable';
  
  const diff = currentCount - previousCount;
  if (diff > 3) return 'Getting crowded';
  if (diff < -3) return 'Getting quieter';
  return 'Stable';
}

/**
 * Calculate occupancy details for a study area
 */
export interface OccupancyDetails {
  currentCount: number;
  availableSeats: number;
  occupancyPercentage: number;
  crowdStatus: string;
  trendStatus: string;
}

export function calculateOccupancy(
  currentCount: number,
  capacity: number,
  previousCount?: number
): OccupancyDetails {
  const availableSeats = Math.max(0, capacity - currentCount);
  const occupancyPercentage =
    capacity > 0 ? (currentCount / capacity) * 100 : 0;

  return {
    currentCount,
    availableSeats,
    occupancyPercentage: Math.round(occupancyPercentage),
    crowdStatus: determineCrowdLevel(occupancyPercentage),
    trendStatus: determineTrend(currentCount, previousCount || null),
  };
}
>>>>>>> bc5bb4dc82db9d055375b41f02e7c8fa78f65cd0

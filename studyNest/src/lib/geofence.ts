/**
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

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a point is inside a circular geofence
 * @param point - Point to check
 * @param geofence - Circular geofence boundary
 * @returns true if point is inside, false otherwise
 */
export function isPointInsideCircular(
  point: LocationPoint,
  geofence: CircularGeofence
): boolean {
  const distance = haversineDistance(point, geofence.center);
  return distance <= geofence.radiusMeters;
}

/**
 * Ray casting algorithm: Check if a point is inside a polygon
 * @param point - Point to check
 * @param polygon - Polygon geofence boundary
 * @returns true if point is inside, false otherwise
 */
export function isPointInsidePolygon(
  point: LocationPoint,
  polygon: PolygonGeofence
): boolean {
  const coords = polygon.coordinates;
  let inside = false;

  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const { latitude: xi, longitude: yi } = coords[i];
    const { latitude: xj, longitude: yj } = coords[j];

    const xP = point.latitude;
    const yP = point.longitude;

    const intersect =
      yi > yP !== yj > yP && xP < ((xj - xi) * (yP - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Generic check if a point is inside any geofence
 * @param point - Point to check
 * @param geofence - Geofence boundary (circular or polygon)
 * @returns true if point is inside, false otherwise
 */
export function isPointInsideGeofence(
  point: LocationPoint,
  geofence: Geofence
): boolean {
  if (geofence.type === 'circle') {
    return isPointInsideCircular(point, geofence);
  } else if (geofence.type === 'polygon') {
    return isPointInsidePolygon(point, geofence);
  }
  return false;
}

/**
 * Types for crowd status
 */
export type CrowdStatus = 'Low Crowd' | 'Medium Crowd' | 'High Crowd';
export type TrendStatus = 'Getting crowded' | 'Getting quieter' | 'Stable';

export interface OccupancyDetails {
  currentCount: number;
  availableSeats: number;
  occupancyPercentage: number;
  crowdStatus: CrowdStatus;
  trendStatus: TrendStatus | null;
}

export interface LocationTrackingData {
  studyAreaId: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  expiresAt: Date; // 5 minutes from now
}

/**
 * Create a location tracking record with automatic expiration
 * @param studyAreaId - ID of the study area
 * @param userId - ID of the user
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @returns LocationTrackingData object with 5-minute expiration
 */
export function createLocationRecord(
  studyAreaId: string,
  userId: string,
  latitude: number,
  longitude: number
): LocationTrackingData {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

  return {
    studyAreaId,
    userId,
    latitude,
    longitude,
    timestamp: now,
    expiresAt,
  };
}

/**
 * Check if a location record has expired
 * @param record - Location tracking record
 * @returns true if expired, false otherwise
 */
export function isLocationExpired(record: LocationTrackingData): boolean {
  return new Date() > record.expiresAt;
}

/**
 * Filter out expired location records
 * @param records - Array of location tracking records
 * @returns Filtered array of non-expired records
 */
export function filterActiveLocations(
  records: LocationTrackingData[]
): LocationTrackingData[] {
  return records.filter((record) => !isLocationExpired(record));
}

/**
 * Calculate occupancy based on active location records
 * @param activeLocations - Array of active location tracking records
 * @param capacity - Study area capacity
 * @returns Current occupancy count
 */
export function calculateOccupancy(
  currentCount: number,
  capacity: number,
  previousCount?: number
): OccupancyDetails {
  return generateOccupancyDetails(currentCount, capacity, previousCount);
}

/**
 * Determine crowd level based on occupancy percentage
 * @param occupancyPercentage - Percentage of capacity occupied (0-100)
 * @returns Crowd status
 */
export function determineCrowdStatus(occupancyPercentage: number): CrowdStatus {
  if (occupancyPercentage <= 30) {
    return 'Low Crowd';
  } else if (occupancyPercentage <= 70) {
    return 'Medium Crowd';
  } else {
    return 'High Crowd';
  }
}

/**
 * Determine trend based on previous and current count
 * @param currentCount - Current number of people
 * @param previousCount - Previous number of people (or null if no data)
 * @returns Trend status
 */
export function determineTrend(
  currentCount: number,
  previousCount: number | null
): TrendStatus | null {
  if (previousCount === null) {
    return null;
  }

  const diff = currentCount - previousCount;
  const threshold = 2; // Minimum change to report a trend

  if (diff > threshold) {
    return 'Getting crowded';
  } else if (diff < -threshold) {
    return 'Getting quieter';
  } else {
    return 'Stable';
  }
}

/**
 * Get crowd status emoji for visualization
 * @param status - Crowd status
 * @returns Emoji representation
 */
export function getCrowdEmoji(status: CrowdStatus): string {
  switch (status) {
    case 'Low Crowd':
      return '🟢';
    case 'Medium Crowd':
      return '🟡';
    case 'High Crowd':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Get trend emoji for visualization
 * @param status - Trend status
 * @returns Emoji representation
 */
export function getTrendEmoji(status: TrendStatus | null): string {
  switch (status) {
    case 'Getting crowded':
      return '📈';
    case 'Getting quieter':
      return '📉';
    case 'Stable':
      return '↔️';
    default:
      return '⏸️';
  }
}

/**
 * Get time remaining before expiration
 * Formatted as: "Xm Ys" or "Xs"
 * @param expiresAt - Expiration timestamp
 * @returns Formatted time string
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

/**
 * Generate occupancy details for a study area
 * @param currentCount - Current number of people in study area
 * @param capacity - Total capacity of study area
 * @param previousCount - Previous count for trend calculation (optional)
 * @returns OccupancyDetails object
 */
export function generateOccupancyDetails(
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
    crowdStatus: determineCrowdStatus(occupancyPercentage),
    trendStatus: determineTrend(currentCount, previousCount || null),
  };
}

/**
 * Check if location change is meaningful (above threshold distance)
 * Used to avoid unnecessary API calls for minor movements
 * @param lastLocation - Previous location or null if no previous location
 * @param newLocation - Current location with latitude and longitude
 * @param thresholdMeters - Minimum distance in meters to be considered meaningful
 * @returns true if change is meaningful (distance > threshold or first location), false otherwise
 */
export function isMeaningfulLocationChange(
  lastLocation: { latitude: number; longitude: number } | null,
  newLocation: { latitude: number; longitude: number },
  thresholdMeters: number
): boolean {
  // First location is always meaningful
  if (!lastLocation) {
    return true;
  }

  // Calculate distance between last and new location
  const distance = haversineDistance(
    { latitude: lastLocation.latitude, longitude: lastLocation.longitude },
    { latitude: newLocation.latitude, longitude: newLocation.longitude }
  );

  // Return true if distance exceeds threshold
  return distance > thresholdMeters;
}

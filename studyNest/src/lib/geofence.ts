/**
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

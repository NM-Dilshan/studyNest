/**
 * Location utilities for browser geolocation API
 * Handles privacy-safe location tracking
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

/**
 * Request location permission from the user
 * Returns location data or null if denied
 */
export function requestLocationPermission(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        // Return null on any error (permission denied, location unavailable, etc.)
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch user's location and call callback on each update
 * Returns unwatchId to stop watching
 */
export function watchLocationUpdates(
  callback: (location: LocationData) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      console.warn('Location watch error:', error.message);
      if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000, // Cache position for max 1 second
    }
  );

  return watchId;
}

/**
 * Stop watching location updates
 */
export function stopLocationWatch(watchId: number): void {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Format timestamp for display
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

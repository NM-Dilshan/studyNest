import { useEffect, useState, useCallback } from 'react';

interface UseLocationOptions {
  userId: string;
  updateInterval?: number; // milliseconds between location updates
}

export function useLocation({ userId, updateInterval = 60000 }: UseLocationOptions) {
  const [enabled, setEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Send location to backend API
   */
  const sendLocation = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const response = await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            userId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Location update failed:', error);
          setLastError(error.error || 'Failed to update location');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Location update error:', err);
        setLastError(errorMsg);
      }
    },
    [userId]
  );

  /**
   * Start watching location with geolocation API
   */
  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLastError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLastError(error.message || 'Failed to get location');
      },
      {
        enableHighAccuracy: false, // trade accuracy for battery life
        maximumAge: 60000, // accept location up to 1 minute old
        timeout: 10000, // 10 second timeout
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [sendLocation]);

  /**
   * Request permission and start tracking
   */
  const requestPermission = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermissionState('denied');
      setLastError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionState('granted');
        setEnabled(true);
        startTracking();
      },
      (error) => {
        console.error('Permission denied:', error);
        setPermissionState('denied');
        setLastError('Location permission denied');
      },
      {
        timeout: 5000,
      }
    );
  }, [startTracking]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setEnabled(false);
    setIsTracking(false);
  }, [watchId]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    enabled,
    permissionState,
    requestPermission,
    stopTracking,
    isTracking,
    lastError,
  };
}

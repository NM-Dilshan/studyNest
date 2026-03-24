/**
 * useLocationTracking Hook
 * Manages browser geolocation permission and live location updates
 * Privacy-safe: only collects location with explicit user permission
 * Uses Prisma via API calls (no Supabase)
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { isMeaningfulLocationChange } from '@/lib/geofence';

export type PermissionStatus = 'prompt' | 'granted' | 'denied';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface UseLocationTrackingReturn {
  // Current state
  permissionStatus: PermissionStatus;
  currentLocation: LocationData | null;
  isTracking: boolean;
  error: string | null;

  // Actions
  requestPermission: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  revokePermission: () => Promise<void>;
}

const DEFAULT_LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const DEFAULT_MEANINGFUL_CHANGE_THRESHOLD = 10; // 10 meters

export function useLocationTracking(
  userId: string | null,
  enabled: boolean = true
): UseLocationTrackingReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<LocationData | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request browser permission for geolocation
   */
  const requestPermission = useCallback(async () => {
    try {
      setError(null);

      // Check if geolocation is available
      if (!navigator.geolocation) {
        setError('Geolocation not supported in your browser');
        setPermissionStatus('denied');
        return;
      }

      // Request permission
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus('granted');
          const locData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || null,
            timestamp: position.timestamp,
          };
          setCurrentLocation(locData);
          lastLocationRef.current = locData;

          // Record permission in database
          if (userId) {
            recordPermissionStatus(userId, 'granted');
          }
        },
        (err) => {
          const deniedReasons: Record<GeolocationPositionError['code'], string> = {
            1: 'Location permission denied',
            2: 'Position unavailable',
            3: 'Request timeout',
          };
          const errorMsg = deniedReasons[err.code] || 'Unknown error';
          setError(errorMsg);
          setPermissionStatus('denied');

          if (userId) {
            recordPermissionStatus(userId, 'denied');
          }
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setPermissionStatus('denied');
    }
  }, [userId]);

  /**
   * Start tracking location changes
   */
  const startTracking = useCallback(() => {
    if (!enabled || !userId || !permissionStatus || permissionStatus !== 'granted') {
      setError('Permission required to track location');
      return;
    }

    try {
      setIsTracking(true);
      setError(null);

      // Use watchPosition for continuous updates
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || null,
            timestamp: position.timestamp,
          };

          // Check if movement is meaningful before updating
          if (!isMeaningfulLocationChange(lastLocationRef.current, newLocation, DEFAULT_MEANINGFUL_CHANGE_THRESHOLD)) {
            return;
          }

          setCurrentLocation(newLocation);
          lastLocationRef.current = newLocation;

          // Send to backend
          await sendLocationUpdate(userId, newLocation);
        },
        (err) => {
          const deniedReasons: Record<GeolocationPositionError['code'], string> = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout',
          };
          setError(deniedReasons[err.code] || 'Error tracking location');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsTracking(false);
    }
  }, [enabled, userId, permissionStatus]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  /**
   * Revoke location permission
   */
  const revokePermission = useCallback(async () => {
    stopTracking();
    setPermissionStatus('denied');
    setCurrentLocation(null);
    lastLocationRef.current = null;

    if (userId) {
      await recordPermissionStatus(userId, 'revoked');
    }
  }, [userId, stopTracking]);

  /**
   * Send location update to backend
   */
  const sendLocationUpdate = async (uid: string, location: LocationData) => {
    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          userId: uid,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send location update:', response.statusText);
      }
    } catch (err) {
      console.error('Error sending location update:', err);
    }
  };

  /**
   * Record permission status in database via API
   */
  const recordPermissionStatus = async (uid: string, status: 'granted' | 'denied' | 'revoked') => {
    try {
      const response = await fetch('/api/location-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,
          permission_status: status,
          granted_at: status === 'granted' ? new Date().toISOString() : null,
          last_used_at: new Date().toISOString(),
          revoked_at: status === 'revoked' ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to record permission status:', response.statusText);
      }
    } catch (err) {
      console.error('Error recording permission status:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  // Auto-request permission on mount if user is logged in
  useEffect(() => {
    if (enabled && userId && permissionStatus === 'prompt') {
      // Don't auto-request, wait for user action
    }
  }, [enabled, userId, permissionStatus]);

  return {
    permissionStatus,
    currentLocation,
    isTracking,
    error,
    requestPermission,
    startTracking,
    stopTracking,
    revokePermission,
  };
}

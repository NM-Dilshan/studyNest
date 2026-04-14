/**
 * LocationPermissionBanner Component
 * Prompts user to grant location permission for occupancy tracking
 * Privacy-focused: clear about what data is collected
 */

'use client';

import { useState } from 'react';
import { AlertCircle, MapPin, X } from 'lucide-react';
import { PermissionStatus } from '@/hooks/useLocationTracking';

interface LocationPermissionBannerProps {
  permissionStatus: PermissionStatus;
  isTracking: boolean;
  error: string | null;
  onRequestPermission: () => Promise<void>;
  onRevoke: () => Promise<void>;
}

export function LocationPermissionBanner({
  permissionStatus,
  isTracking,
  error,
  onRequestPermission,
  onRevoke,
}: LocationPermissionBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (permissionStatus === 'granted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-4">
        <MapPin className="text-green-600 mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900 mb-1">Location Tracking Active</h3>
          <p className="text-sm text-green-700 mb-3">
            Your location is being used to calculate study area occupancy. 
            <strong> Your exact location is private</strong> — only aggregated counts are shown.
          </p>
          <div className="flex gap-3">
            {isTracking ? (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ✓ Tracking
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                ⚪ Paused
              </span>
            )}
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  await onRevoke();
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              {isLoading ? 'Revoking...' : 'Revoke Permission'}
            </button>
          </div>
        </div>
        <button onClick={() => setIsDismissed(true)} className="text-green-400 hover:text-green-600">
          <X size={20} />
        </button>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4">
        <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Location Permission Denied</h3>
          <p className="text-sm text-amber-700 mb-3">
            You denied location permission. To see live occupancy updates, you'll need to enable 
            location access in your browser settings.
          </p>
        </div>
        <button onClick={() => setIsDismissed(true)} className="text-amber-400 hover:text-amber-600">
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4">
      <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
      <div className="flex-1">
        <h3 className="font-semibold text-blue-900 mb-1">Help Us Show Live Crowding</h3>
        <p className="text-sm text-blue-700 mb-3">
          Enable location access to contribute to real-time occupancy updates. 
          <strong> Your exact location stays private</strong> — we only use aggregated counts.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">Error: {error}</p>}
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              await onRequestPermission();
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Requesting...' : 'Enable Location'}
        </button>
      </div>
      <button onClick={() => setIsDismissed(true)} className="text-blue-400 hover:text-blue-600">
        <X size={20} />
      </button>
    </div>
  );
}

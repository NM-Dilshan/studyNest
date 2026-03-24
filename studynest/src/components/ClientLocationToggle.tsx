'use client';
import { useEffect, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';

export default function ClientLocationToggle({ userId }: { userId: string }) {
  const { enabled, permissionState, requestPermission, stopTracking, isTracking, lastError } =
    useLocation({ userId });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (permissionState === 'denied') {
    return (
      <div className="text-sm text-red-600">
        Location access denied. Please enable location access in your browser settings to participate in real-time tracking.
      </div>
    );
  }

  if (enabled && isTracking) {
    return (
      <button
        onClick={stopTracking}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition"
      >
        ✓ Sharing Location (Click to stop)
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={requestPermission}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Share Location (anonymized)
      </button>
      {lastError && <p className="text-xs text-red-500">{lastError}</p>}
    </div>
  );
}

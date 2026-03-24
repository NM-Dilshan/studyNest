import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, StudyPurpose } from '../types/halls';

const STORAGE_KEY = 'studynest_user_preferences';

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  preferred_buildings: [],
  preferred_purpose: 'general' as StudyPurpose,
  group_size: 1,
  require_projector: false,
  require_wifi: false,
  require_ac: false,
  require_whiteboard: false,
  require_accessibility: false,
  require_power: false,
  quiet_zone: false,
};

export function useUserPreferences(userId: string | undefined) {
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  const fetchPreferences = useCallback(() => {
    if (!userId) return;
    try {
      setLoading(true);
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!userId) return;
    try {
      setLoading(true);
      const updated = { ...preferences, ...newPrefs, user_id: userId };
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      setPreferences(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return { preferences, loading, error, updatePreferences };
}

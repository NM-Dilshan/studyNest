import { useState, useCallback } from 'react';
import { SuitabilityScore, UserPreferences, FreeHallResult } from '../types/halls';

/**
 * Computes suitability scores client-side by comparing
 * hall facilities against user preferences.
 */
export function useSuitabilityScores() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeScores = useCallback(async (
    hallIds: string[],
    preferences: Partial<UserPreferences> | null,
    halls?: FreeHallResult[]
  ): Promise<SuitabilityScore[]> => {
    if (!preferences || hallIds.length === 0) return [];

    try {
      setLoading(true);

      const scores: SuitabilityScore[] = hallIds.map(hallId => {
        const hall = halls?.find(h => h.id === hallId);
        if (!hall) return { hall_id: hallId, score: 50, breakdown: {} };

        let score = 50; // Base score
        const breakdown: Record<string, number | boolean | string> = {};

        // Capacity match (up to 20 points)
        const groupSize = preferences.group_size || 1;
        if (hall.capacity >= groupSize) {
          const ratio = Math.min(groupSize / hall.capacity, 1);
          // Best score when hall capacity reasonably fits group (not too large)
          const capacityScore = ratio > 0.3 ? 20 : Math.round(ratio * 20);
          score += capacityScore;
          breakdown.capacity = capacityScore;
        }

        // Facility matching (up to 30 points, 5 each)
        const facilityChecks = [
          { pref: preferences.require_projector, has: hall.projector, name: 'projector' },
          { pref: preferences.require_wifi, has: hall.wifi, name: 'wifi' },
          { pref: preferences.require_ac, has: hall.ac, name: 'ac' },
          { pref: preferences.require_whiteboard, has: hall.whiteboard, name: 'whiteboard' },
          { pref: preferences.require_accessibility, has: hall.wheelchair_accessible, name: 'accessibility' },
          { pref: preferences.require_power, has: hall.power_sockets, name: 'power' },
        ];

        let facilityScore = 0;
        for (const check of facilityChecks) {
          if (check.pref) {
            if (check.has) {
              facilityScore += 5;
              breakdown[check.name] = true;
            } else {
              score -= 5; // Penalty for missing required facility
              breakdown[check.name] = false;
            }
          }
        }
        score += facilityScore;

        // Free-now bonus
        const canBookNow = hall.can_book_now ?? hall.is_free_now;
        if (canBookNow) {
          score += 10;
          breakdown.free_now = 10;
        } else {
          score -= 5;
          breakdown.free_now = 0;
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        return { hall_id: hallId, score, breakdown };
      });

      setError(null);
      return scores;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to compute scores';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { computeScores, loading, error };
}

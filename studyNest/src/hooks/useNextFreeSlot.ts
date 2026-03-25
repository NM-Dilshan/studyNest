import { useState } from 'react';
import { NextFreeSlot } from '../types/halls';

export function useNextFreeSlot() {
  const [slots, setSlots] = useState<NextFreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextSlots = async () => {
    try {
      setLoading(true);
      // For now, this is a no-op since the API doesn't support this yet.
      // The free halls API already tells us which halls are free.
      setSlots([]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch next free slots');
    } finally {
      setLoading(false);
    }
  };

  return { slots, loading, error, fetchNextSlots };
}

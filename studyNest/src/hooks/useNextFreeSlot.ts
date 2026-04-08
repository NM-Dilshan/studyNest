import { useState } from 'react';
import { NextFreeSlot } from '../types/halls';

interface FreeHallApiItem {
  id: string;
  next_free_start?: string | null;
  next_free_end?: string | null;
}

export function useNextFreeSlot() {
  const [slots, setSlots] = useState<NextFreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/free-halls');
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch next free slots');
      }

      const halls = (json.data || []) as FreeHallApiItem[];

      const computed: NextFreeSlot[] = halls
        .filter((hall) => Boolean(hall.next_free_start))
        .map((hall) => ({
          hall_id: hall.id,
          start_time: hall.next_free_start as string,
          end_time: hall.next_free_end || '20:00:00',
        }));

      setSlots(computed);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch next free slots';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { slots, loading, error, fetchNextSlots };
}

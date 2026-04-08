import { useState, useEffect } from 'react';
import { FreeHallResult } from '../types/halls';

export function useFreeHalls() {
  const [halls, setHalls] = useState<FreeHallResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/free-halls');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setHalls(json.data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch free halls';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
    const interval = setInterval(fetchHalls, 60 * 1000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { halls, loading, error, lastUpdated, refetch: fetchHalls };
}

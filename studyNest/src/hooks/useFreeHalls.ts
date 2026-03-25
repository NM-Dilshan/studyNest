import { useState, useEffect } from 'react';
import { FreeHallResult } from '../types/halls';

export function useFreeHalls() {
  const [halls, setHalls] = useState<FreeHallResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/free-halls');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setHalls(json.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch free halls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
    const interval = setInterval(fetchHalls, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { halls, loading, error, refetch: fetchHalls };
}

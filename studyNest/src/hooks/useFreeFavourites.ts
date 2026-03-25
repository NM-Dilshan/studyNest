import { useState, useEffect } from 'react';

interface FavouriteHall {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
}

export function useFreeFavourites(userId: string | undefined) {
  const [favourites, setFavourites] = useState<FavouriteHall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavourites = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/student/favourites?userId=${userId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setFavourites(json.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch free favourites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavourites();
    }
  }, [userId]);

  return { favourites, loading, error, refetch: fetchFavourites };
}

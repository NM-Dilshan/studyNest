export const favouriteService = {
  async addFavourite(userId: string, hallId: string): Promise<void> {
    const res = await fetch('/api/student/favourites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hallId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to add favourite');
  },

  async removeFavourite(userId: string, hallId: string): Promise<void> {
    const res = await fetch('/api/student/favourites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hallId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to remove favourite');
  },

  async getFavourites(userId: string): Promise<{ hall_id: string }[]> {
    const res = await fetch(`/api/student/favourites?userId=${userId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch favourites');
    return (json.data || []).map((item: any) => ({ hall_id: item.id }));
  },
};

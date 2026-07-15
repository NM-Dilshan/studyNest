import { LectureHall } from '../types/halls';

export const conflictService = {
  async updateConflictStatus(hallId: string, status: LectureHall['maintenance_status']): Promise<void> {
    // Use the existing lecture-halls API (Prisma) instead of Supabase
    // First fetch the current hall data so we can send the required fields
    const getRes = await fetch(`/api/lecture-halls/${hallId}`);
    const getJson = await getRes.json();
    if (!getJson.success) throw new Error(getJson.error || 'Failed to fetch hall data');

    const hall = getJson.data;

    // Update via PUT with all required fields + the new maintenance_status
    const res = await fetch(`/api/lecture-halls/${hallId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hall_name: hall.hall_name,
        building: hall.building,
        floor: hall.floor,
        capacity: hall.capacity,
        hall_type: hall.hall_type,
        projector: hall.projector,
        wifi: hall.wifi,
        ac: hall.ac,
        whiteboard: hall.whiteboard,
        maintenance_status: status,
      }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update conflict status');
  },

  async getConflictedHalls(): Promise<LectureHall[]> {
    const res = await fetch('/api/lecture-halls');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch halls');

    return (json.data || [])
      .filter((hall: any) => hall.maintenance_status !== 'available')
      .map((hall: any) => ({
        id: hall.hall_id,
        name: hall.hall_name,
        building: hall.building || '',
        floor: hall.floor || 0,
        capacity: hall.capacity || 0,
        is_active: hall.is_active ?? true,
        maintenance_status: hall.maintenance_status || 'available',
        latitude: null,
        longitude: null,
        created_at: hall.created_at,
        updated_at: hall.created_at,
      }));
  }
};

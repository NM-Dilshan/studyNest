import { LectureHall } from '../types/halls';

export const hallService = {
  async getLectureHalls(): Promise<LectureHall[]> {
    const res = await fetch('/api/lecture-halls');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch lecture halls');

    // Map from DB field names to LectureHall type
    return (json.data || json.halls || []).map((hall: any) => ({
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
      projector: hall.projector || false,
      wifi: hall.wifi || false,
      ac: hall.ac || false,
      whiteboard: hall.whiteboard || false,
      wheelchair_accessible: false,
      power_sockets: false,
    }));
  },

  async createHall(hallData: Partial<LectureHall>): Promise<LectureHall> {
    const res = await fetch('/api/lecture-halls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hallData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create hall');
    return json.data;
  },

  async updateHall(id: string, updates: Partial<LectureHall>): Promise<LectureHall> {
    const res = await fetch(`/api/lecture-halls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update hall');
    return json.data;
  },

  async softDeleteHall(id: string): Promise<void> {
    const res = await fetch(`/api/lecture-halls/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete hall');
  }
};

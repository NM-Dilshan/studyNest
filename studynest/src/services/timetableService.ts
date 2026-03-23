import { TimetableSlot } from '../types/halls';

export const timetableService = {
  async getTimetable(hallId?: string): Promise<TimetableSlot[]> {
    const url = hallId
      ? `/api/timetable?hall_id=${hallId}`
      : '/api/timetable';

    const res = await fetch(url);
    const json = await res.json();

    if (!json.success) throw new Error(json.error || 'Failed to fetch timetable');
    return json.data || [];
  },

  async createSlot(slotData: Partial<TimetableSlot>): Promise<TimetableSlot> {
    const res = await fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create slot');
    return json.data;
  },

  async updateSlot(id: number, updates: Partial<TimetableSlot>): Promise<TimetableSlot> {
    const res = await fetch(`/api/timetable/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update slot');
    return json.data;
  },

  async deleteSlot(id: number): Promise<void> {
    const res = await fetch(`/api/timetable/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete slot');
  },

  async bulkInsertFromCSV(records: Partial<TimetableSlot>[]): Promise<{ count: number; errors?: string[] }> {
    const res = await fetch('/api/timetable/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to bulk insert');
    return { count: json.count, errors: json.errors };
  }
};

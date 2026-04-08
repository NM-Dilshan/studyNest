import { TimetableSlot } from '../types/halls';

export const timetableService = {
  /**
   * Fetch timetable slots.
   * - No params → all sessions
   * - hallId = UUID → filter by specific hall
   * - unassigned = true → filter sessions with no hall
   */
  async getTimetable(
    hallId?: string,
    academicYear?: number,
    semester?: number,
    unassigned?: boolean
  ): Promise<TimetableSlot[]> {
    const params = new URLSearchParams();
    if (unassigned) {
      params.set('unassigned', 'true');
    } else if (hallId) {
      params.set('hall_id', hallId);
    }
    if (academicYear) params.set('academic_year', String(academicYear));
    if (semester) params.set('semester', String(semester));

    const url = `/api/timetable${params.toString() ? '?' + params.toString() : ''}`;

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

  async deleteSlot(id: number | string): Promise<void> {
    const normalizedId = Number(id);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      console.error('[timetableService.deleteSlot] Invalid slot id received from UI:', id);
      throw new Error('Invalid timetable slot ID');
    }

    console.info('[timetableService.deleteSlot] Deleting timetable slot with ID:', normalizedId);

    const res = await fetch(`/api/timetable/${normalizedId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    console.info('[timetableService.deleteSlot] Delete response:', {
      requestedId: normalizedId,
      success: json?.success,
      error: json?.error,
      status: res.status,
    });
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

import { LectureHall } from '../types/halls';

const ensureJsonResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') ?? '';
  const bodyText = await res.text();

  if (!bodyText.trim()) {
    throw new Error(`Empty response from server (status ${res.status})`);
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}`);
  }

  try {
    return JSON.parse(bodyText);
  } catch (error) {
    console.error('Failed to parse lecture hall API response:', bodyText);
    throw new Error('Received malformed JSON response from server');
  }
};

const parseJsonApiResponse = async (res: Response) => {
  const json = await ensureJsonResponse(res);

  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Lecture hall API request failed with status ${res.status}`);
  }

  return json;
};

export const hallService = {
  async getLectureHalls(): Promise<LectureHall[]> {
    const res = await fetch('/api/lecture-halls');
    const json = await parseJsonApiResponse(res);

    // Map from DB field names to LectureHall type
    return (json.data || []).map((hall: any) => ({
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
    const json = await parseJsonApiResponse(res);
    return json.data;
  },

  async updateHall(id: string, updates: Partial<LectureHall>): Promise<LectureHall> {
    const res = await fetch(`/api/lecture-halls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await parseJsonApiResponse(res);
    return json.data;
  },

  async softDeleteHall(id: string): Promise<void> {
    const res = await fetch(`/api/lecture-halls/${id}`, {
      method: 'DELETE',
    });
    await parseJsonApiResponse(res);
  }
};

import { supabase } from '../lib/supabase';
import { LectureHall } from '../types/halls';

export const conflictService = {
  async updateConflictStatus(hallId: string, status: LectureHall['maintenance_status']): Promise<void> {
    const { error } = await supabase
      .from('halls')
      .update({ maintenance_status: status })
      .eq('id', hallId);
      
    if (error) throw error;
  },

  async getConflictedHalls(): Promise<LectureHall[]> {
    const { data, error } = await supabase
      .from('halls')
      .select('*')
      .neq('maintenance_status', 'available')
      .eq('is_active', true);
      
    if (error) throw error;
    return data as LectureHall[];
  }
};

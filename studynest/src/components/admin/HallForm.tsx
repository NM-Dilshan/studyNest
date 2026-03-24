import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { LectureHall } from '../../types/halls';
import { hallService } from '../../services/hallService';

interface HallFormProps {
  initialData?: LectureHall;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HallForm({ initialData, onSuccess, onCancel }: HallFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LectureHall>>(initialData || {
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    latitude: null,
    longitude: null,
    is_active: true,
    maintenance_status: 'available',
    projector: false,
    wifi: false,
    ac: false,
    whiteboard: false,
    wheelchair_accessible: false,
    power_sockets: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (initialData?.id) {
        await hallService.updateHall(initialData.id, formData);
      } else {
        await hallService.createHall(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save hall');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/40 dark:border-white/10 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <X className="w-5 h-5"/>
        </button>
        
        <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
          {initialData ? 'Edit Lecture Hall' : 'Create New Hall'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Name / Designation</label>
              <input 
                type="text" required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Building</label>
              <input 
                type="text" required
                value={formData.building || ''}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Floor</label>
              <input 
                type="number" required
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Capacity (Seats)</label>
              <input 
                type="number" required min="1"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
              />
            </div>
          </div>

          <div className="bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 mb-3">
              <MapPin className="w-4 h-4" /> Geolocation (Optional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500 dark:text-neutral-500">Latitude</label>
                <input 
                  type="number" step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                  className="w-full bg-white dark:bg-neutral-900 border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm text-neutral-900 dark:text-white shadow-sm"
                  placeholder="e.g. 6.9412"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500 dark:text-neutral-500">Longitude</label>
                <input 
                  type="number" step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                  className="w-full bg-white dark:bg-neutral-900 border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm text-neutral-900 dark:text-white shadow-sm"
                  placeholder="e.g. 79.8821"
                />
              </div>
            </div>
          </div>

          {!initialData && (
            <div className="text-sm text-neutral-500 italic mt-2">
              Note: Base facilities (WiFi, AC, etc.) can be configured after creation using the inline facility editor on the Hall Manager page.
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Hall'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

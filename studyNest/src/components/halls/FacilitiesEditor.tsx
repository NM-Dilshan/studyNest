import React, { useState } from 'react';
import { Monitor, Wifi, Wind, Pencil, Accessibility, Plug, CheckCircle2 } from 'lucide-react';
import { hallService } from '../../services/hallService';
import { LectureHall } from '../../types/halls';

interface FacilitiesEditorProps {
  hall: LectureHall;
  onUpdate: (updatedHall: LectureHall) => void;
}

export function FacilitiesEditor({ hall, onUpdate }: FacilitiesEditorProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const toggleFacility = async (facilityKey: keyof LectureHall) => {
    try {
      setSaving(true);
      const newValue = !hall[facilityKey];
      const updated = await hallService.updateHall(hall.id, { [facilityKey]: newValue });
      onUpdate(updated);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to update facility', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const facilities = [
    { key: 'projector', label: 'Projector', icon: Monitor },
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'ac', label: 'A/C', icon: Wind },
    { key: 'whiteboard', label: 'Whiteboard', icon: Pencil },
    { key: 'wheelchair_accessible', label: 'Wheelchair Access', icon: Accessibility },
    { key: 'power_sockets', label: 'Power Sockets', icon: Plug },
  ] as const;

  return (
    <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-neutral-900 dark:text-white">Facilities</h4>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {saving && <span className="animate-pulse">Saving...</span>}
          {!saving && lastSaved && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {facilities.map(({ key, label, icon: Icon }) => {
          const isActive = !!hall[key];
          return (
            <button
              key={key}
              onClick={() => toggleFacility(key)}
              disabled={saving}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all text-left
                ${isActive 
                  ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                  : 'border-white/40 dark:border-neutral-700/50 bg-white/40 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-800/60'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-blue-500 text-white shadow-sm' : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 truncate">{label}</span>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 border border-black/5 dark:border-white/5 ${isActive ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

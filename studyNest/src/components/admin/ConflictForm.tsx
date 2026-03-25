import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { LectureHall } from '../../types/halls';
import { conflictService } from '../../services/conflictService';

interface ConflictFormProps {
  hall: LectureHall;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConflictForm({ hall, onSuccess, onCancel }: ConflictFormProps) {
  const [status, setStatus] = useState<LectureHall['maintenance_status']>(hall.maintenance_status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await conflictService.updateConflictStatus(hall.id, status);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update conflict status');
    } finally {
      setLoading(false);
    }
  };

  const options: { value: LectureHall['maintenance_status'], label: string, color: string }[] = [
    { value: 'available', label: 'Available (Normal Operation)', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
    { value: 'under_maintenance', label: 'Under Maintenance', color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200' },
    { value: 'reserved_exam', label: 'Reserved for Examination', color: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200' },
    { value: 'reserved_event', label: 'Reserved for Special Event', color: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200' },
    { value: 'closed', label: 'Closed Indefinitely', color: 'text-neutral-700 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800' },
  ];

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/40 dark:border-white/10 shadow-2xl max-w-md w-full relative">
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <X className="w-5 h-5"/>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Status Override</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-6">Change operational status for <strong className="text-neutral-800 dark:text-neutral-200">{hall.name}</strong>. This overrides normal timetable availability.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {options.map((opt) => (
            <label 
              key={opt.value} 
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                status === opt.value 
                  ? `border-blue-500 ${opt.color}` 
                  : 'border-transparent bg-white/60 dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <input 
                type="radio" 
                name="status"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-neutral-300"
              />
              <span className="font-medium">{opt.label}</span>
            </label>
          ))}

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || status === hall.maintenance_status}
              className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Impact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

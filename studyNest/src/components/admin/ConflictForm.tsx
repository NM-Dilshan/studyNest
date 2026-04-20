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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await conflictService.updateConflictStatus(hall.id, status);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update conflict status');
    } finally {
      setLoading(false);
    }
  };

  const options: { value: LectureHall['maintenance_status'], label: string }[] = [
    { value: 'available', label: 'Available (Normal Operation)' },
    { value: 'under_maintenance', label: 'Under Maintenance' },
    { value: 'reserved_exam', label: 'Reserved for Examination' },
    { value: 'reserved_event', label: 'Reserved for Special Event' },
    { value: 'closed', label: 'Closed Indefinitely' },
  ];

  const getOptionStyle = (value: string, isSelected: boolean) => {
    if (!isSelected) return 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700';
    switch (value) {
      case 'available': return 'border-green-500 bg-green-50 text-green-800';
      case 'under_maintenance': return 'border-amber-500 bg-amber-50 text-amber-800';
      case 'reserved_exam': return 'border-red-500 bg-red-50 text-red-800';
      case 'reserved_event': return 'border-purple-500 bg-purple-50 text-purple-800';
      case 'closed': return 'border-gray-500 bg-gray-100 text-gray-800';
      default: return 'border-indigo-500 bg-indigo-50 text-indigo-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5"/>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Status Override</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">Change operational status for <strong className="text-gray-800">{hall.name}</strong>. This overrides normal timetable availability.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {options.map((opt) => (
            <label 
              key={opt.value} 
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${getOptionStyle(opt.value, status === opt.value)}`}
            >
              <input 
                type="radio" 
                name="status"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="font-medium text-sm">{opt.label}</span>
            </label>
          ))}

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || status === hall.maintenance_status}
              className="flex-1 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Impact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

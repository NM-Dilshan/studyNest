import React, { useState } from 'react';
import { Upload, Save, Clock, X, AlertCircle } from 'lucide-react';
import { TimetableSlot, LectureHall } from '../../types/halls';
import { timetableService } from '../../services/timetableService';
import { hallService } from '../../services/hallService';

interface TimetableFormProps {
  hallId: string;
  initialData?: TimetableSlot;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function TimetableForm({ hallId, initialData, onSuccess, onCancel }: TimetableFormProps) {
  const [mode, setMode] = useState<'manual' | 'csv'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Manual form state
  const [formData, setFormData] = useState({
    hall_id: hallId,
    academic_year: initialData?.academic_year || 3,
    semester: initialData?.semester || 1,
    day_of_week: initialData?.day_of_week || 'Monday',
    start_time: initialData?.start_time || '08:30:00',
    end_time: initialData?.end_time || '10:30:00',
    subject_code: initialData?.subject_code || '',
    subject_name: initialData?.subject_name || '',
    group_name: initialData?.group_name || '',
    lecturer_name: initialData?.lecturer_name || '',
    is_reserved: initialData?.is_reserved ?? true,
  });

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field
    if (!formData.subject_code.trim()) {
      errors.subject_code = 'Subject Code is required';
    }

    // Time range: 08:00 - 20:00 only
    const startHH = parseInt(formData.start_time.substring(0, 2));
    const endHH = parseInt(formData.end_time.substring(0, 2));
    const endMM = parseInt(formData.end_time.substring(3, 5));

    if (startHH < 8 || startHH >= 20) {
      errors.start_time = 'Start time must be between 8:00 AM and 8:00 PM';
    }
    if (endHH < 8 || (endHH >= 20 && endMM > 0) || endHH > 20) {
      errors.end_time = 'End time must be between 8:00 AM and 8:00 PM';
    }

    // End must be after start
    if (formData.start_time >= formData.end_time) {
      errors.end_time = 'End time must be after start time';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setError(null);
      if (initialData) {
        await timetableService.updateSlot(initialData.id, formData as any);
      } else {
        await timetableService.createSlot(formData as any);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to ${initialData ? 'update' : 'create'} slot`);
    } finally {
      setLoading(false);
    }
  };

  // Helper: normalize time like "8:30" or "08:30" to "08:30:00"
  const normalizeTime = (t: string): string => {
    const parts = t.replace(/[^\d:]/g, '').split(':');
    const hh = (parts[0] || '0').padStart(2, '0');
    const mm = (parts[1] || '00').padStart(2, '0');
    const ss = parts[2] || '00';
    return `${hh}:${mm}:${ss}`;
  };

  // Helper: short day names to full
  const normalizeDayName = (d: string): string => {
    const val = d.trim();
    const map: Record<string, string> = {
      'mon': 'Monday', 'monday': 'Monday',
      'tue': 'Tuesday', 'tuesday': 'Tuesday',
      'wed': 'Wednesday', 'wednesday': 'Wednesday', 'wednesda': 'Wednesday',
      'thu': 'Thursday', 'thursday': 'Thursday',
      'fri': 'Friday', 'friday': 'Friday',
      'sat': 'Saturday', 'saturday': 'Saturday',
      'sun': 'Sunday', 'sunday': 'Sunday',
    };
    return map[val.toLowerCase()] || val;
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length <= 1) throw new Error('CSV is empty or missing headers');

      const headers = lines[0].toLowerCase().replace(/\r/g, '').split(',').map(h => h.trim());

      // Support both formats:
      // Format A (user's CSV): day, startTime, endTime, module, type, hall, lecturer
      // Format B (system):     day_of_week, start_time, end_time, subject_code, ...

      const dayIdx = headers.indexOf('day') !== -1 ? headers.indexOf('day') : headers.indexOf('day_of_week');
      const startIdx = headers.indexOf('starttime') !== -1 ? headers.indexOf('starttime') : headers.indexOf('start_time');
      const endIdx = headers.indexOf('endtime') !== -1 ? headers.indexOf('endtime') : headers.indexOf('end_time');
      const moduleIdx = headers.indexOf('module');
      const typeIdx = headers.indexOf('type');
      const hallIdx = headers.indexOf('hall');
      const lecturerIdx = headers.indexOf('lecturer') !== -1 ? headers.indexOf('lecturer') : headers.indexOf('lecturer_name');
      const subjectCodeIdx = headers.indexOf('subject_code');
      const subjectNameIdx = headers.indexOf('subject_name');
      const groupIdx = headers.indexOf('group_name');

      if (dayIdx === -1 || startIdx === -1 || endIdx === -1) {
        throw new Error('CSV must contain columns: day (or day_of_week), startTime (or start_time), endTime (or end_time)');
      }

      // If CSV has a "hall" column, fetch all halls and map name → id
      let hallNameToId: Record<string, string> = {};
      if (hallIdx !== -1) {
        const allHalls: LectureHall[] = await hallService.getLectureHalls();
        allHalls.forEach(h => {
          hallNameToId[h.name.toLowerCase()] = h.id;
          // Also map without spaces for fuzzy matching
          hallNameToId[h.name.replace(/\s+/g, '').toLowerCase()] = h.id;
        });
      }

      const records: Partial<TimetableSlot>[] = [];
      const warnings: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].replace(/\r/g, '').split(',').map(v => v.trim());
        if (values.length < 3) continue;

        // Resolve hall_id
        let resolvedHallId = hallId; // default to selected hall
        if (hallIdx !== -1 && values[hallIdx]) {
          const csvHallName = values[hallIdx].toLowerCase().replace(/\s+/g, '');
          const foundId = hallNameToId[csvHallName] || hallNameToId[values[hallIdx].toLowerCase()];
          if (foundId) {
            resolvedHallId = foundId;
          } else {
            warnings.push(`Row ${i + 1}: Hall "${values[hallIdx]}" not found, using selected hall`);
          }
        }

        // Parse module column: "IT3010 - NDM Practical" → code: IT3010, name: NDM Practical
        let subjectCode: string | null = null;
        let subjectName: string | null = null;
        if (moduleIdx !== -1 && values[moduleIdx]) {
          const moduleVal = values[moduleIdx];
          const dashIdx = moduleVal.indexOf(' - ');
          if (dashIdx !== -1) {
            subjectCode = moduleVal.substring(0, dashIdx).trim();
            subjectName = moduleVal.substring(dashIdx + 3).trim();
          } else {
            subjectCode = moduleVal.trim();
          }
        }
        // Override with explicit columns if present
        if (subjectCodeIdx !== -1 && values[subjectCodeIdx]) subjectCode = values[subjectCodeIdx];
        if (subjectNameIdx !== -1 && values[subjectNameIdx]) subjectName = values[subjectNameIdx];

        // Type column → append to subject name
        if (typeIdx !== -1 && values[typeIdx]) {
          const typeVal = values[typeIdx].trim();
          if (subjectName && typeVal) {
            subjectName = `${subjectName} (${typeVal})`;
          }
        }

        // Group
        const groupName = groupIdx !== -1 ? values[groupIdx] || null : null;

        // Lecturer
        const lecturerName = lecturerIdx !== -1 ? values[lecturerIdx] || null : null;

        records.push({
          hall_id: resolvedHallId,
          day_of_week: normalizeDayName(values[dayIdx]),
          start_time: normalizeTime(values[startIdx]),
          end_time: normalizeTime(values[endIdx]),
          subject_code: subjectCode,
          subject_name: subjectName,
          group_name: groupName,
          lecturer_name: lecturerName,
          is_reserved: true,
        });
      }

      if (records.length === 0) throw new Error('No valid rows found in CSV');

      const result = await timetableService.bulkInsertFromCSV(records);
      
      const allWarnings = [...warnings, ...(result.errors || [])];
      if (allWarnings.length > 0) {
        setError(`✅ Inserted ${result.count} slots. ⚠️ Warnings: ${allWarnings.join('; ')}`);
      }
      
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse and upload CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <X className="w-5 h-5"/>
        </button>
        
        <h3 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
          {initialData ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        {!initialData && (
          <div className="flex gap-2 mb-6 p-1.5 bg-neutral-100/60 dark:bg-neutral-800/60 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode('csv')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'csv' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              CSV Upload
            </button>
          </div>
        )}

        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Year</label>
                <select 
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: parseInt(e.target.value) })}
                  className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
                >
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Semester</label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
                >
                  {[1, 2].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Day of Week</label>
                <select 
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                  className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
                  required
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Subject Code <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. SE3050"
                  value={formData.subject_code}
                  onChange={(e) => { setFormData({ ...formData, subject_code: e.target.value }); setFieldErrors(prev => ({...prev, subject_code: ''})); }}
                  className={`w-full bg-white/60 dark:bg-neutral-800/80 border ${fieldErrors.subject_code ? 'border-red-400 ring-1 ring-red-400' : 'border-white/20 dark:border-white/5'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm`}
                />
                {fieldErrors.subject_code && <p className="text-xs text-red-500 mt-1">{fieldErrors.subject_code}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Subject Name</label>
              <input 
                type="text" 
                placeholder="e.g. Software Engineering"
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Group Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. WE-03"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Lecturer</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Silva"
                  value={formData.lecturer_name}
                  onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                  className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  Start Time <Clock className="w-3.5 h-3.5 opacity-50" />
                </label>
                <input 
                  type="time" 
                  min="08:00" max="20:00"
                  value={formData.start_time.substring(0, 5)}
                  onChange={(e) => { setFormData({ ...formData, start_time: e.target.value + ':00' }); setFieldErrors(prev => ({...prev, start_time: '', end_time: ''})); }}
                  className={`w-full bg-white/60 dark:bg-neutral-800/80 border ${fieldErrors.start_time ? 'border-red-400 ring-1 ring-red-400' : 'border-white/20 dark:border-white/5'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm`}
                  required
                />
                {fieldErrors.start_time && <p className="text-xs text-red-500 mt-1">{fieldErrors.start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  End Time <Clock className="w-3.5 h-3.5 opacity-50" />
                </label>
                <input 
                  type="time" 
                  min="08:00" max="20:00"
                  value={formData.end_time.substring(0, 5)}
                  onChange={(e) => { setFormData({ ...formData, end_time: e.target.value + ':00' }); setFieldErrors(prev => ({...prev, end_time: ''})); }}
                  className={`w-full bg-white/60 dark:bg-neutral-800/80 border ${fieldErrors.end_time ? 'border-red-400 ring-1 ring-red-400' : 'border-white/20 dark:border-white/5'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm`}
                  required
                />
                {fieldErrors.end_time && <p className="text-xs text-red-500 mt-1">{fieldErrors.end_time}</p>}
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Slot</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md">
            <Upload className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Upload Timetable CSV</h4>
            <div className="text-sm text-neutral-500 text-center px-4 mb-2 leading-relaxed">
              <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">Supported Format:</p>
              <code className="bg-white/60 dark:bg-neutral-900/60 px-2 py-1 rounded inline-block text-xs font-mono shadow-sm border border-neutral-200 dark:border-neutral-800">
                day, startTime, endTime, module, type, hall, lecturer
              </code>
            </div>
            <p className="text-xs text-neutral-400 text-center px-6 mb-1">
              <strong>module:</strong> &quot;IT3010 - NDM Practical&quot; → auto-splits code &amp; name
            </p>
            <p className="text-xs text-neutral-400 text-center px-6 mb-4">
              <strong>hall:</strong> hall name (e.g. G1101) → auto-maps to hall ID
            </p>
            <label className="cursor-pointer bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all hover:scale-105 shadow-md">
              <span>Choose File</span>
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleCSVUpload}
                disabled={loading}
              />
            </label>
            {loading && <p className="mt-4 text-sm text-blue-500 font-medium animate-pulse flex items-center gap-2"><div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> Processing file...</p>}
          </div>
        )}
      </div>
    </div>
  );
}

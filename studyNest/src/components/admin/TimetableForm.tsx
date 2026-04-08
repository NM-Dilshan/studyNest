import React, { useState, useEffect } from 'react';
import { Upload, Save, Clock, X, AlertCircle, Building2, Calendar, BookOpen, Users, GraduationCap, MapPin, ChevronLeft, CheckCircle2 } from 'lucide-react';
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
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{
    processed: number;
    inserted: number;
    skipped: number;
    warnings: string[];
  } | null>(null);

  // Fetch all halls on mount for the dropdown
  useEffect(() => {
    hallService.getLectureHalls().then(setHalls).catch(console.error);
  }, []);

  // Manual form state
  const [formData, setFormData] = useState({
    hall_id: initialData?.hall_id || hallId || '',
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

    if (!formData.subject_code.trim()) {
      errors.subject_code = 'Subject Code is required';
    }

    const startHH = parseInt(formData.start_time.substring(0, 2));
    const endHH = parseInt(formData.end_time.substring(0, 2));
    const endMM = parseInt(formData.end_time.substring(3, 5));

    if (startHH < 8 || startHH >= 20) {
      errors.start_time = 'Start time must be between 8:00 AM and 8:00 PM';
    }
    if (endHH < 8 || (endHH >= 20 && endMM > 0) || endHH > 20) {
      errors.end_time = 'End time must be between 8:00 AM and 8:00 PM';
    }

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
        await timetableService.updateSlot(initialData.id, { ...formData, hall_id: formData.hall_id || null } as any);
      } else {
        await timetableService.createSlot({ ...formData, hall_id: formData.hall_id || null } as any);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to ${initialData ? 'update' : 'create'} slot`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeTime = (t: string): string => {
    const parts = t.replace(/[^\d:]/g, '').split(':');
    const hh = (parts[0] || '0').padStart(2, '0');
    const mm = (parts[1] || '00').padStart(2, '0');
    const ss = parts[2] || '00';
    return `${hh}:${mm}:${ss}`;
  };

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
      setUploadSummary(null);
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length <= 1) throw new Error('CSV is empty or missing headers');

      const headers = lines[0].toLowerCase().replace(/\r/g, '').split(',').map(h => h.trim());

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

      let hallNameToId: Record<string, string> = {};
      if (hallIdx !== -1) {
        const allHalls: LectureHall[] = await hallService.getLectureHalls();
        allHalls.forEach(h => {
          hallNameToId[h.name.toLowerCase()] = h.id;
          hallNameToId[h.name.replace(/\s+/g, '').toLowerCase()] = h.id;
        });
      }

      const records: Partial<TimetableSlot>[] = [];
      const warnings: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].replace(/\r/g, '').split(',').map(v => v.trim());
        if (values.length < 3) continue;

        const rawHallName = hallIdx !== -1 && values[hallIdx] ? values[hallIdx].trim() : null;

        let resolvedHallId: string | null = null;
        if (hallIdx !== -1 && values[hallIdx]) {
          const csvHallName = values[hallIdx].toLowerCase().replace(/\s+/g, '');
          const foundId = hallNameToId[csvHallName] || hallNameToId[values[hallIdx].toLowerCase()];
          if (foundId) {
            resolvedHallId = foundId;
          } else {
            resolvedHallId = null; 
            warnings.push(`Row ${i + 1}: Hall "${values[hallIdx]}" not found (Unassigned)`);
          }
        } else if (hallIdx === -1 && hallId) {
          resolvedHallId = hallId || null;
        }

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
        if (subjectCodeIdx !== -1 && values[subjectCodeIdx]) subjectCode = values[subjectCodeIdx];
        if (subjectNameIdx !== -1 && values[subjectNameIdx]) subjectName = values[subjectNameIdx];

        if (typeIdx !== -1 && values[typeIdx]) {
          const typeVal = values[typeIdx].trim();
          if (subjectName && typeVal) {
            subjectName = `${subjectName} (${typeVal})`;
          }
        }

        records.push({
          hall_id: resolvedHallId,
          academic_year: formData.academic_year,
          semester: formData.semester,
          day_of_week: normalizeDayName(values[dayIdx]),
          start_time: normalizeTime(values[startIdx]),
          end_time: normalizeTime(values[endIdx]),
          subject_code: subjectCode,
          subject_name: subjectName,
          group_name: groupIdx !== -1 ? values[groupIdx] || null : null,
          lecturer_name: lecturerIdx !== -1 ? values[lecturerIdx] || null : null,
          raw_hall_name: rawHallName,
          is_reserved: true,
        });
      }

      if (records.length === 0) throw new Error('No valid rows found in CSV');

      const result = await timetableService.bulkInsertFromCSV(records);
      const otherErrors = result.errors || [];
      
      if (warnings.length > 0 || otherErrors.length > 0 || result.skipped > 0) {
        setUploadSummary({
          processed: records.length,
          inserted: result.count,
          skipped: result.skipped,
          warnings: [...warnings, ...otherErrors]
        });
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse and upload CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FBFCFE] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-2xl w-full relative overflow-hidden border border-white/20">
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' }}></div>

        <div className="relative p-8 md:p-10 max-h-[90vh] overflow-y-auto">
          {/* Header section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={onCancel} className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#1e3a8a] uppercase">Studynest Admin</span>
                <h3 className="text-2xl font-black text-slate-900">
                  {initialData ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
                </h3>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!uploadSummary && (
            <p className="text-slate-500 mb-8 max-w-md">
              Configure schedule details, subject information, and venue assignments with a clean and consistent setup flow.
            </p>
          )}
          
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Upload Summary View */}
          {uploadSummary && (
            <div className="mb-8 p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Upload Processed</h4>
                  <p className="text-sm text-slate-500">Review the status and any warnings below.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total</p>
                  <p className="text-xl font-black text-slate-900">{uploadSummary.processed}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Inserted</p>
                  <p className="text-xl font-black text-emerald-600">{uploadSummary.inserted}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Skipped</p>
                  <p className="text-xl font-black text-amber-600">{uploadSummary.skipped}</p>
                </div>
              </div>

              {uploadSummary.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 px-1">Warnings / Unassigned Halls</p>
                  <div className="max-h-[200px] overflow-y-auto bg-white/50 border border-slate-100 rounded-2xl p-4 text-[13px] text-slate-600 space-y-1.5 custom-scrollbar">
                    {uploadSummary.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 opacity-70">•</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={onSuccess}
                className="w-full mt-8 py-5 rounded-[1.25rem] font-black text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98]"
              >
                Finish & Close
              </button>
            </div>
          )}

          {!initialData && !uploadSummary && (
            <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-[1.25rem]">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'manual' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setMode('csv')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'csv' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                CSV Upload
              </button>
            </div>
          )}

          {mode === 'manual' && !uploadSummary ? (
            <form onSubmit={handleManualSubmit} className="space-y-8">
              {/* Timing & Day Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">SCHEDULE DETAILS</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Academic Year</label>
                    <select 
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                    >
                      {[1, 2, 3, 4].map(y => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Semester</label>
                    <select 
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                    >
                      {[1, 2].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Day of Week</label>
                    <select 
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                      required
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      Start Time <Clock className="w-3 h-3 opacity-40" />
                    </label>
                    <input 
                      type="time" 
                      min="08:00" max="20:00"
                      value={formData.start_time.substring(0, 5)}
                      onChange={(e) => { setFormData({ ...formData, start_time: e.target.value + ':00' }); setFieldErrors(prev => ({...prev, start_time: '', end_time: ''})); }}
                      className={`w-full bg-slate-50 border ${fieldErrors.start_time ? 'border-red-400' : 'border-slate-200'} rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      End Time <Clock className="w-3 h-3 opacity-40" />
                    </label>
                    <input 
                      type="time" 
                      min="08:00" max="20:00"
                      value={formData.end_time.substring(0, 5)}
                      onChange={(e) => { setFormData({ ...formData, end_time: e.target.value + ':00' }); setFieldErrors(prev => ({...prev, end_time: ''})); }}
                      className={`w-full bg-slate-50 border ${fieldErrors.end_time ? 'border-red-400' : 'border-slate-200'} rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all`}
                    />
                  </div>
                </div>
              </div>

              {/* Subject & Faculty Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">ACADEMIC INFO</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Subject Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SE3050"
                      value={formData.subject_code}
                      onChange={(e) => { setFormData({ ...formData, subject_code: e.target.value }); setFieldErrors(prev => ({...prev, subject_code: ''})); }}
                      className={`w-full bg-slate-50 border ${fieldErrors.subject_code ? 'border-red-400' : 'border-slate-200'} rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Group Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WE-03"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Subject Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Software Engineering"
                      value={formData.subject_name}
                      onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 pl-11 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                    />
                    <BookOpen className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Lecturer Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Silva"
                      value={formData.lecturer_name}
                      onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 pl-11 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                    />
                    <GraduationCap className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">VENUE SELECTION</h4>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Lecture Hall</label>
                  <select
                    value={formData.hall_id}
                    onChange={(e) => setFormData({ ...formData, hall_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[0.9rem] px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium transition-all shadow-sm"
                  >
                    <option value="">— Unassigned —</option>
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>{h.name} — {h.building}</option>
                    ))}
                  </select>
                  {!formData.hall_id && (
                    <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-xs flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        No hall assigned. You can assign one now or later.
                      </div>
                      {initialData?.raw_hall_name && (
                        <div className="ml-6 text-blue-600 font-semibold">
                          💡 Hint from CSV: <span className="bg-blue-100 px-2 py-0.5 rounded-lg text-blue-800">{initialData.raw_hall_name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 rounded-[1.25rem] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
                      <span className="text-lg">Save Timetable Slot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : mode === 'csv' && !uploadSummary ? (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="relative z-10 text-center px-8">
                <div className="w-20 h-20 bg-white shadow-lg border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                
                <h4 className="text-xl font-black text-slate-900 mb-4">Upload Timetable CSV</h4>
                
                <div className="space-y-4 mb-8">
                  <div className="text-sm text-slate-500 max-w-xs mx-auto space-y-2">
                    <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Expected Columns</p>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm text-[11px] font-mono break-all text-slate-600">
                      day, startTime, endTime, module, type, hall, lecturer
                    </div>
                  </div>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/20 active:scale-95">
                  <Upload className="w-6 h-6" />
                  <span>Choose CSV File</span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleCSVUpload}
                    disabled={loading}
                  />
                </label>
                
                {loading && (
                  <div className="mt-8 flex items-center gap-3 text-blue-600 font-bold animate-pulse">
                    <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    Crunching data...
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

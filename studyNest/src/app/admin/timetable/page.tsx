'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, ArrowLeft, Pencil, Building2 } from 'lucide-react';
import { TimetableSlot, LectureHall } from '../../../types/halls';
import { timetableService } from '../../../services/timetableService';
import { hallService } from '../../../services/hallService';
import { TimetableForm } from '../../../components/admin/TimetableForm';

// Special filter values (not real UUIDs)
const FILTER_ALL = '';
const FILTER_UNASSIGNED = '__unassigned__';

export default function TimetableManager() {
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [filterMode, setFilterMode] = useState<string>(FILTER_ALL); // '', '__unassigned__', or a UUID
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterSemester, setFilterSemester] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadHalls();
  }, []);

  // Reload slots whenever filter changes
  useEffect(() => {
    loadSlots();
  }, [filterMode, filterYear, filterSemester]);

  const loadHalls = async () => {
    try {
      const data = await hallService.getLectureHalls();
      setHalls(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load halls');
    }
  };

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: TimetableSlot[];

      if (filterMode === FILTER_UNASSIGNED) {
        // Fetch sessions with no hall assigned
        data = await timetableService.getTimetable(
          undefined,
          filterYear || undefined,
          filterSemester || undefined,
          true // unassigned=true
        );
      } else if (filterMode === FILTER_ALL) {
        // Fetch ALL sessions
        data = await timetableService.getTimetable(
          undefined,
          filterYear || undefined,
          filterSemester || undefined
        );
      } else {
        // Fetch by specific hall UUID
        data = await timetableService.getTimetable(
          filterMode,
          filterYear || undefined,
          filterSemester || undefined
        );
      }

      setSlots(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await timetableService.deleteSlot(deleteConfirmId);
      setDeleteConfirmId(null);
      loadSlots();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete slot');
      setDeleteConfirmId(null);
    }
  };

  // Determine which hall is "selected" for the form (null if All/Unassigned)
  const selectedHallIdForForm =
    filterMode !== FILTER_ALL && filterMode !== FILTER_UNASSIGNED ? filterMode : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6 md:p-10 relative overflow-hidden text-neutral-900 dark:text-neutral-100">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage scheduled classes and blocked times</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 rounded-3xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            {/* Hall Filter Dropdown */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Filter by Lecture Hall
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm"
              >
                <option value={FILTER_ALL}>All Lecture Halls</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>{h.name} — {h.building}</option>
                ))}
                <option value={FILTER_UNASSIGNED}>⚠ Unassigned Lecture Sessions</option>
              </select>
            </div>

            {/* Year / Semester Filters */}
            <div className="flex gap-3 w-full md:w-auto">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-500 dark:text-neutral-400">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm text-sm min-w-[100px]"
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-500 dark:text-neutral-400">Semester</label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-white/60 dark:bg-neutral-800/80 border border-white/20 dark:border-white/5 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white shadow-sm text-sm min-w-[100px]"
                >
                  <option value="">All Sem</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Slot Button — always enabled */}
            <button
              onClick={() => { setEditingSlot(undefined); setShowForm(true); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Slot / CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Year / Sem</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Hall</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Day</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Time</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Subject</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Group</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium">Lecturer</th>
                    <th className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                        <Calendar className="w-10 h-10 opacity-50 mx-auto mb-3" />
                        {filterMode === FILTER_UNASSIGNED
                          ? 'No unassigned sessions found.'
                          : filterMode === FILTER_ALL
                          ? 'No timetable slots found.'
                          : 'No timetable slots found for this hall.'}
                      </td>
                    </tr>
                  ) : (
                    slots.map(slot => (
                      <tr key={slot.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors">
                        {/* Year / Sem */}
                        <td className="px-5 py-4 text-sm">
                          {slot.academic_year && slot.semester ? (
                            <span className="inline-flex px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md text-xs font-medium border border-purple-100 dark:border-purple-500/20">
                              Y{slot.academic_year} S{slot.semester}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>

                        {/* Hall Name — new column */}
                        <td className="px-5 py-4 text-sm">
                          {slot.hall_name ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium border border-emerald-100 dark:border-emerald-500/20">
                              <Building2 className="w-3 h-3" />
                              {slot.hall_name}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md text-xs font-medium border border-orange-100 dark:border-orange-500/20">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Day */}
                        <td className="px-5 py-4 font-medium text-neutral-800 dark:text-neutral-200">{slot.day_of_week}</td>

                        {/* Time */}
                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm font-mono border border-neutral-200 dark:border-neutral-700">{slot.start_time.substring(0, 5)}</span>
                          <span className="mx-2 opacity-50">-</span>
                          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm font-mono border border-neutral-200 dark:border-neutral-700">{slot.end_time.substring(0, 5)}</span>
                        </td>

                        {/* Subject */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="inline-flex px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-sm font-medium border border-blue-100 dark:border-blue-500/20">
                              {slot.subject_code || 'N/A'}
                            </span>
                            {slot.subject_name && (
                              <p className="text-xs text-neutral-500 mt-1">{slot.subject_name}</p>
                            )}
                          </div>
                        </td>

                        {/* Group */}
                        <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {slot.group_name || '-'}
                        </td>

                        {/* Lecturer */}
                        <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {slot.lecturer_name || '-'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingSlot(slot); setShowForm(true); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors inline-block"
                            title="Edit Slot"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors inline-block"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <TimetableForm
          hallId={selectedHallIdForForm}
          initialData={editingSlot}
          onSuccess={() => { setShowForm(false); setEditingSlot(undefined); loadSlots(); }}
          onCancel={() => { setShowForm(false); setEditingSlot(undefined); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-sm w-full text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">Delete Slot?</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Are you sure you want to delete this timetable slot? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

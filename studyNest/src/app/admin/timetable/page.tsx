'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Trash2, Plus, Pencil, Search } from 'lucide-react';
import { TimetableSlot, LectureHall } from '../../../types/halls';
import { timetableService } from '../../../services/timetableService';
import { hallService } from '../../../services/hallService';
import { TimetableForm } from '../../../components/admin/TimetableForm';

export default function TimetableManager() {
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterSemester, setFilterSemester] = useState<number | ''>('');
  const [hallSearchQuery, setHallSearchQuery] = useState('');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHalls();
  }, []);

  useEffect(() => {
    if (selectedHallId) {
      loadSlots(selectedHallId);
    }
  }, [selectedHallId, filterYear, filterSemester]);

  const loadHalls = async () => {
    try {
      const data = await hallService.getLectureHalls();
      setHalls(data);
      if (data.length > 0 && !selectedHallId) {
        // Default to 'all' instead of the first hall to show everything initially
        setSelectedHallId('all');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load halls');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (hallId: string) => {
    try {
      setLoading(true);
      setError(null);
      const isUnassigned = hallId === 'unassigned';
      const actualHallId = (hallId === 'all' || isUnassigned) ? undefined : hallId;
      
      const data = await timetableService.getTimetable(
        actualHallId,
        filterYear || undefined,
        filterSemester || undefined,
        isUnassigned
      );
      setSlots(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await timetableService.deleteSlot(deleteConfirmId);
      setDeleteConfirmId(null);
      loadSlots(selectedHallId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete slot');
      setDeleteConfirmId(null);
    }
  };

  const selectedHallName = halls.find((h) => h.id === selectedHallId)?.name;

  const filteredSlots = useMemo(() => {
    const hallQ = hallSearchQuery.trim().toLowerCase();
    const sessionQ = sessionSearchQuery.trim().toLowerCase();

    return slots.filter((slot) => {
      const hallLabel = `${slot.hall_name || ''} ${halls.find((h) => h.id === slot.hall_id)?.name || ''} ${slot.raw_hall_name || ''}`.toLowerCase();
      const sessionLabel = `${slot.subject_code || ''} ${slot.subject_name || ''} ${slot.group_name || ''} ${slot.lecturer_name || ''}`.toLowerCase();

      const hallMatch = !hallQ || hallLabel.includes(hallQ);
      const sessionMatch = !sessionQ || sessionLabel.includes(sessionQ);
      return hallMatch && sessionMatch;
    });
  }, [slots, halls, hallSearchQuery, sessionSearchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative overflow-hidden text-gray-900">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold">Timetable Management</h1>
            <p className="text-gray-600 mt-1">Manage scheduled classes and blocked times</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium mb-2 text-gray-700">Select Lecture Hall</label>
              <select 
                value={selectedHallId}
                onChange={(e) => setSelectedHallId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 shadow-sm"
              >
                <option value="all">All Lecture Sessions</option>
                <option value="unassigned">Unassigned Sessions (Missing Halls)</option>
                <optgroup label="Filter by Specific Hall">
                  {halls.map(h => (
                    <option key={h.id} value={h.id}>{h.name} - {h.building}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-600">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 shadow-sm text-sm min-w-[100px]"
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-600">Semester</label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 shadow-sm text-sm min-w-[100px]"
                >
                  <option value="">All Sem</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => { setEditingSlot(undefined); setShowForm(true); }}
              disabled={!selectedHallId}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add Slot / CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600">Search Lecture Hall</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hallSearchQuery}
                  onChange={(e) => setHallSearchQuery(e.target.value)}
                  placeholder="e.g. F1308, New Building, G1101"
                  className="w-full pl-9 pr-3 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 shadow-sm text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-600">Search Lecture Session</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sessionSearchQuery}
                  onChange={(e) => setSessionSearchQuery(e.target.value)}
                  placeholder="e.g. IT3010, NDM, Tutorial, lecturer name"
                  className="w-full pl-9 pr-3 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/></div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-1">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 text-sm text-gray-600">
              Showing sessions for:{' '}
              <span className="font-semibold text-gray-900">
                {selectedHallName || 'Selected Lecture Hall'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Year / Sem</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Day</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Time</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Lecture Hall</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Subject</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Group</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium">Lecturer</th>
                    <th className="px-5 py-4 text-sm text-gray-600 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <Calendar className="w-10 h-10 opacity-50 mx-auto mb-3" />
                        No timetable slots found for current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSlots.map(slot => (
                      <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm">
                          {slot.academic_year && slot.semester ? (
                            <span className="inline-flex px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-100">
                              Y{slot.academic_year} S{slot.semester}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-800">{slot.day_of_week}</td>
                        <td className="px-5 py-4 text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono border border-gray-200">{slot.start_time.substring(0,5)}</span>
                          <span className="mx-2 opacity-50">-</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono border border-gray-200">{slot.end_time.substring(0,5)}</span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {slot.hall_name || halls.find((h) => h.id === slot.hall_id)?.name ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {slot.hall_name || halls.find((h) => h.id === slot.hall_id)?.name}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium w-fit">
                                Unassigned
                              </span>
                              {slot.raw_hall_name && (
                                <span className="text-[11px] text-slate-500 italic pl-1">
                                  CSV: <strong className="text-slate-700">{slot.raw_hall_name}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100">
                              {slot.subject_code || 'N/A'}
                            </span>
                            {slot.subject_name && (
                              <p className="text-xs text-neutral-500 mt-1">{slot.subject_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {slot.group_name || '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {slot.lecturer_name || '-'}
                        </td>
                        <td className="px-5 py-4 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setEditingSlot(slot); setShowForm(true); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                            title="Edit Slot"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
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

      {showForm && (
        <TimetableForm 
          hallId={selectedHallId} 
          initialData={editingSlot}
          onSuccess={() => { setShowForm(false); setEditingSlot(undefined); loadSlots(selectedHallId); }}
          onCancel={() => { setShowForm(false); setEditingSlot(undefined); }}
        />
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-sm w-full text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Delete Slot?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this timetable slot? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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

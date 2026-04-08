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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const slotsPerPage = 10;

  useEffect(() => {
    loadHalls();
  }, []);

  // Reload slots whenever filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
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

  // Pagination calculations
  const indexOfLastSlot = currentPage * slotsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
  const currentSlots = slots.slice(indexOfFirstSlot, indexOfLastSlot);
  const totalPages = Math.ceil(slots.length / slotsPerPage);

  // Determine which hall is "selected" for the form (null if All/Unassigned)
  const selectedHallIdForForm =
    filterMode !== FILTER_ALL && filterMode !== FILTER_UNASSIGNED ? filterMode : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Timetable Management</h2>
            <p className="text-gray-600 mt-2">Manage scheduled classes and blocked times</p>
          </div>
          <button
            onClick={() => { setEditingSlot(undefined); setShowForm(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Slot / CSV
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Lecture Hall
            </label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm shadow-sm"
            >
              <option value={FILTER_ALL}>All Lecture Halls</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>{h.name} — {h.building}</option>
              ))}
              <option value={FILTER_UNASSIGNED}>⚠ Unassigned Sessions</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm shadow-sm min-w-[120px]"
              >
                <option value="">All Years</option>
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value ? parseInt(e.target.value) : '')}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm shadow-sm min-w-[120px]"
              >
                <option value="">All Sem</option>
                {[1, 2].map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Loading timetable slots...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Year / Sem</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hall</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Day</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Group</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lecturer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        {filterMode === FILTER_UNASSIGNED
                          ? 'No unassigned sessions found.'
                          : filterMode === FILTER_ALL
                          ? 'No timetable slots found.'
                          : 'No timetable slots found for this hall.'}
                      </td>
                    </tr>
                  ) : (
                    currentSlots.map(slot => (
                      <tr key={slot.id} className="border-b hover:bg-gray-50 transition-colors">
                        {/* Year / Sem */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {slot.academic_year && slot.semester ? `Y${slot.academic_year} S${slot.semester}` : '-'}
                        </td>

                        {/* Hall Name */}
                        <td className="px-6 py-4">
                          {slot.hall_name ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {slot.hall_name}
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

                        {/* Day */}
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{slot.day_of_week}</td>

                        {/* Time */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">{slot.subject_code || 'N/A'}</div>
                          {slot.subject_name && (
                            <div className="text-xs text-gray-500">{slot.subject_name}</div>
                          )}
                        </td>

                        {/* Group */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {slot.group_name || '-'}
                        </td>

                        {/* Lecturer */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {slot.lecturer_name || '-'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setEditingSlot(slot); setShowForm(true); }}
                              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="text-red-600 hover:text-red-700 font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {slots.length > slotsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstSlot + 1}</span> to <span className="font-medium">{Math.min(indexOfLastSlot, slots.length)}</span> of <span className="font-medium">{slots.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Slot?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this timetable slot? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { LectureHall } from '../../../types/halls';
import { hallService } from '../../../services/hallService';
import { ConflictForm } from '../../../components/admin/ConflictForm';
import { ConflictBadge } from '../../../components/halls/ConflictBadge';

export default function ConflictManager() {
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHall, setEditingHall] = useState<LectureHall | null>(null);

  const loadHalls = async () => {
    try {
      setLoading(true);
      const data = await hallService.getLectureHalls();
      setHalls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHalls();
  }, []);

  const activeConflicts = halls.filter(h => h.maintenance_status !== 'available');

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Emergency Overrides <ShieldAlert className="w-6 h-6 text-red-500" />
            </h2>
            <p className="text-gray-600 mt-2">Directly block hall availability due to maintenance or exams</p>
          </div>
        </div>

        {/* Warning Banner */}
        {activeConflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800">Active Overrides Detected</h4>
              <p className="text-sm text-red-600 mt-1">
                There are currently {activeConflicts.length} halls with active availability blocks. Students will see these warnings and will be unable to mark them as free.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="text-gray-600 mt-4">Loading hall statuses...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-900">Hall Name</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-900">Building</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-900">Current Status</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-900 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map(hall => (
                    <tr key={hall.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                        {hall.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {hall.building}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {hall.maintenance_status === 'available' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Available
                          </span>
                        ) : (
                          <ConflictBadge status={hall.maintenance_status} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setEditingHall(hall)}
                          className={
                            hall.maintenance_status === 'available' 
                              ? 'text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors'
                              : 'text-red-600 hover:text-red-700 font-medium text-sm transition-colors'
                          }
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {editingHall && (
        <ConflictForm 
          hall={editingHall}
          onSuccess={() => { setEditingHall(null); loadHalls(); }}
          onCancel={() => setEditingHall(null)}
        />
      )}
    </div>
  );
}

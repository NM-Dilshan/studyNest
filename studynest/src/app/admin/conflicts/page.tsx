'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6 md:p-10 relative overflow-hidden text-neutral-900 dark:text-neutral-100">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 dark:bg-red-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Emergency Overrides <ShieldAlert className="w-6 h-6 text-red-500" />
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">Directly block hall availability due to maintenance or exams</p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {activeConflicts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800 dark:text-red-400">Active Overrides Detected</h4>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">There are currently {activeConflicts.length} halls with active availability blocks. Students will see these warnings and will be unable to mark them as free.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-neutral-500/30 border-t-neutral-500 rounded-full animate-spin"/></div>
        ) : (
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                    <th className="px-6 py-4 font-semibold text-sm text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">Hall Name</th>
                    <th className="px-6 py-4 font-semibold text-sm text-neutral-600 dark:text-neutral-400 font-medium">Building</th>
                    <th className="px-6 py-4 font-semibold text-sm text-neutral-600 dark:text-neutral-400 font-medium">Current Status</th>
                    <th className="px-6 py-4 font-semibold text-sm text-neutral-600 dark:text-neutral-400 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map(hall => (
                    <tr key={hall.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-neutral-900 dark:text-white">{hall.name}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {hall.building}
                      </td>
                      <td className="px-6 py-4">
                        {hall.maintenance_status === 'available' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                          </span>
                        ) : (
                          <ConflictBadge status={hall.maintenance_status} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setEditingHall(hall)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            hall.maintenance_status === 'available' 
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              : 'bg-red-100 dark:bg-red-500/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-500/30'
                          }`}
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
      </div>

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

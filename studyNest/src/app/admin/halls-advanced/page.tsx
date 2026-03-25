'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, MapPin, Users } from 'lucide-react';
import { LectureHall } from '../../../types/halls';
import { hallService } from '../../../services/hallService';
import { HallForm } from '../../../components/admin/HallForm';
import { FacilitiesEditor } from '../../../components/halls/FacilitiesEditor';

export default function HallManager() {
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHall, setEditingHall] = useState<LectureHall | undefined>();

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await hallService.softDeleteHall(id);
      loadHalls();
    } catch (err) {
      console.error(err);
      alert('Failed to delete hall');
    }
  };

  const handleUpdateHall = (updatedHall: LectureHall) => {
    setHalls(halls.map(h => h.id === updatedHall.id ? updatedHall : h));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6 md:p-10 relative overflow-hidden text-neutral-900 dark:text-neutral-100">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Lecture Halls</h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage master data and physical facilities</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setEditingHall(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl font-medium shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Hall
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-neutral-500/30 border-t-neutral-500 rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {halls.map(hall => (
              <div key={hall.id} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{hall.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {hall.building}, Fl {hall.floor}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {hall.capacity}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingHall(hall); setShowForm(true); }}
                      className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors"
                      title="Edit basic details"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(hall.id, hall.name)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Deactivate hall"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex-1 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <FacilitiesEditor hall={hall} onUpdate={handleUpdateHall} />
                </div>
              </div>
            ))}
            
            {halls.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/40 dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700">
                <p className="text-lg font-medium text-neutral-500">No lecture halls found.</p>
                <button 
                  onClick={() => { setEditingHall(undefined); setShowForm(true); }} 
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Create your first hall
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <HallForm 
          initialData={editingHall}
          onSuccess={() => { setShowForm(false); loadHalls(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

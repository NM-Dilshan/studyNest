import React, { useState, useEffect } from 'react';
import { X, Save, SlidersHorizontal } from 'lucide-react';
import { UserPreferences, StudyPurpose } from '../../types/halls';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Partial<UserPreferences>;
  onSave: (prefs: Partial<UserPreferences>) => void;
  isLoading?: boolean;
}

export function PreferencesPanel({ isOpen, onClose, preferences, onSave, isLoading }: PreferencesPanelProps) {
  const [localPrefs, setLocalPrefs] = useState<Partial<UserPreferences>>(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  const purposes: { value: StudyPurpose; label: string }[] = [
    { value: 'general', label: 'General Study' },
    { value: 'discussion', label: 'Group Discussion' },
    { value: 'presentation', label: 'Presentation Practice' },
    { value: 'quiet', label: 'Quiet Focus' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-y-auto transform transition-transform border-l border-neutral-200 dark:border-neutral-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
              <SlidersHorizontal className="w-5 h-5 text-blue-500" />
              Smart Preferences
            </h2>
            <button onClick={onClose} className="p-2 -mr-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Purpose */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Main Study Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {purposes.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setLocalPrefs({ ...localPrefs, preferred_purpose: p.value })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                      localPrefs.preferred_purpose === p.value
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Group Size</label>
              <input 
                type="range" 
                min="1" max="50" 
                value={localPrefs.group_size || 1}
                onChange={(e) => setLocalPrefs({ ...localPrefs, group_size: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="text-center font-medium mt-2 text-blue-600 dark:text-blue-400">
                {localPrefs.group_size} {localPrefs.group_size === 1 ? 'Person' : 'People'}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-neutral-800 dark:text-neutral-200">Required Facilities</label>
              <div className="space-y-3">
                {[
                  { key: 'require_wifi', label: 'Strong WiFi' },
                  { key: 'require_power', label: 'Power Sockets' },
                  { key: 'require_ac', label: 'Air Conditioning' },
                  { key: 'require_projector', label: 'Projector / Screen' },
                  { key: 'require_whiteboard', label: 'Whiteboard' },
                  { key: 'require_accessibility', label: 'Wheelchair Accessible' },
                  { key: 'quiet_zone', label: 'Strict Quiet Zone' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={!!localPrefs[key as keyof UserPreferences]}
                        onChange={(e) => setLocalPrefs({ ...localPrefs, [key]: e.target.checked })}
                        className="peer w-5 h-5 appearance-none rounded-md border-2 border-neutral-300 dark:border-neutral-700 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
            <p className="text-xs text-center text-neutral-500 mt-3">
              These preferences affect your personalized suitability scores.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

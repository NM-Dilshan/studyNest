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
    // Keep drawer-local draft in sync when preferences are refreshed externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md transform overflow-y-auto border-l border-[var(--surface-border)] bg-[var(--surface-card)] shadow-2xl transition-transform">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--text-main)]">
              <SlidersHorizontal className="h-5 w-5 text-[var(--brand-primary)]" />
              Smart Preferences
            </h2>
            <button onClick={onClose} className="-mr-2 rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--button-hover)] hover:text-[var(--text-main)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Purpose */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--text-soft)]">Main Study Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {purposes.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setLocalPrefs({ ...localPrefs, preferred_purpose: p.value })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                      localPrefs.preferred_purpose === p.value
                        ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-text)]'
                        : 'border-[var(--surface-border)] bg-[var(--surface-card-muted)] text-[var(--text-soft)] hover:bg-[var(--button-hover)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-soft)]">Group Size</label>
              <input 
                type="range" 
                min="1" max="50" 
                value={localPrefs.group_size || 1}
                onChange={(e) => setLocalPrefs({ ...localPrefs, group_size: parseInt(e.target.value) })}
                className="w-full accent-[var(--brand-primary)]"
              />
              <div className="mt-2 text-center font-medium text-[var(--brand-primary)]">
                {localPrefs.group_size} {localPrefs.group_size === 1 ? 'Person' : 'People'}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--text-soft)]">Required Facilities</label>
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
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[var(--surface-border)] transition-colors checked:border-[var(--brand-primary)] checked:bg-[var(--brand-primary)]"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-soft)] transition-colors group-hover:text-[var(--text-main)]">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-[var(--surface-border)] pt-6">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3 font-semibold text-white shadow-lg shadow-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] transition-all active:scale-[0.98] hover:bg-[var(--brand-primary-dark)] disabled:opacity-70"
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
            <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
              These preferences affect your personalized suitability scores.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

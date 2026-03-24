'use client'

/**
 * PreferencesPanel — Side drawer for managing study preferences
 */

import { useEffect, useState } from 'react'
import { UserPreferences, StudyPurpose } from '@/types/halls'

interface PreferencesPanelProps {
  userId: string
  preferences: UserPreferences | null
  isOpen: boolean
  onClose: () => void
  onSave: (prefs: Partial<UserPreferences>) => void
}

export default function PreferencesPanel({
  preferences,
  isOpen,
  onClose,
  onSave,
}: PreferencesPanelProps) {
  const [localPrefs, setLocalPrefs] = useState<Partial<UserPreferences>>(preferences || {})

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences)
    }
  }, [preferences])

  const handlePurposeChange = (purpose: StudyPurpose) => {
    setLocalPrefs({ ...localPrefs, default_purpose: purpose })
  }

  const handleGroupSizeChange = (size: number) => {
    setLocalPrefs({ ...localPrefs, default_group_size: size })
  }

  const handleSave = () => {
    onSave(localPrefs)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-80 bg-white shadow-lg space-y-4 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Purpose selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Study Purpose</label>
          <div className="space-y-2">
            {[
              { value: 'individual_study', label: '📘 Individual Study', desc: 'Quiet, focused work' },
              { value: 'group_study', label: '👥 Group Study', desc: 'Collaborative learning' },
              { value: 'presentation', label: '🎤 Presentation', desc: 'High capacity, tech ready' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="purpose"
                  value={opt.value}
                  checked={localPrefs.default_purpose === opt.value}
                  onChange={() => handlePurposeChange(opt.value as StudyPurpose)}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{opt.label}</p>
                  <p className="text-xs text-gray-600">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Group size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Default Group Size: {localPrefs.default_group_size || 1}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={localPrefs.default_group_size || 1}
            onChange={(e) => handleGroupSizeChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Quiet threshold */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quiet Threshold: {(localPrefs.quiet_threshold || 2.5).toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={localPrefs.quiet_threshold || 2.5}
            onChange={(e) => setLocalPrefs({ ...localPrefs, quiet_threshold: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-600">Only show halls quieter than this</p>
        </div>

        {/* Preferred facilities */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preferred Facilities</label>
          <div className="space-y-1">
            {['projector', 'wifi', 'ac', 'whiteboard', 'wheelchair_accessible', 'power_sockets'].map((fac) => (
              <label key={fac} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPrefs.preferred_facilities?.includes(fac) || false}
                  onChange={(e) => {
                    const current = localPrefs.preferred_facilities || []
                    if (e.target.checked) {
                      setLocalPrefs({ ...localPrefs, preferred_facilities: [...current, fac] })
                    } else {
                      setLocalPrefs({
                        ...localPrefs,
                        preferred_facilities: current.filter((f) => f !== fac),
                      })
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{fac}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
}

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { NearMeToggle } from '../location/NearMeToggle';

export interface FilterState {
  searchQuery: string;
  minCapacity: number;
}

interface HallFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  nearMeActive: boolean;
  onNearMeToggle: (active: boolean) => void;
  isLocationLoading?: boolean;
  onOpenPreferences: () => void;
}

export function HallFilters({ filters, onChange, nearMeActive, onNearMeToggle, isLocationLoading, onOpenPreferences }: HallFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-3 rounded-2xl shadow-sm">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input 
          type="text"
          placeholder="Search by building, hall, or property..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="w-full bg-white/60 dark:bg-neutral-800/60 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
        />
      </div>

      <div className="flex gap-2 items-center">
        {/* Simple inline filter for capacity */}
        <select 
          value={filters.minCapacity}
          onChange={(e) => onChange({ ...filters, minCapacity: Number(e.target.value) })}
          className="bg-white/60 dark:bg-neutral-800/60 border-none rounded-xl px-3 py-2.5 text-sm outline-none text-neutral-700 dark:text-neutral-300"
        >
          <option value={0}>Any Size</option>
          <option value={10}>10+ Seats</option>
          <option value={50}>50+ Seats</option>
          <option value={100}>100+ Seats</option>
          <option value={200}>200+ Seats</option>
        </select>

        {/* Near Me Toggle */}
        <NearMeToggle 
          isActive={nearMeActive} 
          onToggle={onNearMeToggle} 
          isLoading={isLocationLoading} 
        />

        {/* Preferences Toggle */}
        <button 
          onClick={onOpenPreferences}
          className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 shadow-sm"
          title="Advanced Preferences"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}

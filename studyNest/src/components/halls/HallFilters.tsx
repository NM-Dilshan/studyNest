import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  minCapacity: number;
  status: 'all' | 'free' | 'occupied' | 'blocked';
}

interface HallFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onOpenPreferences: () => void;
}

export function HallFilters({ filters, onChange, onOpenPreferences }: HallFiltersProps) {
  return (
    <div className="themed-surface flex w-full flex-col items-stretch gap-4 rounded-[24px] border-l-4 border-l-[var(--brand-primary)] p-4 md:flex-row md:items-center">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
        <input 
          type="text"
          placeholder="Search by building, hall, or property..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="themed-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none"
        />
      </div>

      <div className="flex gap-2 items-center">
        {/* Simple inline filter for capacity */}
        <select 
          value={filters.minCapacity}
          onChange={(e) => onChange({ ...filters, minCapacity: Number(e.target.value) })}
          className="themed-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
        >
          <option value={0}>Any Size</option>
          <option value={10}>10+ Seats</option>
          <option value={50}>50+ Seats</option>
          <option value={100}>100+ Seats</option>
          <option value={200}>200+ Seats</option>
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FilterState['status'] })}
          className="themed-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
        >
          <option value="all">All Status</option>
          <option value="free">Free Now</option>
          <option value="occupied">Occupied</option>
          <option value="blocked">Blocked</option>
        </select>

        {/* Preferences Toggle */}
        <button 
          onClick={onOpenPreferences}
          className="themed-input rounded-xl p-2.5 text-[var(--text-soft)] transition-colors hover:bg-[var(--button-hover)]"
          title="Advanced Preferences"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}

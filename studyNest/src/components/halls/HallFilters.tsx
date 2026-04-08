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
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full rounded-[24px] border border-slate-200 border-l-4 border-l-[#2E6F95] bg-[#F8FBFD] p-4 shadow-sm shadow-slate-100/60">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input 
          type="text"
          placeholder="Search by building, hall, or property..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#2E6F95]/20 focus:border-[#2E6F95] outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex gap-2 items-center">
        {/* Simple inline filter for capacity */}
        <select 
          value={filters.minCapacity}
          onChange={(e) => onChange({ ...filters, minCapacity: Number(e.target.value) })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All Status</option>
          <option value="free">Free Now</option>
          <option value="occupied">Occupied</option>
          <option value="blocked">Blocked</option>
        </select>

        {/* Preferences Toggle */}
        <button 
          onClick={onOpenPreferences}
          className="p-2.5 bg-white rounded-xl hover:bg-slate-50 transition-colors text-slate-700 shadow-sm border border-slate-200"
          title="Advanced Preferences"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
}

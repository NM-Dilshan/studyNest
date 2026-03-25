import React from 'react';
import { Navigation } from 'lucide-react';

interface NearMeToggleProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isLoading?: boolean;
}

export function NearMeToggle({ isActive, onToggle, isLoading }: NearMeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isActive)}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
        ${isActive 
          ? 'bg-[#2E6F95] border-[#2E6F95] text-white shadow-md shadow-[#2E6F95]/25' 
          : 'bg-[#F8FBFD] border-slate-200 text-[#2E6F95] hover:bg-[#EEF6FA] hover:border-[#2E6F95]/40'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Navigation className={`w-4 h-4 ${isActive ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">Near Me Now</span>
    </button>
  );
}

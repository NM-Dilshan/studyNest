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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
        ${isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Navigation className={`w-4 h-4 ${isActive ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">Near Me Now</span>
    </button>
  );
}

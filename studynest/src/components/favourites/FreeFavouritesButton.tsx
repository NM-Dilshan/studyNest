import React from 'react';
import { Star } from 'lucide-react';

interface FreeFavouritesButtonProps {
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export function FreeFavouritesButton({ isActive, onClick, count }: FreeFavouritesButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
        isActive 
          ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25' 
          : 'bg-white/60 dark:bg-neutral-800/60 border-white/40 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 hover:border-amber-500/30 dark:hover:border-amber-500/30'
      }`}
    >
      <Star className={`w-4 h-4 ${isActive ? 'fill-white' : 'text-amber-500'}`} />
      <span>Free Favourites</span>
      {count !== undefined && count > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

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
          ? 'bg-[#2E6F95] border-[#2E6F95] text-white shadow-md shadow-[#2E6F95]/25' 
          : 'bg-[#F8FBFD] border-slate-200 text-[#2E6F95] hover:bg-[#EEF6FA] hover:border-[#2E6F95]/40'
      }`}
    >
      <Star className={`w-4 h-4 ${isActive ? 'fill-white text-white' : 'text-[#2E6F95]'}`} />
      <span>Free Favourites</span>
      {count !== undefined && count > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-[#2E6F95]/10 text-[#2E6F95]'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

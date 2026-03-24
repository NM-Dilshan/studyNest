import React from 'react';
import { MapPin, Users, Monitor, Wifi, Wind, Pencil, Accessibility, Plug } from 'lucide-react';
import { FreeHallResult } from '../../types/halls';
import { ConflictBadge } from './ConflictBadge';
import { SuitabilityBar } from './SuitabilityBar';
// Ignore the unresolved FavouriteButton component, we will create it next.
import { FavouriteButton } from '../favourites/FavouriteButton';

interface HallCardProps {
  hall: FreeHallResult;
  isFavourite?: boolean;
  onToggleFavourite?: (hallId: string) => void;
  userId?: string;
  usageInsight?: React.ReactNode;
}

export function HallCard({ hall, isFavourite = false, onToggleFavourite, userId, usageInsight }: HallCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
      {/* Header section */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
            {hall.name}
          </h3>
          <div className="flex items-center text-sm text-neutral-500 mt-1 gap-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {hall.building}, Fl {hall.floor}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {hall.capacity}</span>
            {hall.distance_km !== undefined && hall.distance_km !== null && (
              <span className="text-blue-500 dark:text-blue-400 font-medium">{hall.distance_km.toFixed(1)} km away</span>
            )}
          </div>
        </div>
        
        {userId && onToggleFavourite && (
          <FavouriteButton 
            isFavourite={isFavourite} 
            onClick={() => onToggleFavourite(hall.id)} 
          />
        )}
      </div>

      {/* Badges/Insights */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ConflictBadge status={hall.maintenance_status} />
        {usageInsight}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent mb-4" />

      {/* Facilities row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {hall.projector && <div title="Projector" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Monitor className="w-4 h-4"/></div>}
        {hall.wifi && <div title="WiFi" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Wifi className="w-4 h-4"/></div>}
        {hall.ac && <div title="Air Conditioning" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Wind className="w-4 h-4"/></div>}
        {hall.whiteboard && <div title="Whiteboard" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Pencil className="w-4 h-4"/></div>}
        {hall.wheelchair_accessible && <div title="Wheelchair Accessible" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Accessibility className="w-4 h-4"/></div>}
        {hall.power_sockets && <div title="Power Sockets" className="p-1.5 rounded-md bg-white/60 dark:bg-neutral-800/60 shadow-sm text-neutral-600 dark:text-neutral-400"><Plug className="w-4 h-4"/></div>}
      </div>

      {/* Score bar */}
      {hall.score !== undefined && (
        <SuitabilityBar score={hall.score} />
      )}
    </div>
  );
}

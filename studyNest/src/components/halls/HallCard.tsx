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
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 border-l-4 border-l-[#2E6F95] bg-[#F8FBFD] p-5 shadow-sm shadow-slate-100/60 transition-all hover:shadow-md group">
      {/* Header section */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            {hall.name}
          </h3>
          <div className="flex items-center text-sm text-slate-500 mt-1 gap-3 font-medium">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {hall.building}, Fl {hall.floor}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {hall.capacity}</span>
            {hall.distance_km !== undefined && hall.distance_km !== null && (
              <span className="text-[#2E6F95] font-semibold">{hall.distance_km.toFixed(1)} km away</span>
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
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4" />

      {/* Facilities row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {hall.projector && <div title="Projector" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Monitor className="w-4 h-4"/></div>}
        {hall.wifi && <div title="WiFi" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Wifi className="w-4 h-4"/></div>}
        {hall.ac && <div title="Air Conditioning" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Wind className="w-4 h-4"/></div>}
        {hall.whiteboard && <div title="Whiteboard" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Pencil className="w-4 h-4"/></div>}
        {hall.wheelchair_accessible && <div title="Wheelchair Accessible" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Accessibility className="w-4 h-4"/></div>}
        {hall.power_sockets && <div title="Power Sockets" className="p-1.5 rounded-md bg-white shadow-sm text-slate-600"><Plug className="w-4 h-4"/></div>}
      </div>

      {/* Score bar */}
      {hall.score !== undefined && (
        <SuitabilityBar score={hall.score} />
      )}
    </div>
  );
}

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
  const canBookNow = hall.can_book_now ?? hall.is_free_now;
  const borderAccent = canBookNow ? 'border-l-emerald-500' : 'border-l-rose-500';

  const shortTime = (value?: string | null) => (value ? value.substring(0, 5) : null);
  const freeUntil = shortTime(hall.free_until);
  const nextFree = shortTime(hall.next_free_start || hall.occupied_until);

  return (
    <div className={`themed-surface group relative overflow-hidden rounded-[28px] border-l-4 ${borderAccent} p-5 transition-all hover:shadow-[var(--surface-shadow-strong)]`}>
      {/* Header section */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-[var(--text-main)]">
            {hall.name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm font-medium text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {hall.building}, Fl {hall.floor}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {hall.capacity}</span>
            {hall.distance_km !== undefined && hall.distance_km !== null && (
              <span className="font-semibold text-[var(--brand-primary)]">{hall.distance_km.toFixed(1)} km away</span>
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
      <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[var(--surface-border)] to-transparent" />

      {(freeUntil || nextFree || hall.blocked_reason) && (
        <div className="themed-surface-muted mb-4 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-soft)]">
          {hall.blocked_reason ? (
            <span>Unavailable: {hall.blocked_reason}</span>
          ) : canBookNow && freeUntil ? (
            <span>Free until {freeUntil}</span>
          ) : nextFree ? (
            <span>Next free around {nextFree}</span>
          ) : null}
        </div>
      )}

      {/* Facilities row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {hall.projector && <div title="Projector" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Monitor className="w-4 h-4"/></div>}
        {hall.wifi && <div title="WiFi" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Wifi className="w-4 h-4"/></div>}
        {hall.ac && <div title="Air Conditioning" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Wind className="w-4 h-4"/></div>}
        {hall.whiteboard && <div title="Whiteboard" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Pencil className="w-4 h-4"/></div>}
        {hall.wheelchair_accessible && <div title="Wheelchair Accessible" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Accessibility className="w-4 h-4"/></div>}
        {hall.power_sockets && <div title="Power Sockets" className="themed-surface-muted rounded-md p-1.5 text-[var(--text-soft)]"><Plug className="w-4 h-4"/></div>}
      </div>

      {/* Score bar */}
      {hall.score !== undefined && (
        <SuitabilityBar score={hall.score} />
      )}
    </div>
  );
}

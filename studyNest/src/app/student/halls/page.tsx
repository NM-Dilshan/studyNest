'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import AppBackground from '@/components/AppBackground'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { HallFilters, FilterState } from '../../../components/halls/HallFilters'
import { HallCard } from '../../../components/halls/HallCard'
import { PreferencesPanel } from '../../../components/preferences/PreferencesPanel'
import { FreeFavouritesButton } from '../../../components/favourites/FreeFavouritesButton'
import { UsageInsightChip } from '../../../components/insights/UsageInsightChip'

// Hooks
import { useFreeHalls } from '../../../hooks/useFreeHalls';
import { useFreeFavourites } from '../../../hooks/useFreeFavourites';
import { useSuitabilityScores } from '../../../hooks/useSuitabilityScores';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { favouriteService } from '../../../services/favouriteService';
import MainHeader from '@/components/MainHeader';
import { FreeHallResult, UserPreferences } from '../../../types/halls';

function shortTime(value?: string | null): string | null {
  if (!value) return null;
  return value.substring(0, 5);
}

function buildUsageInsight(hall: FreeHallResult): { availabilityPercentage: number; timeString: string; customText: string } {
  const blockedNow = hall.current_status === 'blocked_by_maintenance';
  const canBookNow = hall.can_book_now ?? hall.is_free_now;

  if (blockedNow) {
    const reason = hall.blocked_reason || 'Temporarily unavailable';
    return {
      availabilityPercentage: 0,
      timeString: 'now',
      customText: reason,
    };
  }

  if (canBookNow) {
    const freeUntil = shortTime(hall.free_until);
    return {
      availabilityPercentage: 100,
      timeString: 'now',
      customText: freeUntil ? `Free now until ${freeUntil}` : 'Free now',
    };
  }

  const occupiedUntil = shortTime(hall.occupied_until || hall.next_free_start);
  return {
    availabilityPercentage: 0,
    timeString: 'now',
    customText: occupiedUntil ? `Occupied until ${occupiedUntil}` : 'Occupied now',
  };
}

function formatUpdatedTime(value: Date | null): string {
  if (!value) return 'Not synced yet';
  return value.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function buildTopPickReason(hall: FreeHallResult): string {
  const parts: string[] = [];

  if (hall.score !== undefined) {
    parts.push(`Suitability ${Math.round(hall.score)}%`);
  }

  const freeUntil = shortTime(hall.free_until);
  parts.push(freeUntil ? `Free until ${freeUntil}` : 'Free now');

  return parts.join(' • ');
}

export default function FreeHallFinder() {
  // In a real app, get from auth context. Using a placeholder for now.
  const MOCK_USER_ID = "student-123";

  const { halls, loading: hallsLoading, error: hallsError, lastUpdated, refetch: refetchHalls } = useFreeHalls();
  const { computeScores, loading: scoringLoading } = useSuitabilityScores();
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences(MOCK_USER_ID);
  const { favourites, refetch: refetchFavourites } = useFreeFavourites(MOCK_USER_ID);

  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', minCapacity: 0, status: 'all' });
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  const [refreshingNow, setRefreshingNow] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  
  const [scoredHalls, setScoredHalls] = useState<FreeHallResult[]>([]);

  useEffect(() => {
    async function processHalls() {
      if (!halls.length) {
        setScoredHalls([]);
        return;
      }
      
      // Compute scores, passing halls data for client-side scoring
      const scores = await computeScores(
        halls.map(h => h.id),
        preferences as Partial<UserPreferences>,
        halls
      );
      
      const processed = halls.map(hall => {
        const scoreData = scores.find(s => s.hall_id === hall.id);
        
        return {
          ...hall,
          score: scoreData?.score || 0,
          scoreBreakdown: scoreData?.breakdown
        };
      });
      
      setScoredHalls(processed);
    }
    processHalls();
  }, [halls, preferences, computeScores]);

  const handleToggleFavourite = async (hallId: string) => {
    const isFav = favourites.some(f => f.id === hallId);
    try {
      if (isFav) {
        await favouriteService.removeFavourite(MOCK_USER_ID, hallId);
      } else {
        await favouriteService.addFavourite(MOCK_USER_ID, hallId);
      }
      refetchFavourites();
    } catch (err) {
      console.error('Error toggling favourite:', err);
    }
  };

  const displayHalls = useMemo(() => {
    let result = [...scoredHalls];

    if (showOnlyFavourites) {
      const favIds = favourites.map(f => f.id);
      result = result.filter(h => favIds.includes(h.id));
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name?.toLowerCase().includes(q) || 
        h.building?.toLowerCase().includes(q)
      );
    }

    if (filters.minCapacity > 0) {
      result = result.filter(h => h.capacity >= filters.minCapacity);
    }

    if (filters.status !== 'all') {
      result = result.filter((hall) => {
        const isBlocked = hall.current_status === 'blocked_by_maintenance';
        const isFree = hall.can_book_now ?? hall.is_free_now;
        const isOccupied = !isBlocked && !isFree;

        if (filters.status === 'free') return isFree;
        if (filters.status === 'occupied') return isOccupied;
        if (filters.status === 'blocked') return isBlocked;
        return true;
      });
    }

    result.sort((a, b) => {
      const aCanBook = Number(a.can_book_now ?? a.is_free_now);
      const bCanBook = Number(b.can_book_now ?? b.is_free_now);
      if (aCanBook !== bCanBook) {
        return bCanBook - aCanBook;
      }
      return (b.score || 0) - (a.score || 0);
    });

    return result;
  }, [scoredHalls, filters, showOnlyFavourites, favourites]);

  const renderHallCard = (hall: FreeHallResult) => {
    const usage = buildUsageInsight(hall);

    return (
      <HallCard
        key={hall.id}
        hall={hall}
        userId={MOCK_USER_ID}
        isFavourite={favourites.some(f => f.id === hall.id)}
        onToggleFavourite={handleToggleFavourite}
        usageInsight={
          <UsageInsightChip
            availabilityPercentage={usage.availabilityPercentage}
            timeString={usage.timeString}
            customText={usage.customText}
          />
        }
      />
    );
  };

  const topRecommendedHalls = useMemo(() => {
    const candidates = displayHalls.filter((hall) => hall.can_book_now ?? hall.is_free_now);
    return candidates.slice(0, 3);
  }, [displayHalls]);

  const handleManualRefresh = async () => {
    try {
      setRefreshingNow(true);
      await refetchHalls();
      const now = new Date();
      setRefreshNotice(`Updated at ${formatUpdatedTime(now)}`);
    } catch {
      setRefreshNotice('Refresh failed. Please try again.');
    } finally {
      setRefreshingNow(false);
      setTimeout(() => setRefreshNotice(null), 2400);
    }
  };

  const liveStatusSummary = useMemo(() => {
    const blocked = scoredHalls.filter((hall) => hall.current_status === 'blocked_by_maintenance').length;
    const freeNow = scoredHalls.filter((hall) => hall.can_book_now ?? hall.is_free_now).length;
    const occupied = Math.max(scoredHalls.length - blocked - freeNow, 0);

    return {
      total: scoredHalls.length,
      freeNow,
      occupied,
      blocked,
    };
  }, [scoredHalls]);

  const shownStatusSummary = useMemo(() => {
    const blocked = displayHalls.filter((hall) => hall.current_status === 'blocked_by_maintenance').length;
    const freeNow = displayHalls.filter((hall) => hall.can_book_now ?? hall.is_free_now).length;
    const occupied = Math.max(displayHalls.length - blocked - freeNow, 0);

    return {
      total: displayHalls.length,
      freeNow,
      occupied,
      blocked,
    };
  }, [displayHalls]);

  return (
    <AppBackground>
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="hall-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 36 L36 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hall-grid)" />
        </svg>
      </div>

      <MainHeader />

      <div className="relative z-10 mx-auto max-w-7xl p-4 md:p-8">
        <PageHeader
          eyebrow="StudyNest Spaces"
          title="Find a Study Space"
          subtitle="Discover free lecture halls instantly and rank them by your live preferences."
          actions={
            <FreeFavouritesButton
              isActive={showOnlyFavourites}
              onClick={() => setShowOnlyFavourites(!showOnlyFavourites)}
              count={favourites.length}
            />
          }
          className="mb-8"
        />

        <div className="mb-8">
          <HallFilters 
            filters={filters}
            onChange={setFilters}
            onOpenPreferences={() => setShowPreferences(true)}
          />
        </div>

        <div className="themed-surface mb-6 rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="themed-badge-success inline-flex items-center gap-1 rounded-full px-3 py-1">
                Free now: {shownStatusSummary.freeNow}
              </span>
              <span className="themed-badge-warning inline-flex items-center gap-1 rounded-full px-3 py-1">
                Occupied: {shownStatusSummary.occupied}
              </span>
              <span className="themed-badge-danger inline-flex items-center gap-1 rounded-full px-3 py-1">
                Blocked: {shownStatusSummary.blocked}
              </span>
              <span className="themed-badge-neutral inline-flex items-center gap-1 rounded-full px-3 py-1">
                Showing: {shownStatusSummary.total} / {liveStatusSummary.total}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Last synced: {formatUpdatedTime(lastUpdated)}
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={hallsLoading || refreshingNow}
                className="themed-input inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)] transition hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${hallsLoading || refreshingNow ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {refreshNotice && (
            <p className="mt-3 text-xs font-semibold text-[var(--brand-primary)]">{refreshNotice}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[var(--surface-border)] pt-3 text-[11px] font-semibold text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Card left border green = Bookable now
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Occupied = In timetable at this time (not bookable)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Card left border red = Not bookable now
            </span>
          </div>
        </div>

        {topRecommendedHalls.length > 0 && (
          <div className="themed-surface-muted mb-6 rounded-2xl border-[var(--accent-border)] px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--accent-text)]">
              <Sparkles className="h-4 w-4" />
              Top Picks Right Now
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {topRecommendedHalls.map((hall, index) => (
                <div key={hall.id} className="themed-surface rounded-xl px-3 py-2">
                  <p className="text-xs font-black uppercase tracking-wide text-[var(--accent-text)]">Rank #{index + 1}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-main)]">{hall.name}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">{hall.building}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-500">
                    {buildTopPickReason(hall)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hallsError && (
          <div className="mb-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-500">
            {hallsError}
          </div>
        )}

        {hallsLoading || scoringLoading ? (
          <div className="themed-surface flex items-center justify-center rounded-[28px] py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)]"></div>
          </div>
        ) : displayHalls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayHalls.map((hall) => renderHallCard(hall))}
          </div>
        ) : (
          <EmptyState
            title="No halls available"
            description="No halls match your current filters. Try widening capacity, status, or keyword filters."
            icon={<span className="text-3xl">🪹</span>}
            action={
              <button
                onClick={() => {
                  setFilters({ searchQuery: '', minCapacity: 0, status: 'all' });
                  setShowOnlyFavourites(false);
                }}
                className="rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[var(--brand-primary-dark)]"
              >
                Clear Filters
              </button>
            }
          />
        )}

      </div>

      <PreferencesPanel 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        onSave={updatePreferences}
        isLoading={prefsLoading}
      />
    </AppBackground>
  )
}

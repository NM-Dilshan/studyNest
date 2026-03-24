'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { HallFilters, FilterState } from '../../../components/halls/HallFilters';
import { HallCard } from '../../../components/halls/HallCard';
import { PreferencesPanel } from '../../../components/preferences/PreferencesPanel';
import { FreeFavouritesButton } from '../../../components/favourites/FreeFavouritesButton';
import { UsageInsightChip } from '../../../components/insights/UsageInsightChip';
import { calculateDistance } from '../../../utils/distance';

// Hooks
import { useFreeHalls } from '../../../hooks/useFreeHalls';
import { useFreeFavourites } from '../../../hooks/useFreeFavourites';
import { useSuitabilityScores } from '../../../hooks/useSuitabilityScores';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { favouriteService } from '../../../services/favouriteService';

export default function FreeHallFinder() {
  // In a real app, get from auth context. Using a placeholder for now.
  const MOCK_USER_ID = "student-123";

  const { halls, loading: hallsLoading, error: hallsError } = useFreeHalls();
  const { computeScores, loading: scoringLoading } = useSuitabilityScores();
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences(MOCK_USER_ID);
  const { favourites, refetch: refetchFavourites } = useFreeFavourites(MOCK_USER_ID);
  const { latitude, longitude, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const [filters, setFilters] = useState<FilterState>({ searchQuery: '', minCapacity: 0 });
  const [showPreferences, setShowPreferences] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  
  const [scoredHalls, setScoredHalls] = useState<any[]>([]);

  useEffect(() => {
    async function processHalls() {
      if (!halls.length) {
        setScoredHalls([]);
        return;
      }
      
      // Compute scores, passing halls data for client-side scoring
      const scores = await computeScores(
        halls.map(h => h.id), 
        preferences as any,
        halls
      );
      
      const processed = halls.map(hall => {
        const scoreData = scores.find(s => s.hall_id === hall.id);
        let dist = undefined;
        if (latitude && longitude && hall.latitude && hall.longitude) {
          dist = calculateDistance(latitude, longitude, hall.latitude, hall.longitude);
        }
        
        return {
          ...hall,
          score: scoreData?.score || 0,
          scoreBreakdown: scoreData?.breakdown,
          distance_km: dist
        };
      });
      
      setScoredHalls(processed);
    }
    processHalls();
  }, [halls, preferences, computeScores, latitude, longitude]);

  const handleNearMeToggle = (active: boolean) => {
    setNearMeActive(active);
    if (active && !latitude) {
      requestLocation();
    }
  };

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

    if (nearMeActive) {
      result = result.filter(h => h.distance_km !== undefined);
      result.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    } else {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return result;
  }, [scoredHalls, filters, showOnlyFavourites, favourites, nearMeActive]);

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500">
              Find a Study Space
            </h1>
            <p className="text-neutral-500 mt-2 text-lg font-medium">
              Discover free lecture halls instantly based on your preferences.
            </p>
          </div>
          
          <FreeFavouritesButton 
            isActive={showOnlyFavourites}
            onClick={() => setShowOnlyFavourites(!showOnlyFavourites)}
            count={favourites.length}
          />
        </div>

        <div className="mb-8">
          <HallFilters 
            filters={filters}
            onChange={setFilters}
            nearMeActive={nearMeActive}
            onNearMeToggle={handleNearMeToggle}
            isLocationLoading={geoLoading}
            onOpenPreferences={() => setShowPreferences(true)}
          />
        </div>

        {geoError && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{geoError}</div>}
        {hallsError && <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{hallsError}</div>}

        {hallsLoading || scoringLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : displayHalls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayHalls.map((hall) => (
              <HallCard 
                key={hall.id}
                hall={hall}
                userId={MOCK_USER_ID}
                isFavourite={favourites.some(f => f.id === hall.id)}
                onToggleFavourite={handleToggleFavourite}
                usageInsight={
                  <UsageInsightChip 
                    availabilityPercentage={hall.is_free_now ? 100 : 0}
                    timeString={hall.is_free_now ? "Free now" : "Occupied"} 
                  />
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🪹</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No halls available</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              We couldn&apos;t find any free halls matching your current filters. Try relaxing your capacity requirements or changing your preferences.
            </p>
            <button 
              onClick={() => {
                setFilters({ searchQuery: '', minCapacity: 0 });
                setShowOnlyFavourites(false);
                setNearMeActive(false);
              }}
              className="mt-6 px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>

      <PreferencesPanel 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        onSave={updatePreferences}
        isLoading={prefsLoading}
      />
    </div>
  );
}

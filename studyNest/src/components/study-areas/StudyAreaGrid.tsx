"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { StudyAreaCard } from "@/components/study-areas/StudyAreaCard";
import type { CrowdStatus } from "@/lib/geofence";

export interface StudyAreaGridItem {
  id: string;
  name: string;
  building: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number;
  currentCount: number;
  availableSeats: number;
  occupancyPercentage: number;
  crowdStatus: CrowdStatus;
  capacity: number;
  updatedAt?: string;
  insideUsers?: {
    id: string;
    label: string;
    joinedAt: number;
    latitude: number;
    longitude: number;
  }[];
  features?: {
    wifi?: boolean;
    quietZone?: boolean;
    cafe?: boolean;
    chargingPorts?: boolean;
    ac?: boolean;
  };
}

interface StudyAreaGridProps {
  isLoading: boolean;
  items: StudyAreaGridItem[];
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  onAreaHover?: (areaId: string | null) => void;
}

export default function StudyAreaGrid({ isLoading, items, userLocation, onAreaHover }: StudyAreaGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="themed-surface space-y-3 rounded-2xl p-4">
            <LoadingSkeleton className="h-6 w-2/3" />
            <LoadingSkeleton className="h-4 w-1/2" />
            <LoadingSkeleton className="h-20 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No study areas match your filters"
        description="Try a different crowd level, building, or feature filter. You can also reset all filters to view every active study area."
        icon={<MapPin className="h-6 w-6" />}
      />
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, delay: index * 0.03, ease: "easeOut" }}
          onMouseEnter={() => onAreaHover?.(item.id)}
          onMouseLeave={() => onAreaHover?.(null)}
        >
          <StudyAreaCard
            id={item.id}
            name={item.name}
            building={item.building}
            latitude={item.latitude}
            longitude={item.longitude}
            radiusMeters={item.radiusMeters}
            userLocation={userLocation}
            currentCount={item.currentCount}
            availableSeats={item.availableSeats}
            occupancyPercentage={item.occupancyPercentage}
            crowdStatus={item.crowdStatus}
            capacity={item.capacity}
            updatedAt={item.updatedAt}
            insideUsers={item.insideUsers}
            features={item.features}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

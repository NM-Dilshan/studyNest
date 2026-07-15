'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { AlertCircle, Compass, MapPin } from 'lucide-react'
import { CrowdStatus } from '@/lib/geofence'
import GlassCard from '@/components/ui/GlassCard'
import StatusBadge from '@/components/ui/StatusBadge'
import OccupancyIndicator from '@/components/ui/OccupancyIndicator'
import EmptyState from '@/components/ui/EmptyState'

interface StudyAreaLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  crowdStatus: CrowdStatus
  currentCount: number
  capacity: number
}

interface LiveStudentLocation {
  study_area_id?: string | null
  latitude: number
  longitude: number
  updated_at?: string
}

interface StudyAreaMapProps {
  areas: StudyAreaLocation[]
  liveStudents?: LiveStudentLocation[]
  hoveredAreaId?: string | null
  onAreaClick?: (areaId: string) => void
}

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

const crowdColors: Record<CrowdStatus, { stroke: string; fill: string; marker: string }> = {
  'Low Crowd': { stroke: '#16a34a', fill: '#4ade80', marker: '#16a34a' },
  'Medium Crowd': { stroke: '#ca8a04', fill: '#facc15', marker: '#ca8a04' },
  'High Crowd': { stroke: '#dc2626', fill: '#f87171', marker: '#dc2626' },
}

export function StudyAreaMap({ areas, liveStudents = [], hoveredAreaId, onAreaClick }: StudyAreaMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const zoneLayersRef = useRef<L.LayerGroup | null>(null)
  const studentLayersRef = useRef<L.LayerGroup | null>(null)

  const mapCenter = useMemo<[number, number]>(() => {
    if (areas.length === 0) return [6.9147, 79.9729]
    const latSum = areas.reduce((sum, area) => sum + area.latitude, 0)
    const lngSum = areas.reduce((sum, area) => sum + area.longitude, 0)
    return [latSum / areas.length, lngSum / areas.length]
  }, [areas])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      fixLeafletIcons()
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView(mapCenter, 17)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current)

      zoneLayersRef.current = L.layerGroup().addTo(mapRef.current)
      studentLayersRef.current = L.layerGroup().addTo(mapRef.current)
    }

    zoneLayersRef.current?.clearLayers()
    studentLayersRef.current?.clearLayers()

    const bounds = L.latLngBounds([])

    areas.forEach((area) => {
      const isHovered = hoveredAreaId === area.id || selectedArea === area.id
      const tone = crowdColors[area.crowdStatus] || crowdColors['Low Crowd']

      L.circle([area.latitude, area.longitude], {
        radius: area.radiusMeters,
        color: tone.stroke,
        fillColor: tone.fill,
        fillOpacity: isHovered ? 0.28 : 0.18,
        weight: isHovered ? 4 : 2,
      }).addTo(zoneLayersRef.current!)

      const marker = L.circleMarker([area.latitude, area.longitude], {
        radius: isHovered ? 8 : 6,
        color: tone.stroke,
        fillColor: tone.fill,
        fillOpacity: 0.95,
        weight: 2,
      })
        .bindPopup(
          `<strong>${area.name}</strong><br/><em>${area.currentCount} inside / ${area.capacity} capacity</em>`
        )
        .addTo(zoneLayersRef.current!)

      if (isHovered) {
        marker.openPopup()
      }

      bounds.extend([area.latitude, area.longitude])
    })

    liveStudents.forEach((student, index) => {
      const marker = L.circleMarker([student.latitude, student.longitude], {
        radius: 5,
        color: '#2563eb',
        fillColor: '#93c5fd',
        fillOpacity: 0.95,
        weight: 2,
      })
        .bindTooltip(`Live student ${index + 1}`, {
          direction: 'top',
          opacity: 0.9,
          offset: [0, -4],
        })
        .addTo(studentLayersRef.current!)

      bounds.extend([student.latitude, student.longitude])
    })

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds.pad(0.2))
    } else {
      mapRef.current.setView(mapCenter, 17)
    }

    return () => {
      // keep map instance for reuse between renders
    }
  }, [areas, hoveredAreaId, liveStudents, mapCenter, selectedArea])

  if (!areas || areas.length === 0) {
    return (
      <EmptyState
        title="No study area map data"
        description="Map insights will appear once active study areas with GPS coordinates are available."
        icon={<MapPin className="h-6 w-6" />}
      />
    )
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-main)]">Live Study Area Map</h2>
          <p className="text-xs text-[var(--text-soft)]">
            {areas.length} mapped zones • {liveStudents.length} live students • aggregate occupancy only
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-text)]">
          <Compass className="h-3.5 w-3.5" />
          Campus Map
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--surface-border)]">
        <div ref={mapContainerRef} className="h-[420px] w-full bg-slate-100" />
      </div>

      <div className="mt-4 space-y-3">
        {areas.map((area, index) => {
          const isHovered = hoveredAreaId === area.id || selectedArea === area.id
          const occupancyPercentage = area.capacity > 0 ? (area.currentCount / area.capacity) * 100 : 0

          return (
            <button
              key={area.id || `area-map-${index}`}
              type="button"
              onClick={() => {
                setSelectedArea(area.id)
                onAreaClick?.(area.id)
              }}
              aria-pressed={isHovered}
              aria-label={`${area.name}, ${area.currentCount} of ${area.capacity} seats occupied`}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                isHovered
                  ? 'border-[var(--button-primary-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--focus-ring)]'
                  : 'themed-inset hover:border-[var(--surface-border-strong)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text-main)]">{area.name}</h4>
                  {typeof area.latitude === 'number' && typeof area.longitude === 'number' && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <StatusBadge status={area.crowdStatus} />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Radius: {area.radiusMeters}m</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <p className="text-sm text-[var(--text-soft)]">
                  <span className="font-semibold text-[var(--text-main)]">{area.currentCount}</span> / {area.capacity} students
                </p>
                <OccupancyIndicator percentage={occupancyPercentage} label="Zone occupancy" />
              </div>
            </button>
          )
        })}
      </div>

      <div className="themed-inset mt-4 rounded-xl p-4">
        <p className="mb-3 text-sm font-medium text-[var(--text-main)]">Legend</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-[var(--text-soft)]">Low crowd (&lt;=30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-[var(--text-soft)]">Medium crowd (30% - 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-[var(--text-soft)]">High crowd (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-[var(--text-soft)]">Live students</span>
          </div>
        </div>
      </div>

      <div className="themed-panel-info mt-4 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="themed-panel-title mb-1 text-sm font-medium">Privacy Protected</p>
            <p className="themed-panel-copy text-sm">
              This map displays aggregated occupancy and anonymized live student dots only. Individual user identities are never shown.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

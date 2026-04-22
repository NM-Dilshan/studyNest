'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { haversineDistance } from '@/lib/geofence'

type CrowdTone = 'low' | 'medium' | 'high'

type StudyAreaCardMapPreviewProps = {
  areaName: string
  latitude: number
  longitude: number
  radiusMeters: number
  currentCount: number
  crowdTone: CrowdTone
  insideUsers?: {
    id: string
    label: string
    joinedAt: number
    latitude: number
    longitude: number
  }[]
  userLocation?: {
    latitude: number
    longitude: number
  } | null
}

const toneColors: Record<CrowdTone, { stroke: string; fill: string }> = {
  low: { stroke: '#16a34a', fill: '#4ade80' },
  medium: { stroke: '#ca8a04', fill: '#facc15' },
  high: { stroke: '#dc2626', fill: '#f87171' },
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

export default function StudyAreaCardMapPreview({
  areaName,
  latitude,
  longitude,
  radiusMeters,
  currentCount,
  crowdTone,
  insideUsers = [],
  userLocation,
}: StudyAreaCardMapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const zoneMarkerRef = useRef<L.Marker | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const insideUserMarkersRef = useRef<L.CircleMarker[]>([])
  const zoneCircleRef = useRef<L.Circle | null>(null)

  const userInsideZone = useMemo(() => {
    if (!userLocation) return false
    const distance = haversineDistance(
      { latitude, longitude },
      { latitude: userLocation.latitude, longitude: userLocation.longitude }
    )
    return distance <= radiusMeters
  }, [latitude, longitude, radiusMeters, userLocation])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      fixLeafletIcons()
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: false,
      }).setView([latitude, longitude], 18)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
      }).addTo(mapRef.current)
    }

    if (zoneMarkerRef.current) mapRef.current.removeLayer(zoneMarkerRef.current)
    if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current)
    insideUserMarkersRef.current.forEach((marker) => mapRef.current?.removeLayer(marker))
    insideUserMarkersRef.current = []
    if (zoneCircleRef.current) mapRef.current.removeLayer(zoneCircleRef.current)

    const color = toneColors[crowdTone]

    zoneMarkerRef.current = L.marker([latitude, longitude])
      .bindPopup(
        `<strong>${areaName}</strong><br/><em>Zone radius: ${radiusMeters}m</em><br/><strong>Users inside: ${currentCount}</strong>`
      )
      .addTo(mapRef.current)

    zoneCircleRef.current = L.circle([latitude, longitude], {
      radius: radiusMeters,
      color: color.stroke,
      fillColor: color.fill,
      fillOpacity: 0.22,
      weight: 3,
    }).addTo(mapRef.current)

    if (userLocation) {
      userMarkerRef.current = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 7,
        color: userInsideZone ? '#2563eb' : '#6b7280',
        fillColor: userInsideZone ? '#60a5fa' : '#9ca3af',
        fillOpacity: 0.95,
        weight: 2,
      })
        .bindPopup(
          userInsideZone
            ? '<strong>You are inside this study zone</strong>'
            : '<strong>Your location</strong><br/><em>Outside this study zone</em>'
        )
        .addTo(mapRef.current)
    }

    insideUsers.forEach((user, index) => {
      const marker = L.circleMarker([user.latitude, user.longitude], {
        radius: 5,
        color: '#0f766e',
        fillColor: '#2dd4bf',
        fillOpacity: 0.95,
        weight: 2,
      })
        .bindTooltip(user.label, {
          direction: 'top',
          opacity: 0.9,
          offset: [0, -4],
        })
        .bindPopup(`<strong>${user.label}</strong><br/><em>Live inside user ${index + 1}</em>`)
      
      if (mapRef.current) {
        marker.addTo(mapRef.current)
      }

      insideUserMarkersRef.current.push(marker)
    })

    mapRef.current.setView([latitude, longitude], 18)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [areaName, crowdTone, insideUsers, latitude, longitude, radiusMeters, userInsideZone, userLocation])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-40 w-full bg-slate-100" />
      {userLocation && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
          {userInsideZone ? 'Inside zone' : 'Outside zone'}
        </div>
      )}
      <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm ring-1 ring-slate-200">
        {currentCount} inside
      </div>
    </div>
  )
}

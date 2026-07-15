'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

type StudyAreaCardMapPreviewProps = {
  latitude: number
  longitude: number
  radiusMeters?: number
  title?: string
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
  latitude,
  longitude,
  radiusMeters = 20,
  title = 'Study Area',
}: StudyAreaCardMapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

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

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current)
    }

    if (circleRef.current) {
      mapRef.current.removeLayer(circleRef.current)
    }

    markerRef.current = L.marker([latitude, longitude])
      .bindPopup(`<strong>${title}</strong><br><em>Zone radius: ${radiusMeters}m</em>`)
      .addTo(mapRef.current)

    circleRef.current = L.circle([latitude, longitude], {
      radius: radiusMeters,
      color: '#2563eb',
      fillColor: '#60a5fa',
      fillOpacity: 0.24,
      weight: 3,
    }).addTo(mapRef.current)

    mapRef.current.setView([latitude, longitude], 18)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, radiusMeters, title])

  return <div ref={mapContainerRef} className="h-36 w-full bg-slate-100" />
}

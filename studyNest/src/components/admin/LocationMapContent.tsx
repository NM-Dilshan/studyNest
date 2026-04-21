'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

interface LocationMapContentProps {
  center: [number, number]
  bounds: [[number, number], [number, number]]
  markerPosition: { lat: number; lng: number } | null
  radius: number
  onMapClick: (lat: number, lng: number) => void
}

// Fix Leaflet's default icon paths for Next.js
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

export default function LocationMapContent({
  center,
  bounds,
  markerPosition,
  radius,
  onMapClick,
}: LocationMapContentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || !isMapLoaded) return

    if (!map.current) {
      // Initialize map
      fixLeafletIcons()
      map.current = L.map(mapContainer.current, {
        maxBounds: L.latLngBounds(
          L.latLng(bounds[0][0], bounds[0][1]),
          L.latLng(bounds[1][0], bounds[1][1])
        ),
        maxBoundsViscosity: 1.0, // Prevents panning outside bounds
      }).setView(center, 18)

      // Fit map to bounds on initial load
      map.current.fitBounds([
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]],
      ], { padding: [50, 50] })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© OpenStreetMap contributors',
        maxZoom: 22,
      }).addTo(map.current)

      // Map click handler
      map.current.on('click', (e) => {
        const { lat, lng } = e.latlng
        onMapClick(lat, lng)
      })
    } else {
      // Update map center if changed and ensure it's within bounds
      if (map.current.getBounds().contains(L.latLng(center[0], center[1]))) {
        map.current.setView(center, 18)
      } else {
        // If center is not in bounds, fit to bounds
        map.current.fitBounds([
          [bounds[0][0], bounds[0][1]],
          [bounds[1][0], bounds[1][1]],
        ], { padding: [50, 50] })
      }
    }

    // Update or create marker and circle
    if (markerPosition) {
      // Remove old marker and circle
      if (markerRef.current) {
        map.current!.removeLayer(markerRef.current)
      }
      if (circleRef.current) {
        map.current!.removeLayer(circleRef.current)
      }

      // Create new marker
      markerRef.current = L.marker([markerPosition.lat, markerPosition.lng], {
        icon: L.icon({
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup(`<strong>Selected Location</strong><br><em>Zone radius: ${radius}m</em>`)
        .openPopup()
        .addTo(map.current!)

      // Create circle with dynamic radius
      circleRef.current = L.circle(
        [markerPosition.lat, markerPosition.lng],
        {
          radius: radius, // Dynamic radius in meters
          color: '#2563eb',
          fillColor: '#60a5fa',
          fillOpacity: 0.24,
          weight: 3,
          dashArray: undefined,
        }
      ).addTo(map.current!)
    }

    return () => {
      // Cleanup is handled by Leaflet, don't remove map on unmount
    }
  }, [center, bounds, markerPosition, radius, isMapLoaded, onMapClick])

  useEffect(() => {
    // Trigger map initialization after component mounts
    setIsMapLoaded(true)
  }, [])

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 bg-slate-100"
      style={{ minHeight: '400px' }}
    />
  )
}

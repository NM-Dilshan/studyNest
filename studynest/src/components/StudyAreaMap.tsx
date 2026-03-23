'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface StudyArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_meters: number;
}

interface MapOccupancy {
  [areaId: string]: number;
}

export default function StudyAreaMap({
  areas,
  token,
  occupancy = {},
}: {
  areas: StudyArea[];
  token: string;
  occupancy?: MapOccupancy;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentOccupancy, setCurrentOccupancy] = useState<MapOccupancy>(occupancy);

  // Update occupancy when it changes (for real-time updates via props)
  useEffect(() => {
    setCurrentOccupancy(occupancy);
  }, [occupancy]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;

    if (!map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [
            areas[0]?.lng || 80.771,
            areas[0]?.lat || 7.873,
          ],
          zoom: 15,
        });
      } catch (error) {
        console.error('Failed to initialize Mapbox:', error);
        return;
      }
    }

    // Add layers once map loads
    map.current.on('load', () => {
      areas.forEach((area) => {
        const sourceId = `area-${area.id}`;
        const circleLayerId = `area-${area.id}-circle`;
        const labelLayerId = `area-${area.id}-label`;

        // Skip if already added
        if (map.current?.getSource(sourceId)) {
          return;
        }

        // Add source
        map.current?.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { name: area.name },
            geometry: {
              type: 'Point',
              coordinates: [area.lng, area.lat],
            },
          },
        });

        // Add filled circle (area boundary)
        map.current?.addLayer({
          id: circleLayerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              area.radius_meters * 0.5,
              20,
              area.radius_meters * 0.1,
            ],
            'circle-color': '#3b82f6',
            'circle-opacity': 0.2,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#1e40af',
            'circle-stroke-opacity': 0.6,
          },
        });

        // Add label with count
        map.current?.addLayer({
          id: labelLayerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 13,
            'text-offset': [0, -2],
            'text-anchor': 'bottom',
          },
          paint: {
            'text-color': '#1f2937',
            'text-halo-color': '#fff',
            'text-halo-width': 2,
          },
        });

        // Add popup on hover
        const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

        map.current?.on('mouseenter', circleLayerId, (e) => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
            const count = currentOccupancy[area.id] || 0;
            popup
              .setLngLat(e.lngLat)
              .setHTML(
                `<div class="p-2"><strong>${area.name}</strong><br/>${count} students</div>`
              )
              .addTo(map.current);
          }
        });

        map.current?.on('mouseleave', circleLayerId, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
          popup.remove();
        });
      });
    });

    return () => {
      // Don't destroy map on unmount, just clean up listeners
    };
  }, [areas, token]);

  // Update labels with live counts
  useEffect(() => {
    if (!map.current) return;

    Object.entries(currentOccupancy).forEach(([areaId, count]) => {
      const area = areas.find((a) => a.id === areaId);
      if (area && map.current?.getSource(`area-${areaId}`)) {
        // Update the source data with new count
        (map.current.getSource(`area-${areaId}`) as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: { name: `${area.name}\n${count} students` },
          geometry: {
            type: 'Point',
            coordinates: [area.lng, area.lat],
          },
        });
      }
    });
  }, [currentOccupancy, areas]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[500px] rounded-lg shadow-md border border-gray-200" />
      <p className="text-xs text-gray-400 mt-2 text-center">
        Blue circles show study area boundaries. Hover to see current occupancy.
      </p>
    </div>
  );
}

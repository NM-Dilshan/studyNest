# StudyNest GPS Tracking - Setup & Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd studynest
npm install
```

This installs:
- `leaflet` 1.9.4 - Mapping library
- `react-leaflet` 4.2.3 - React components for Leaflet
- `@types/leaflet` 1.9.8 - TypeScript types

### 2. Update Prisma Schema
The schema.prisma file has been updated with GPS fields. Generate the Prisma client:
```bash
npx prisma generate
```

### 3. Create Migration
Create and run the migration for the new GPS fields:
```bash
npx prisma migrate dev --name add_gps_fields
```

This adds to `study_areas` table:
- `latitude` (Float)
- `longitude` (Float)  
- `radius_meters` (Int, default 20)

### 4. Seed Example Data (Bird Nest)
Create a study area via API:

```bash
curl -X POST http://localhost:3000/api/study-areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bird Nest",
    "building": "Library",
    "floor": "3",
    "capacity": 150,
    "latitude": 40.8055,
    "longitude": -73.9626,
    "radiusMeters": 20,
    "facilities": {
      "wifi": true,
      "chargingPorts": true,
      "silentZone": true,
      "ac": true
    }
  }'
```

Or use any REST client (Postman, Insomnia, VS Code REST Client).

Example coordinates (Columbia University):
- Latitude: 40.8055
- Longitude: -73.9626

Replace with your campus coordinates.

## Testing the System

### Test 1: Create Study Areas
```bash
# Create multiple study areas
curl -X POST http://localhost:3000/api/study-areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math Reading Room",
    "building": "Math Building",
    "floor": "2",
    "capacity": 50,
    "latitude": 40.8060,
    "longitude": -73.9630,
    "radiusMeters": 20
  }'
```

### Test 2: Verify Study Areas API
```bash
curl http://localhost:3000/api/study-areas
```

Expected response:
```json
{
  "areas": [
    {
      "id": "...",
      "name": "Bird Nest",
      "capacity": 150,
      "currentCount": 0,
      "occupancyPercentage": 0,
      "crowdStatus": "Low Crowd",
      "trendStatus": "Stable",
      "lastUpdated": "2024-...",
      "facilities": {...}
    }
  ],
  "summary": {
    "lowCrowdCount": 1,
    "mediumCrowdCount": 0,
    "highCrowdCount": 0,
    "totalAreas": 1
  }
}
```

### Test 3: Simulate Location Updates
```bash
# Simulate a user inside Bird Nest
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "latitude": 40.8055,
    "longitude": -73.9626
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Location updated successfully",
  "insideAreas": ["Bird Nest"]
}
```

### Test 4: Check Occupancy After Update
```bash
curl http://localhost:3000/api/study-areas
```

Verify that:
- `currentCount` increased to 1
- `occupancyPercentage` updated
- `crowdStatus` may be "Low Crowd"

### Test 5: Get Area Details
```bash
# Get details for a specific area (replace {id} with actual study area ID)
curl http://localhost:3000/api/study-areas/{id}
```

## Integration into Layout

Add the LocationPermissionBanner to your layout or header component:

```tsx
// src/app/layout.tsx or src/components/Header.tsx
import { LocationPermissionBanner } from '@/components/LocationPermissionBanner'

export default function Layout({ children }) {
  const userId = /* get from auth context or localStorage */

  return (
    <>
      {children}
      {userId && <LocationPermissionBanner userId={userId} />}
    </>
  )
}
```

## Frontend Pages

Access the study areas interface:

1. **Main Listing**: `http://localhost:3000/study-areas`
   - Shows all study areas
   - Real-time polling every 10 seconds
   - Sort by least crowded/most available/alphabetical
   - Filter by crowd level

2. **Detail View**: `http://localhost:3000/study-areas/{id}`
   - Shows individual area details
   - Current occupancy percentage
   - Available seats
   - Facilities list
   - Active students count
   - Location coordinates & radius

## Privacy & Security

### What's Tracked
- ✓ Aggregate occupancy counts per area
- ✓ Crowd levels (Low/Medium/High)
- ✓ Trend direction (crowding/quieting/stable)
- ✓ Active student count (not individual IDs)

### What's NOT Tracked
- ✗ Individual student locations (not stored)
- ✗ Personal identifiable information
- ✗ Movement history
- ✗ Location timestamps (only 5-minute window)

### Data Expiration
- Location data in `live_locations` expires after 5 minutes
- Occupancy recalculated only from recent entries
- Manual location updates can be disabled anytime

## Troubleshooting

### Issue: Geofence not detecting students
- **Check**: Coordinates are within 20m of study area center
- **Solution**: Use exact campus coordinates
- **Test**: Calculate distance manually using Haversine formula

### Issue: Occupancy not updating
- **Check**: If POST to /api/location succeeds
- **Check**: If live_locations table is being written
- **Solution**: Verify userId is consistent

### Issue: Real-time polling too slow
- **Option 1**: Change polling interval in study-areas/page.tsx (8000ms)
- **Option 2**: Implement WebSocket for live updates (advanced)

## Performance Notes

- **Geofence check**: O(n) where n = number of study areas
- **Occupancy calculation**: O(records in last 5 minutes)
- **API response**: ~50-100ms for typical campus (10-20 areas)

## Next Features (Optional Enhancements)

1. **Leaflet Map View**: Display study areas on interactive map with circles for geofences
2. **Historical Trends**: Chart occupancy over time using trend data
3. **Notifications**: Alert users when favorite areas become less crowded
4. **Crowding Predictions**: ML model for predicting peak hours
5. **Rating System**: Users rate occupancy accuracy

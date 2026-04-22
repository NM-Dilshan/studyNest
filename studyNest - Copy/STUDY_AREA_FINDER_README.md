# Study Area Finder - Implementation Guide

## Overview

The Study Area Finder is a privacy-safe, real-time occupancy tracking system for the StudyNest campus space management application. It allows students to see how crowded different study areas are without exposing individual location data.

## Architecture

### Core Principles

- **Privacy First**: Only aggregated occupancy counts are displayed. Individual locations are never shown.
- **Temporary Storage**: Location data automatically expires after 5 minutes.
- **User Control**: Students can request/revoke location permission at any time.
- **Real-time Updates**: Supabase Realtime provides instant occupancy changes.

### Technology Stack

- **Frontend**: Next.js 16.2.1, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Location API**: Browser Geolocation API
- **Real-time**: Supabase Realtime

## Database Schema

### Tables Created

```sql
live_locations
- id (UUID)
- user_id (UUID, FK to users)
- latitude (DECIMAL 10,8)
- longitude (DECIMAL 11,8)
- accuracy (FLOAT, nullable)
- recorded_at (TIMESTAMP)
- expires_at (TIMESTAMP) -- Auto-expires after 5 minutes

area_occupancy
- id (UUID)
- study_area_id (UUID, FK to study_areas) UNIQUE
- current_count (INT)
- available_seats (INT)
- occupancy_percentage (DECIMAL 5,2)
- crowd_status (VARCHAR 20) -- 'Low Crowd', 'Medium Crowd', 'High Crowd'
- capacity (INT, cached)
- updated_at (TIMESTAMP)

location_permissions (optional, for audit trail)
- id (UUID)
- user_id (UUID, FK to users) UNIQUE
- permission_status (VARCHAR 20) -- 'granted', 'denied', 'revoked'
- granted_at (TIMESTAMP)
- last_used_at (TIMESTAMP)
- revoked_at (TIMESTAMP)
```

### Views Created

- `study_areas_with_occupancy` - Study areas with current occupancy data
- `crowd_summary` - Campus-wide crowd statistics

### Database Functions

- `calculate_area_occupancy(study_area_id)` - Recalculates occupancy for a study area using point-in-circle geofence logic
- `expire_old_locations()` - Cleans up expired location records (for pg_cron)

## File Structure

### New Files Created

```
src/
├── lib/
│   ├── geofence.ts              -- Geofence utilities (point-in-circle, polygon, crowdstatus)
│   └── (supabase client already exists)
│
├── hooks/
│   └── useLocationTracking.ts    -- Browser geolocation hook with permission management
│
├── components/study-areas/
│   ├── LocationPermissionBanner.tsx  -- Location permission request/status UI
│   ├── StudyAreaCard.tsx             -- Individual study area card with occupancy
│   ├── StudyAreaSummary.tsx          -- Crowd level statistics and tips
│   └── StudyAreaMap.tsx              -- Study area boundary visualization
│
├── app/
│   ├── study-areas/
│   │   └── page.tsx           -- Main Study Area Finder page
│   │
│   └── api/
│       └── location/
│           └── route.ts       -- Location update API endpoint
│
migrations/
└── study_area_finder_schema.sql -- SQL schema file (run manually on Supabase)
```

## Key Components

### 1. **LocationPermissionBanner** (`src/components/study-areas/LocationPermissionBanner.tsx`)

Displays the current location permission status and allows users to:
- Request location permission
- View permission status (granted/denied/revoked)
- Revoke permission at any time
- Understand privacy implications

```tsx
<LocationPermissionBanner
  permissionStatus={location.permissionStatus}
  isTracking={location.isTracking}
  error={location.error}
  onRequestPermission={location.requestPermission}
  onRevoke={location.revokePermission}
/>
```

### 2. **useLocationTracking Hook** (`src/hooks/useLocationTracking.ts`)

Manages all browser geolocation operations:
- Requests user permission for location access
- Watches location changes using `navigator.geolocation.watchPosition()`
- Sends location updates to `/api/location` endpoint
- Tracks permission status
- Ignores insignificant movements (<10m)
- Records permission status in database for audit

```tsx
const location = useLocationTracking(userId, enabled);

// Returns:
{
  permissionStatus: 'prompt' | 'granted' | 'denied',
  currentLocation: { latitude, longitude, accuracy, timestamp },
  isTracking: boolean,
  error: string | null,
  requestPermission: () => Promise<void>,
  startTracking: () => void,
  stopTracking: () => void,
  revokePermission: () => Promise<void>
}
```

### 3. **Geofence Utilities** (`src/lib/geofence.ts`)

Core location algorithms:
- `haversineDistance()` - Calculate great-circle distance between two points
- `isPointInCircle()` - Check if point is inside circular geofence
- `isPointInPolygon()` - Ray-casting algorithm for polygon geofencing
- `calculateOccupancyPercentage()` - Calculate occupancy %
- `getCrowdStatus()` - Determine crowd level (Low/Medium/High)
- `getCrowdIndicator()` - Get visual styling for crowd status
- `isMeaningfulLocationChange()` - Filter insignificant movements

### 4. **StudyAreaCard** (`src/components/study-areas/StudyAreaCard.tsx`)

Displays individual study area occupancy:
- Current occupancy with capacity
- Progress bar showing crowd level
- Available seats
- Last updated time
- Amenity tags (WiFi, Quiet Zone, Café, Charging)
- Privacy notice

### 5. **StudyAreaSummary** (`src/components/study-areas/StudyAreaSummary.tsx`)

Shows campus-wide statistics:
- Count of low/medium/high crowd areas
- Total students inside
- Total available seats
- Pro tips for finding study spaces

### 6. **StudyAreaMap** (`src/components/study-areas/StudyAreaMap.tsx`)

Visualizes study areas (currently text-based, ready for Google Maps enhancement):
- Shows study area boundaries and coordinates
- Displays aggregated occupancy counts
- Visual legend for crowd levels
- Privacy notice about not showing individual locations
- Ready for enhancement with interactive Google Maps

### 7. **API Endpoint** (`src/app/api/location/route.ts`)

Handles location updates from authenticated students:
- Validates user authentication
- Stores location in `live_locations` table with auto-expiry
- Triggers occupancy recalculation for affected areas
- Returns affected area IDs

Request:
```json
{
  "latitude": 40.712776,
  "longitude": -74.005974,
  "accuracy": 10.5,
  "userId": "uuid"
}
```

Response:
```json
{
  "success": true,
  "message": "Location recorded successfully",
  "occupancyUpdated": ["area-id-1", "area-id-2"]
}
```

### 8. **Study Area Finder Page** (`src/app/study-areas/page.tsx`)

Main page component that brings everything together:
- Requests location permission on load
- Fetches study areas from Supabase
- Fetches occupancy data
- Subscribes to real-time occupancy updates
- Auto-starts tracking when permission granted
- Displays all components (banner, cards, map, summary)
- Shows privacy statement

## Data Flow

### Location Update Flow

```
1. Student visits /study-areas page
   ↓
2. App requests browser location permission (LocationPermissionBanner)
   ↓
3. User grants permission (useLocationTracking hook)
   ↓
4. Browser starts watching location (watchPosition)
   ↓
5. Meaningful location change detected (>10m)
   ↓
6. POST to /api/location with coordinates
   ↓
7. Backend validates user authentication
   ↓
8. Insert into live_locations table (expires in 5 min)
   ↓
9. Database trigger: on_location_insert_trigger
   ↓
10. For each study area:
    a. Calculate distance using haversine
    b. If within radius: call calculate_area_occupancy()
    ↓
11. calculate_area_occupancy():
    a. Count active users in area (not expired)
    b. Calculate available seats and percentage
    c. Determine crowd status
    d. Upsert area_occupancy record
    ↓
12. Supabase Realtime broadcasts occupancy change
    ↓
13. Frontend subscribes and updates UI instantly
```

### Occupancy Calculation Logic

The database function `calculate_area_occupancy()`:

1. Gets study area details (lat, lng, radius_meters, capacity)
2. Counts unique users with active locations inside the circular boundary
3. Checks: `earth_distance(location_point, area_center) <= radius_meters`
4. Calculations:
   - `current_count` = distinct users in area
   - `available_seats` = capacity - current_count
   - `occupancy_percentage` = (current_count / capacity) * 100
   - `crowd_status`:
     - **Low Crowd**: ≤ 30%
     - **Medium Crowd**: 30% - 70%
     - **High Crowd**: > 70%

## Privacy Protection Measures

1. **No Personal Location Storage**
   - Location coordinates are processed in-memory only
   - Never stored in permanent logs
   - Auto-expire after 5 minutes

2. **Aggregated Data Only**
   - Only counts are displayed publicly
   - No individual student pins on maps
   - No location history tracking

3. **User Control**
   - Explicit permission request via banner
   - Easy revoke mechanism
   - No forced location sharing

4. **Secure Authentication**
   - Users can only submit their own location
   - Supabase auth validation on all requests
   - Permission audit trail in `location_permissions` table

5. **No Third-Party Location Sharing**
   - Locations never sent to external services
   - Maps use only aggregated data
   - Google Maps only shows area boundaries, not locations

## Crowd Status Calculation

Occupancy percentage calculations:

- **Low Crowd** (green) ≤ 30%
  - Plenty of available seats
  - Good for focused studying

- **Medium Crowd** (yellow) 30-70%
  - Moderate activity
  - Seats still available

- **High Crowd** (red) > 70%
  - Limited space
  - May need to wait for seats
  - Consider less crowded areas

## Real-Time Updates

Supabase Realtime subscription:

```tsx
supabase
  .from('area_occupancy')
  .on('*', (payload) => {
    // Update UI when any area's occupancy changes
  })
  .subscribe();
```

The database trigger automatically updates `area_occupancy` whenever locations are inserted, and Realtime broadcasts the changes to all connected clients.

## Feature: Bird Nest Study Area

A sample study area has been created:
- **Name**: Bird Nest
- **Building**: Central Tower
- **Capacity**: 500 students
- **Location**: 40.712776, -74.005974 (example coordinates)
- **Radius**: 150 meters

This area demonstrates the system's ability to track occupancy for any study space.

## Setup Instructions

### 1. Run Database Migration

Execute the SQL in `migrations/study_area_finder_schema.sql` on your Supabase project:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create a new query
4. Paste the entire `.sql` file
5. Run the query

This creates:
- `live_locations` table
- `area_occupancy` table
- `location_permissions` table
- Database functions and triggers
- Views for easy querying
- Sample Bird Nest study area

### 2. Update Supabase Client

Ensure your Supabase client is properly configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Enable PostGIS Extension (Optional)

For advanced geographic queries on Supabase:

1. Go to SQL Editor
2. Run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### 4. Configure Cron Job (Optional)

To automatically expire old locations, set up `pg_cron`:

```sql
SELECT cron.schedule('expire-locations', '*/5 * * * *', 'SELECT expire_old_locations()');
```

This runs expiry every 5 minutes.

## Usage

### For Students

1. Visit `/study-areas`
2. Click "Enable Location" when prompted
3. Choose to share location (or deny to just see existing data)
4. View real-time occupancy for each study area
5. See available seats, crowd levels, and amenities
6. Click "Revoke Permission" anytime to stop sharing

### For Campus Administrators

1. Add study areas via admin panel (set lat, lng, radius, capacity)
2. Monitor occupancy trends
3. View privacy audit trail in `location_permissions`
4. Adjust area boundaries or capacity as needed

## Future Enhancements

1. **Google Maps Integration**
   - Use Google Maps Embed API or SDK
   - Show interactive area boundaries
   - Heatmap visualization of crowd levels

2. **Advanced Geofencing**
   - Support polygon boundaries for complex areas
   - Multiple nested zones
   - Building floor-level tracking

3. **Historical Data**
   - Store anonymized occupancy trends
   - Peak hour patterns
   - Weekly/monthly analytics

4. **Notifications**
   - Notify when favorite area becomes available
   - Crowd alerts for specific areas
   - Occupancy predictions

5. **Capacity Management**
   - Alert staff when area reaches capacity
   - Queue management
   - Reservation system integration

6. **Mobile App**
   - Native iOS/Android apps
   - Better geolocation accuracy
   - Background tracking support

## Security Considerations

- All location data must be validated on server
- Coordinates must be within valid ranges (-90 to 90, -180 to 180)
- User authentication required for all location submissions
- Rate limiting on location endpoint recommended
- HTTPS required for geolocation API

## Testing

```bash
# Test location API
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.712776,
    "longitude": -74.005974,
    "accuracy": 10,
    "userId": "test-user-id"
  }'

# Expected response:
{
  "success": true,
  "message": "Location recorded successfully",
  "occupancyUpdated": ["bird-nest-id"]
}
```

## Troubleshooting

### Location not updating
- Check browser geolocation permission
- Verify user is authenticated
- Check API endpoint returns 200
- Ensure database tables exist

### Occupancy shows 0
- Users must grant location permission
- Locations must be inside study area boundaries
- Initial setup may take a few minutes

### Real-time updates not working
- Verify Supabase Realtime is enabled
- Check browser console for connection errors
- Ensure subscription is active

## Files Modified

- `src/app/api/location/route.ts` - Updated with Supabase implementation
- `src/app/study-areas/page.tsx` - Complete rewrite (Study Area Finder)

## Files Created

- `src/lib/geofence.ts`
- `src/hooks/useLocationTracking.ts`
- `src/components/study-areas/LocationPermissionBanner.tsx`
- `src/components/study-areas/StudyAreaCard.tsx`
- `src/components/study-areas/StudyAreaSummary.tsx`
- `src/components/study-areas/StudyAreaMap.tsx`
- `migrations/study_area_finder_schema.sql`

## Privacy Statement

> **Your Privacy is Protected**
>
> StudyNest only tracks aggregated occupancy counts. Your exact location is never stored permanently, displayed to other users, or shared. Location data automatically expires every 5 minutes. You can revoke location access at any time. Individual student locations are never visible on the map or in reports—only anonymous occupancy counts are displayed.

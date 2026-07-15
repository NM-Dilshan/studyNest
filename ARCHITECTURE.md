# StudyNest GPS Tracking Architecture

## System Overview

A privacy-first real-time crowd level tracking system for study areas using GPS geofencing and anonymous location aggregation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  Study Areas     │         │  Location        │            │
│  │  Listing Page    │         │  Permission      │            │
│  │  (Real-time      │         │  Banner          │            │
│  │   polling)       │         │  (Enable/Disable)│            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                           │                       │
│           ├──────────────┬────────────┘                       │
│           │              │                                   │
│  ┌────────▼──────┐  ┌────▼──────────────┐                  │
│  │ Components    │  │  Browser Geoloc   │                  │
│  │ (Card/Summary)│  │  API (watchPos)   │                  │
│  └────────┬──────┘  └────┬──────────────┘                  │
│           │              │                                   │
└───────────┼──────────────┼──────────────────────────────────┘
            │              │
    ┌───────▼──────────────▼───────┐
    │   HTTP Requests (fetch)       │
    │   GET /api/study-areas        │
    │   POST /api/location          │
    │   GET /api/study-areas/[id]   │
    └───────┬──────────────┬────────┘
            │              │
┌───────────▼──────────────▼───────────────────────────────────┐
│                     Backend API Layer                        │
├───────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Route Handlers (Next.js App Router)                   │ │
│  │                                                         │ │
│  │  • POST /api/location      → Update live location     │ │
│  │  • GET  /api/location      → Retrieve user location   │ │
│  │  • GET  /api/study-areas   → List all areas + counts  │ │
│  │  • POST /api/study-areas   → Create new area          │ │
│  │  • GET  /api/study-areas/[id]  → Area details + stats │ │
│  │  • PUT  /api/study-areas/[id]  → Update area          │ │
│  └───────┬────────────────────────────────────────────────┘ │
│          │                                                   │
│  ┌───────▼────────────────────────────────────────────┐      │
│  │  Utility Libraries                                 │      │
│  │                                                    │      │
│  │  • geofence.ts: Distance calculations,            │      │
│  │    crowd levels, trend detection                  │      │
│  │                                                    │      │
│  │  • location-utils.ts: Geolocation API wrapper     │      │
│  │    (requestPermission, watchLocationUpdates)      │      │
│  └───────┬────────────────────────────────────────────┘      │
│          │                                                    │
└──────────┼────────────────────────────────────────────────────┘
           │
┌──────────▼─────────────────────────────────────────────────────┐
│              Database Layer (Prisma ORM)                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Tables                                      │  │
│  │                                                         │  │
│  │  study_areas                                           │  │
│  │  ├─ study_area_id (PK)                                │  │
│  │  ├─ area_name, building, floor, capacity             │  │
│  │  ├─ latitude, longitude, radius_meters        [GPS]  │  │
│  │  ├─ facilities (wifi, charging, etc)                 │  │
│  │  └─ created_at, updated_at                           │  │
│  │                                                         │  │
│  │  live_locations  (Temporary, 5min window)            │  │
│  │  ├─ location_id (PK)                                  │  │
│  │  ├─ user_id (Unique)                                  │  │
│  │  ├─ latitude, longitude        [User position]        │  │
│  │  ├─ study_area_id (FK)         [Matched geofence]    │  │
│  │  └─ updated_at                                         │  │
│  │                                                         │  │
│  │  area_occupancy  (Aggregate counts)                   │  │
│  │  ├─ area_occupancy_id (PK)                            │  │
│  │  ├─ study_area_id (FK)                                │  │
│  │  ├─ current_count             [People in area]        │  │
│  │  └─ updated_at                                         │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Location Update Flow
```
User enables location sharing
    ↓
Browser requests geolocation permission
    ↓
watchLocationUpdates() polls position (every 10-30s)
    ↓
POST /api/location { userId, latitude, longitude }
    ↓
Server receives location data
    ↓
Check: Is location inside any study area? (Haversine formula)
    ↓
UPDATE live_locations { user_id, lat, lng, study_area_id }
    ↓
RECALCULATE occupancy for all affected areas
    ↓
UPDATE area_occupancy { current_count, updated_at }
    ↓
Calculate: crowdStatus, trendStatus, occupancyPercentage
```

### 2. Display Flow
```
User visits /study-areas
    ↓
Frontend component mounted (useEffect)
    ↓
Fetch GET /api/study-areas
    ↓
Server queries active areas + occupancy
    ↓
Enrich response: Calculate status, trends, counts
    ↓
Return: { areas: [...], summary: { low, medium, high } }
    ↓
Display cards with real-time data
    ↓
Poll every 10 seconds for live updates
```

## Key Algorithms

### Haversine Distance Formula
Calculates great-circle distance between two lat/lng points on Earth.

```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2( √a, √(1−a) )
d = R ⋅ c

where: φ is latitude, λ is longitude, R is Earth's radius (6,371km)
Result: distance in meters
```

### Geofence Detection
For each location update, check if inside any study area:

```
distance = calculateDistanceInMeters(userLat, userLng, areaLat, areaLng)
if distance <= areaRadiusMeters (default 20m):
    → User is INSIDE area
    → Update live_locations.study_area_id
```

### Occupancy Calculation
```
activeCount = live_locations.count({
    study_area_id = area.id AND
    updated_at >= now() - 5 minutes
})

occupancyPercentage = (activeCount / area.capacity) * 100

crowdStatus = 
    if occupancyPercentage <= 30: "Low Crowd"
    elif occupancyPercentage <= 70: "Medium Crowd"
    else: "High Crowd"
```

### Trend Detection
```
previousCount = area_occupancy.current_count (from previous update)
currentCount = recalculated active count

difference = currentCount - previousCount

trendStatus =
    if difference > 3: "Getting crowded"
    elif difference < -3: "Getting quieter"
    else: "Stable"
```

## Privacy Architecture

### What Can Be Observed
✓ Occupancy count per area (aggregate)  
✓ Crowd level classification (Low/Medium/High)  
✓ Trend direction (crowding/quieting/stable)  
✓ Available seat count  

### What Cannot Be Observed
✗ Individual student locations (not stored)  
✗ Student identity mapping to coordinates  
✗ Movement history or patterns  
✗ Location timestamps (only 5-min window)  

### Data Lifecycle
```
Browser Geolocation API
    ↓
Coordinates extracted
    ↓ [Coordinates never leave the request]
    ↓
Geofence check: distance <= area.radius
    ↓
Occupancy count updated
    ↓
Coordinates discarded (never inserted into DB)
    ↓
live_locations auto-expires after 5 minutes
    ↓
Only aggregate counts persist in area_occupancy
```

## Component Responsibilities

### Frontend
- **StudyAreaCard**: Render individual area with occupancy bar, crowd badge
- **StudyAreaSummary**: Display summary statistics (low/medium/high counts)
- **LocationPermissionBanner**: Enable/disable location sharing UI
- **study-areas page**: List view with sorting, filtering, real-time polling
- **study-areas/[id] page**: Detail view with full occupancy info

### Backend
- **geofence.ts**: Pure math/logic (no DB access)
  - Haversine distance
  - Crowd level classification
  - Trend determination
  - Occupancy aggregation
  
- **location-utils.ts**: Browser API wrapper (no server logic)
  - Permission request
  - watchPosition polling
  - Error handling
  
- **API routes**: Request handling & DB operations
  - Validate input
  - Execute geofence logic
  - Update database
  - Return enriched response

### Database
- **study_areas**: Area master data + GPS fields
- **live_locations**: Temporary location cache (5-min expiration)
- **area_occupancy**: Real-time aggregate counts

## Performance Characteristics

| Operation | Complexity | ~Time |
|-----------|-----------|-------|
| Haversine distance | O(1) | <1ms |
| Geofence check | O(areas) | 5-10ms |
| Occupancy calculation | O(entries) | 10-20ms |
| Location update | O(areas) | 20-30ms |
| List all areas | O(areas) | 50-100ms |
| Detail view | O(recent_entries) | 20-30ms |

## Scalability Notes

**Current approach scales to:**
- 20-50 study areas per request
- 1000s of location updates/min
- Polling-based UI (not WebSocket)

**Future improvements for scale:**
- Add geospatial indices (PostGIS)
- Implement Redis cache for occupancy
- Switch to WebSocket for live updates
- Batch location updates
- Pagination for area lists

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 19.2.4 |
| Build | Next.js App Router | 16.2.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | - |
| Mapping | Leaflet / React-Leaflet | 1.9.4 / 4.2.3 |
| Backend | Next.js API Routes | 16.2.1 |
| ORM | Prisma | 7.5.0 |
| Database | PostgreSQL | Latest |
| Runtime | Node.js | 18+ |

## Security Considerations

1. **Input Validation**
   - Latitude/longitude bounds checking
   - Capacity and radius validation
   - UserId format validation

2. **Data Minimization**
   - Never store raw coordinates
   - Aggregate only (counts, not individuals)
   - Auto-expire temporary data

3. **Rate Limiting** (Not yet implemented)
   - Limit location updates per user
   - Prevent API abuse

4. **CORS & Authentication** (To be added)
   - Authenticate location updates
   - Prevent unauthorized area creation

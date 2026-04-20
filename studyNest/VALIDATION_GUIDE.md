# StudyNest Add Study Area Form - Comprehensive Validation Guide

## Overview

The "Add New Study Area" form in the StudyNest admin panel now includes complete frontend and backend validation, ensuring data integrity and excellent user experience.

---

## Architecture

### Files Modified/Created

1. **`/src/lib/validation/studyAreaValidation.ts`** (NEW)
   - Validation schema with constants
   - Individual field validators
   - Cross-field validation logic
   - Form data transformations

2. **`/src/app/admin/study-area/add/page.tsx`** (UPDATED)
   - Frontend validation integration
   - Error state management
   - User feedback and error messages
   - Form data binding

3. **`/src/app/api/study-areas/route.ts`** (UPDATED)
   - Server-side validation
   - Duplicate name checking
   - Database persistence
   - Structured error responses

---

## Validation Rules

### 1. Area Name
**Required:** Yes

| Rule | Details |
|------|---------|
| Minimum Length | 3 characters |
| Maximum Length | 100 characters |
| Pattern | Letters, numbers, spaces, hyphens only |
| Examples | ✓ "Library Zone A" ✓ "Quiet Study Area" ✓ "Study-Hub-1" |
| Invalid | ✗ "AB" (too short) ✗ "Lab@123" (invalid chars) ✗ "---" (no content) |

**Error Messages:**
- "Area name is required"
- "Area name must be at least 3 characters"
- "Area name must not exceed 100 characters"
- "Area name contains invalid characters. Use only letters, numbers, spaces, and hyphens"

**Character Counter:** Displays current length / maximum length

---

### 2. Building
**Required:** Yes

| Rule | Details |
|------|---------|
| Minimum Length | 2 characters |
| Maximum Length | 50 characters |
| Pattern | Any text (trimmed) |

**Error Messages:**
- "Building is required"
- "Building must be at least 2 characters"
- "Building must not exceed 50 characters"

---

### 3. Floor
**Required:** Yes

| Rule | Details |
|------|---------|
| Must Be | Integer (whole number only) |
| Supports | Basement floors (e.g., -2, -1) |
| Range | -10 to 100 |
| Examples | ✓ "1" ✓ "4" ✓ "-1" ✓ "-2" |

**Error Messages:**
- "Floor is required"
- "Floor must be a valid whole number"
- "Floor must be between -10 and 100"

---

### 4. Capacity
**Required:** Yes

| Rule | Details |
|------|---------|
| Must Be | Positive integer |
| Minimum | 1 |
| Maximum | 2000 |
| Examples | ✓ "50" ✓ "100" ✓ "2000" |

**Error Messages:**
- "Capacity is required"
- "Capacity must be a valid number"
- "Capacity must be greater than 0"
- "Capacity must not exceed 2000"

---

### 5. Status
**Required:** Yes

| Option | Value | Display |
|--------|-------|---------|
| Available | `available` | Available |
| Low Crowd | `low_crowd` | Low Crowd |
| Medium Crowd | `medium_crowd` | Medium Crowd |
| High Crowd | `high_crowd` | High Crowd |
| Closed | `closed` | Closed |

**Error Messages:**
- "Status is required"
- "Invalid status selected"

---

### 6. Latitude
**Required:** Yes

| Rule | Details |
|------|---------|
| Must Be | Decimal number |
| Range | -90 to 90 degrees |
| Precision | Up to 4 decimal places (0.0001°) |
| Examples | ✓ "40.7128" ✓ "-33.8688" ✓ "51.5074" |

**Requirement:** If latitude is entered, longitude must also be entered

**Error Messages:**
- "Latitude is required"
- "Latitude must be a valid decimal number"
- "Latitude must be between -90 and 90"

---

### 7. Longitude
**Required:** Yes

| Rule | Details |
|------|---------|
| Must Be | Decimal number |
| Range | -180 to 180 degrees |
| Precision | Up to 4 decimal places (0.0001°) |
| Examples | ✓ "-74.0060" ✓ "151.2093" ✓ "-0.1278" |

**Requirement:** If longitude is entered, latitude must also be entered

**Error Messages:**
- "Longitude is required"
- "Longitude must be a valid decimal number"
- "Longitude must be between -180 and 180"

---

### 8. Geofence Radius
**Required:** Yes

| Rule | Details |
|------|---------|
| Must Be | Positive integer |
| Minimum | 5 meters |
| Maximum | 200 meters |
| Default | 20 meters |
| Examples | ✓ "5" ✓ "20" ✓ "50" ✓ "200" |

**Use Case:** Defines the distance from the study area center where users are considered "in zone"

**Error Messages:**
- "Geofence radius is required"
- "Geofence radius must be a valid number"
- "Geofence radius must be at least 5 meters"
- "Geofence radius must not exceed 200 meters"

---

### 9. Features (Optional)
**Required:** No

Available toggles:
- WiFi
- Charging Ports
- Silent Zone
- Air Conditioning

All default to `false` if not selected.

---

### 10. Cross-Field Validation

#### Latitude ↔ Longitude Relationship
- **Rule:** Both must be provided together or neither
- **Error Message:** "Both latitude and longitude must be provided"
- **Display:** Amber warning box at the top of the Location section

#### Duplicate Area Name
- **Rule:** Study area names must be unique
- **Check Location:** Backend API validation
- **HTTP Status:** 409 Conflict
- **Error Message:** "A study area with this name already exists"
- **User Feedback:** Error displays under the "Area Name" field

---

## Frontend Validation Features

### Error Display
1. **Per-Field Errors:** Red error message below each invalid field
2. **Red Border Styling:** Invalid fields have red border and glow
3. **Summary Error Box:** Shows at top of form if multiple fields have errors
4. **Error List:** Expandable list of all validation errors

### User Experience
- **Error Auto-Clear:** Clicking on a field removes its error message
- **Disabled Submit:** Submit button disabled if any field has errors
- **Form Persistence:** All entered values preserved on validation failure
- **Clear Feedback:** One primary error message visible to user

### Validation Timing
- **On Input:** Field-level errors clear when user starts typing
- **On Submit:** Full form validation triggered
- **Live Feedback:** Character counter for area name

---

## Backend Validation

### Request Validation
All frontend validations are **repeated on the server** for security:
- No assumption of valid data from client
- Prevents unauthorized API calls with invalid data
- Enforces business rules at data layer

### Database Validation
1. **Duplicate Name Check:** Database lookup before insert
2. **Unique Constraint:** `area_name` has UNIQUE constraint
3. **Required Fields:** `area_name`, `latitude`, `longitude` must be NOT NULL

### Error Responses

**Validation Failure (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "area_name": "Area name is required",
    "capacity": "Capacity must be greater than 0"
  }
}
```

**Duplicate Name (409 Conflict):**
```json
{
  "success": false,
  "error": "Study area with this name already exists",
  "errors": {
    "name": "A study area with this name already exists"
  }
}
```

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Study area created successfully",
  "area": {
    "id": "uuid-string",
    "name": "Library Zone A",
    "building": "Main Building",
    "floor": 2,
    "capacity": 50,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radiusMeters": 20,
    "status": "available"
  }
}
```

---

## Data Transformation

### Form Data Structure (Frontend)
```typescript
{
  area_name: string
  building: string
  floor: string          // "2" or "-1"
  capacity: string       // "50"
  latitude: string       // "40.7128"
  longitude: string      // "-74.0060"
  radius_meters: string  // "20"
  area_status: string    // "available"
  wifi: boolean
  charging_ports: boolean
  silent_zone: boolean
  ac: boolean
}
```

### API Payload Structure (Send to Backend)
```typescript
{
  name: string
  building: string
  floor: number | null
  capacity: number | null
  latitude: number
  longitude: number
  radiusMeters: number
  status: string
  facilities: {
    wifi: boolean
    chargingPorts: boolean
    silentZone: boolean
    ac: boolean
  }
}
```

### Database Schema (Prisma)
```prisma
model study_areas {
  study_area_id    String @id @default(uuid())
  area_name        String @unique
  building         String?
  floor            Int?
  capacity         Int?
  latitude         Float @db.DoublePrecision
  longitude        Float @db.DoublePrecision
  radius_meters    Int @default(20)
  wifi             Boolean @default(false)
  charging_ports   Boolean @default(false)
  silent_zone      Boolean @default(false)
  ac               Boolean @default(false)
  area_status      String @default("available")
  is_active        Boolean @default(true)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  area_occupancy   area_occupancy?
  live_locations   live_locations[]
  complaints       complaint[]
}
```

---

## Testing Scenarios

### ✓ Valid Submission
**Input:**
- Area Name: "Library Zone A"
- Building: "Main Building"
- Floor: "2"
- Capacity: "50"
- Status: "Available"
- Latitude: "40.7128"
- Longitude: "-74.0060"
- Radius: "20"

**Expected Result:** ✓ Study area created, redirects to list

### ✗ Missing Required Fields
**Input:** Submitting with empty Area Name

**Expected Result:** 
- Red border on area_name field
- Error: "Area name is required"
- Summary error box displays
- Submit button remains disabled

### ✗ Area Name Too Short
**Input:** Area Name: "AB"

**Expected Result:**
- Error: "Area name must be at least 3 characters"
- Field highlighted in red

### ✗ Invalid Latitude Range
**Input:** Latitude: "95" (exceeds max of 90)

**Expected Result:**
- Error: "Latitude must be between -90 and 90"
- Field highlighted in red
- Summary error displays

### ✗ Latitude Without Longitude
**Input:**
- Latitude: "40.7128"
- Longitude: (empty)

**Expected Result:**
- Cross-field error: "Both latitude and longitude must be provided"
- Amber warning box appears
- Both fields highlighted

### ✗ Duplicate Area Name
**Input:** Area Name: "Bird Nest Commons" (already exists from seed)

**Expected Result:**
- Server responds with 409 Conflict
- Error: "A study area with this name already exists"
- Displays under area_name field

### ✗ Invalid Characters in Area Name
**Input:** Area Name: "Zone@#$Lab"

**Expected Result:**
- Error: "Area name contains invalid characters..."
- Field highlighted

### ✓ Basement Floor
**Input:**
- Floor: "-2"
- Other valid data

**Expected Result:** ✓ Accepted, study area created

---

## Code Usage

### Import Validation in Components
```typescript
import {
  validateFormData,
  formDataToPayload,
  STUDY_AREA_VALIDATION,
  type StudyAreaFormData,
  type ValidationErrors,
} from '@/lib/validation/studyAreaValidation'
```

### Validate Form Data
```typescript
const result = validateFormData(formData)

if (!result.isValid) {
  setFieldErrors(result.errors)
  // Handle errors...
}
```

### Convert Form Data to Payload
```typescript
const payload = formDataToPayload(formData)
const response = await fetch('/api/study-areas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
```

---

## Constants Reference

```typescript
STUDY_AREA_VALIDATION.AREA_NAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z0-9\s\-]*$/
}

STUDY_AREA_VALIDATION.BUILDING = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
}

STUDY_AREA_VALIDATION.FLOOR = {
  MIN: -10,
  MAX: 100,
}

STUDY_AREA_VALIDATION.CAPACITY = {
  MIN: 1,
  MAX: 2000,
}

STUDY_AREA_VALIDATION.LATITUDE = {
  MIN: -90,
  MAX: 90,
}

STUDY_AREA_VALIDATION.LONGITUDE = {
  MIN: -180,
  MAX: 180,
}

STUDY_AREA_VALIDATION.RADIUS_METERS = {
  MIN: 5,
  MAX: 200,
  DEFAULT: 20,
}

STUDY_AREA_VALIDATION.STATUS.VALID_OPTIONS = [
  'available',
  'low_crowd',
  'medium_crowd',
  'high_crowd',
  'closed',
]
```

---

## API Endpoints

### POST /api/study-areas
**Purpose:** Create a new study area

**Request Body:**
```typescript
{
  name: string
  building: string
  floor?: number
  capacity?: number
  latitude: number
  longitude: number
  radiusMeters?: number
  status?: string
  facilities?: {
    wifi?: boolean
    chargingPorts?: boolean
    silentZone?: boolean
    ac?: boolean
  }
}
```

**Responses:**
- **201 Created:** Study area successfully created
- **400 Bad Request:** Validation failed
- **409 Conflict:** Duplicate area name exists
- **500 Internal Server Error:** Database error

**Validation Happens:**
1. Frontend before submit
2. Backend on request arrival
3. Database constraint on insert

---

## Security Considerations

1. **No Client Trust:** All validation repeated on backend
2. **SQL Injection Prevention:** Using Prisma ORM (parameterized queries)
3. **Rate Limiting:** Recommend adding API rate limiting
4. **Authorization:** Verify user is admin before allowing create
5. **Input Sanitization:** Strings trimmed, patterns enforced

---

## Future Enhancements

1. **Real-time Validation:** Validate area name availability as user types
2. **Location Autocomplete:** Integration with map API for coordinates
3. **Bulk Upload:** CSV import for multiple study areas
4. **Update Endpoint:** PUT /api/study-areas/[id] with same validation
5. **Enhanced Error Messages:** Localization support for multiple languages
6. **Rate Limiting:** Prevent abuse of form submissions

---

## Troubleshooting

### Form Not Submitting?
- Check browser console for JavaScript errors
- Verify all required fields have valid values
- Check Network tab for API response errors

### Validation Errors Not Showing?
- Ensure form data includes all required fields
- Check that formData state is properly binding to inputs
- Verify validation functions are imported correctly

### Duplicate Name Error Incorrectly Shown?
- Clear browser cache
- Check that existing study area names are unique in database
- Run `npx prisma db push` to sync schema

### Coordinates Not Saving?
- Verify latitude/longitude are decimal numbers (not text)
- Check GPS coordinates are within valid ranges
- Ensure both latitude and longitude are provided

---

## File References

- **Validation Schema:** [/src/lib/validation/studyAreaValidation.ts](../lib/validation/studyAreaValidation.ts)
- **Form Component:** [/src/app/admin/study-area/add/page.tsx](../app/admin/study-area/add/page.tsx)
- **API Route:** [/src/app/api/study-areas/route.ts](../app/api/study-areas/route.ts)
- **Database Schema:** [/prisma/schema.prisma](../../prisma/schema.prisma)

---

**Last Updated:** March 25, 2026  
**Status:** ✅ Implemented and Tested  
**Build Status:** ✅ Compiled Successfully (0 TypeScript Errors)

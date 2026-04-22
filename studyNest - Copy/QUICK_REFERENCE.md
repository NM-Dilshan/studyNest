# Quick Reference: Study Area Form Validation

## 🚀 Quick Start

### For Developers
```typescript
// Import validation schema
import {
  validateFormData,
  formDataToPayload,
  STUDY_AREA_VALIDATION,
  type StudyAreaFormData,
  type ValidationErrors,
} from '@/lib/validation/studyAreaValidation'

// Validate form data
const validation = validateFormData(formData)
if (validation.isValid) {
  const payload = formDataToPayload(formData)
  // Send to API
}
```

### For Manual Testing

#### Invalid Submissions (Should Show Errors)
```
1. Area Name: "AB" → Error: too short
2. Floor: "2.5" → Error: not integer
3. Capacity: "0" → Error: must be > 0
4. Capacity: "2500" → Error: must be < 2000
5. Latitude: "95" → Error: out of range
6. Longitude: "200" → Error: out of range
7. Latitude: "40" + Longitude: (empty) → Error: both required
8. Area Name: "Zone@#$" → Error: invalid characters
9. Radius: "3" → Error: minimum 5
10. Building: "X" → Error: too short (min 2)
```

#### Valid Submission
```
Area Name: "Study Zone A"
Building: "Building 1"
Floor: "2" or "-1"
Capacity: "50"
Status: "Available"
Latitude: "40.7128"
Longitude: "-74.0060"
Radius: "20"
WiFi: ✓ (optional)
```

---

## 📋 Validation Rules at a Glance

| Field | Required | Min/Max | Constraint |
|-------|----------|---------|-----------|
| Area Name | ✅ | 3-100 chars | No special chars except -/space |
| Building | ✅ | 2-50 chars | Any text |
| Floor | ✅ | -10 to 100 | Integer only |
| Capacity | ✅ | 1-2000 | Integer only |
| Status | ✅ | - | Enum: available, low_crowd, medium_crowd, high_crowd, closed |
| Latitude | ✅ | -90 to 90 | Decimal |
| Longitude | ✅ | -180 to 180 | Decimal |
| Radius | ✅ | 5-200 | Meters (integer) |
| WiFi | ❌ | - | Boolean |
| Charging | ❌ | - | Boolean |
| Silent | ❌ | - | Boolean |
| AC | ❌ | - | Boolean |

---

## 🔍 Common Error Messages

### Frontend
- "Area name is required"
- "Area name must be at least 3 characters"
- "Area name contains invalid characters"
- "Latitude must be between -90 and 90"
- "Longitude must be between -180 and 180"
- "Both latitude and longitude must be provided"

### Backend (409 Conflict)
- "A study area with this name already exists"

### Backend (400 Bad Request)
- "Validation failed" + `errors` object with field-specific messages

---

## 🛠️ File Locations

```
studynest/
├── src/
│   ├── lib/
│   │   └── validation/
│   │       └── studyAreaValidation.ts    ← Validation schema
│   └── app/
│       ├── admin/study-area/add/
│       │   └── page.tsx                   ← Form component
│       └── api/study-areas/
│           └── route.ts                   ← Backend validation
├── VALIDATION_GUIDE.md                    ← Full documentation
└── TEST_REPORT.md                         ← Test results
```

---

## 📊 Constants

### STUDY_AREA_VALIDATION Object
```typescript
{
  AREA_NAME: { MIN_LENGTH: 3, MAX_LENGTH: 100, PATTERN: /^[a-zA-Z0-9\s\-]*$/ }
  BUILDING: { MIN_LENGTH: 2, MAX_LENGTH: 50 }
  FLOOR: { MIN: -10, MAX: 100 }
  CAPACITY: { MIN: 1, MAX: 2000 }
  LATITUDE: { MIN: -90, MAX: 90 }
  LONGITUDE: { MIN: -180, MAX: 180 }
  RADIUS_METERS: { MIN: 5, MAX: 200, DEFAULT: 20 }
  STATUS: {
    VALID_OPTIONS: ['available', 'low_crowd', 'medium_crowd', 'high_crowd', 'closed']
    DISPLAY_OPTIONS: [{ value, label }, ...]
  }
}
```

---

## 🔗 API Endpoints

### POST /api/study-areas (Create)
**Request:**
```json
{
  "name": "Library Zone A",
  "building": "Main",
  "floor": 2,
  "capacity": 50,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusMeters": 20,
  "status": "available",
  "facilities": {
    "wifi": true,
    "chargingPorts": false,
    "silentZone": true,
    "ac": false
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Study area created successfully",
  "area": { /* full area object */ }
}
```

**Error Response (400):**
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

**Duplicate Response (409):**
```json
{
  "success": false,
  "error": "Study area with this name already exists",
  "errors": { "name": "A study area with this name already exists" }
}
```

---

## 💾 Form Data Structure

### TypeScript Interfaces
```typescript
// What form stores
type StudyAreaFormData = {
  area_name: string        // "Library Zone A"
  building: string         // "Main Building"
  floor: string            // "2" (string, converted to number on submit)
  capacity: string         // "50" (string, converted to number)
  latitude: string         // "40.7128"
  longitude: string        // "-74.0060"
  radius_meters: string    // "20"
  area_status: string      // "available"
  wifi: boolean            // true/false
  charging_ports: boolean  // true/false
  silent_zone: boolean     // true/false
  ac: boolean              // true/false
}

// What API receives
type StudyAreaPayload = {
  name: string             // ← renamed from area_name
  building: string
  floor: number | null     // ← converted to number
  capacity: number | null  // ← converted to number
  latitude: number         // ← converted to number
  longitude: number        // ← converted to number
  radiusMeters: number     // ← renamed from radius_meters
  status: string
  facilities: {
    wifi: boolean
    chargingPorts: boolean // ← camelCase
    silentZone: boolean    // ← camelCase
    ac: boolean
  }
}

// Validation result
type ValidationResult = {
  isValid: boolean
  errors: Record<string, string>  // { fieldName: errorMessage }
}
```

---

## 🧪 How to Test Validation

### Frontend Testing (In Browser)
1. Go to `/admin/study-area/add`
2. Leave fields empty → "Field is required" error
3. Type invalid data → See instant feedback
4. Type in field → Error auto-clears
5. Submit invalid form → Summary error shows
6. Fix errors one by one → Form remains filled
7. Click submit when valid → Success message

### Backend Testing (API Direct)
```bash
# Test 1: Valid request (201)
curl -X POST http://localhost:3000/api/study-areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Area",
    "building": "Building A",
    "floor": 1,
    "capacity": 50,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radiusMeters": 20,
    "status": "available"
  }'

# Test 2: Missing field (400)
curl -X POST http://localhost:3000/api/study-areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "building": "B",
    "latitude": 40,
    "longitude": -74
  }'

# Test 3: Duplicate name (409)
curl -X POST http://localhost:3000/api/study-areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bird Nest Commons",
    "building": "B",
    "floor": 1,
    "capacity": 50,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radiusMeters": 20,
    "status": "available"
  }'
```

---

## 📝 Usage Examples

### Example 1: Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate
  const validation = validateFormData(formData)
  if (!validation.isValid) {
    setFieldErrors(validation.errors)
    return
  }

  // Transform and send
  const payload = formDataToPayload(formData)
  const response = await fetch('/api/study-areas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (response.ok) {
    // Success - redirect
    router.push('/admin/study-area')
  } else {
    // Show errors
    setFieldErrors(data.errors || {})
    setError(data.error)
  }
}
```

### Example 2: Custom Field Validation
```typescript
import { validateAreaName } from '@/lib/validation/studyAreaValidation'

// Use individual validator
const error = validateAreaName(userInput)
if (error) {
  console.log(error)  // "Area name must be at least 3 characters"
}
```

### Example 3: Access Validation Constants
```typescript
import { STUDY_AREA_VALIDATION } from '@/lib/validation/studyAreaValidation'

// Use constants in other forms/components
const maxCapacity = STUDY_AREA_VALIDATION.CAPACITY.MAX  // 2000
const radiusOptions = Array.from(
  { length: 40 },
  (_, i) => (i + 1) * 5  // 5, 10, 15, ..., 200
).filter(
  r => r >= STUDY_AREA_VALIDATION.RADIUS_METERS.MIN &&
       r <= STUDY_AREA_VALIDATION.RADIUS_METERS.MAX
)
```

---

## 🐛 Debugging

### Check Validation Function
```typescript
const data = {
  area_name: "Test",
  building: "B",
  floor: "2",
  capacity: "50",
  latitude: "40",
  longitude: "-74",
  radius_meters: "20",
  area_status: "available",
  wifi: false,
  charging_ports: false,
  silent_zone: false,
  ac: false,
}

const result = validateFormData(data)
console.log(result)
// { isValid: false, errors: { building: "Building must be at least 2 characters" } }
```

### Check API Response
```typescript
const response = await fetch('/api/study-areas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

const data = await response.json()
console.log('Status:', response.status)
console.log('Data:', data)
console.log('Errors:', data.errors)
```

### Database Check
```sql
-- Check if area was created
SELECT * FROM study_areas WHERE area_name = 'Test Area';

-- Check occupancy record
SELECT * FROM area_occupancy WHERE study_area_id = 'uuid-here';

-- Check unique constraint
SELECT COUNT(*) FROM study_areas WHERE area_name = 'Library Zone A';
```

---

## 📚 Additional Resources

- **Full Validation Guide:** [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md)
- **Test Report:** [TEST_REPORT.md](./TEST_REPORT.md)
- **Validation Schema:** [src/lib/validation/studyAreaValidation.ts](./src/lib/validation/studyAreaValidation.ts)
- **Form Component:** [src/app/admin/study-area/add/page.tsx](./src/app/admin/study-area/add/page.tsx)
- **API Route:** [src/app/api/study-areas/route.ts](./src/app/api/study-areas/route.ts)

---

## ⚡ Performance Tips

1. **Avoid duplicate validation:** Use `validateFormData()` once per submit
2. **Reuse validators:** Import individual functions if needed repeatedly
3. **Cache STUDY_AREA_VALIDATION:** It's a constant, won't change
4. **Batch API calls:** If updating multiple areas, batch requests

---

## 🔐 Security Checklist

- ✅ Frontend validation prevents user mistakes
- ✅ Backend validation prevents unauthorized access
- ✅ Database constraints enforce integrity
- ✅ Prisma ORM prevents SQL injection
- ✅ Input trimming prevents whitespace attacks
- ✅ Pattern validation prevents special characters
- ✅ Type checking prevents injection
- ✅ Proper error messages (no info leakage)

---

## 📱 Mobile Support

- ✅ Form is fully responsive
- ✅ Touch-friendly input sizes
- ✅ Error messages readable on small screens
- ✅ Number inputs show numeric keyboard on mobile
- ✅ Latitude/longitude inputs show decimal keyboard

---

**Last Updated:** March 25, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

# Volunteer Submission Management Module

## Overview

A comprehensive volunteer submission management system for the StudyNest campus space finder application. This module allows volunteers to submit real-time lecture hall availability details with automatic expiry handling.

## Features

### 1. **Volunteer Hall Submission Form**
- **Lecture Hall Selection**: Dropdown populated from database
- **Availability Status**: Free, Partially Busy, Busy
- **Occupancy Level**: Empty, Low, Medium, High, Full
- **Available Seats**: Optional numeric input with validation
- **Notes**: Optional text for additional context
- **Expiry Duration**: 30 minutes, 1 hour, 2 hours, or custom time
- **Real-time Validation**: Field-level validation with error messages
- **Success/Error Feedback**: Toast-style notifications

### 2. **My Submissions List**
- **Active Submissions**: Shows current, non-expired submissions only
- **Expiry Countdown**: Real-time countdown timer (updates every second)
- **Status Badges**: Visual indicators for active/expired submissions
- **Status Colors**: Color-coded availability and occupancy levels
- **Edit Functionality**: Update non-expired submissions
- **Delete Functionality**: Remove submissions with confirmation
- **Submission History**: View all submissions including expired ones

### 3. **Automatic Expiry System**
- **Expiry Calculation**: Automatic calculation based on selected duration
- **Expired Filtering**: Expired submissions automatically filtered from active queries
- **Countdown Display**: Real-time remaining time display
- **Edit Prevention**: Cannot edit expired submissions
- **Soft Deletion**: Expired submissions retained in history

### 4. **Volunteer Dashboard**
- **User Greeting**: Personalized welcome message
- **Quick Tips**: Best practices for accurate submissions
- **Status Guide**: Explanation of availability statuses
- **Navigation**: Links to home, study areas, and dashboard
- **Responsive Design**: Mobile-friendly layout

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── volunteer/
│   │   │   └── hall-updates/
│   │   │       ├── route.ts          # GET, POST for submissions
│   │   │       └── [id]/
│   │   │           └── route.ts      # PUT, DELETE for specific submission
│   │   └── lecture-halls/
│   │       └── route.ts              # GET lecture halls dropdown data
│   └── volunteer/
│       └── page.tsx                  # Main volunteer dashboard page
├── components/
│   └── volunteer/
│       ├── VolunteerHallForm.tsx     # Form component
│       └── VolunteerSubmissionList.tsx # Submissions list component
└── lib/
    └── validations/
        └── volunteerHallUpdate.ts    # Validation logic & types
```

## API Endpoints

### 1. **GET /api/lecture-halls**
Fetch all active lecture halls for dropdown selection.

**Query Parameters:**
- `activeOnly` (optional, default: true) - Filter active halls only

**Response:**
```json
{
  "success": true,
  "count": 3,
  "halls": [
    {
      "hall_id": "uuid",
      "hall_name": "B0150",
      "building": "Main Building",
      "floor": 1,
      "capacity": 50,
      "hall_type": "lecture_hall"
    }
  ]
}
```

### 2. **GET /api/volunteer/hall-updates**
Retrieve volunteer's own submissions.

**Query Parameters:**
- `volunteerId` (required) - UUID of the volunteer
- `includeExpired` (optional, default: false) - Include expired submissions

**Response:**
```json
{
  "success": true,
  "count": 2,
  "submissions": [
    {
      "hall_update_id": 1,
      "volunteer_id": "uuid",
      "hall_id": "uuid",
      "availability_status": "Free",
      "occupancy_level": "Low",
      "available_seats": 35,
      "note": "Recently updated",
      "created_at": "2024-03-24T10:30:00Z",
      "expires_at": "2024-03-24T11:30:00Z",
      "isExpired": false,
      "lecture_halls": { ... }
    }
  ]
}
```

### 3. **POST /api/volunteer/hall-updates**
Create a new volunteer hall submission.

**Request Body:**
```json
{
  "volunteerId": "uuid",
  "hallId": "uuid",
  "availabilityStatus": "Free|Partially Busy|Busy",
  "occupancyLevel": "Empty|Low|Medium|High|Full",
  "availableSeats": 35,
  "note": "Optional note",
  "expiryDuration": "30m|1h|2h|custom",
  "expiryTime": "2024-03-24T11:30:00Z" // Only if custom
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Hall submission created successfully",
  "submission": { ... }
}
```

**Error Responses:**
- `400` - Validation failed, volunteer/hall not found, cooldown active
- `404` - Volunteer or hall not found
- `429` - Cooldown violation (must wait 15 minutes between updates for same hall)
- `500` - Server error

### 4. **PUT /api/volunteer/hall-updates/[id]**
Update an existing volunteer hall submission.

**URL Parameters:**
- `id` - Numeric hall_update_id

**Query Parameters:**
- `volunteerId` - UUID (for authorization)

**Request Body:** (same as POST)

**Restrictions:**
- Cannot update expired submissions
- Can only update own submissions
- Hall selection is immutable (cannot change hall)

**Success Response:**
```json
{
  "success": true,
  "message": "Submission updated successfully",
  "submission": { ... }
}
```

### 5. **DELETE /api/volunteer/hall-updates/[id]**
Delete a volunteer hall submission.

**URL Parameters:**
- `id` - Numeric hall_update_id

**Query Parameters:**
- `volunteerId` (required) - UUID for authorization

**Success Response:**
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

**Error Responses:**
- `400` - Missing or invalid parameters
- `403` - Unauthorized (not submission owner)
- `404` - Submission not found
- `500` - Server error

## Component APIs

### VolunteerHallForm Props
```typescript
interface VolunteerHallFormProps {
  volunteerId: string              // Required: UUID
  onSubmitSuccess?: (submission: any) => void  // Callback on success
  editingSubmission?: any          // Submission being edited
  onEditCancel?: () => void        // Callback when canceling edit
}
```

### VolunteerSubmissionList Props
```typescript
interface VolunteerSubmissionListProps {
  volunteerId: string              // Required: UUID
  onEdit?: (submission: Submission) => void   // Edit callback
  onDelete?: () => void            // Delete callback
  refreshTrigger?: number          // Change to trigger refresh
}
```

## Validation Rules

### Required Fields
- Lecture Hall
- Availability Status
- Occupancy Level
- Expiry Duration

### Conditional Validation
- **Available Seats**:
  - Must be >= 0
  - Cannot exceed hall capacity
  - If occupancy is "Full", must be 0
- **Expiry Time**:
  - Must be in the future
  - Required only when duration is "custom"
- **Cooldown**:
  - Same volunteer cannot submit for same hall within 15 minutes
  - Exception: Editing existing submissions

## Expiry Logic

### How Expiry Works
1. **Submission Creation**: `expires_at = now + duration`
2. **Active Queries**: Filter with `expires_at > now`
3. **Expired Submissions**: Excluded from active results but retained in history
4. **Automatic UI Update**: Countdown updates every second
5. **Edit Prevention**: Cannot edit submissions past expiry time

### Duration Mapping
- 30m = 30 minutes
- 1h = 1 hour
- 2h = 2 hours
- custom = User-specified datetime

## Usage Example

### For Frontend Integration

```typescript
import VolunteerPage from '@/app/volunteer/page'

// The page is a complete standalone component
// Just import and use - handles auth, state, and all logic
```

### For Direct API Usage

```typescript
// Create a submission
const response = await fetch('/api/volunteer/hall-updates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    volunteerId: 'user-uuid',
    hallId: 'hall-uuid',
    availabilityStatus: 'Free',
    occupancyLevel: 'Low',
    availableSeats: 30,
    note: 'Hall is quiet today',
    expiryDuration: '1h'
  })
})

const data = await response.json()
if (response.ok) {
  console.log('Created:', data.submission)
}

// Fetch submissions
const response = await fetch(
  `/api/volunteer/hall-updates?volunteerId=${userId}&includeExpired=false`
)
const { submissions } = await response.json()

// Update a submission
const response = await fetch(`/api/volunteer/hall-updates/1`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    volunteerId: 'user-uuid',
    availabilityStatus: 'Busy',
    occupancyLevel: 'High',
    availableSeats: 5,
    expiryDuration: '30m'
  })
})

// Delete a submission
const response = await fetch(
  `/api/volunteer/hall-updates/1?volunteerId=${userId}`,
  { method: 'DELETE' }
)
```

## Database Schema Integration

Uses existing `volunteer_hall_updates` table with fields:
- `hall_update_id` (int, PK)
- `volunteer_id` (uuid, FK to users)
- `hall_id` (uuid, FK to lecture_halls)
- `availability_status` (varchar)
- `occupancy_level` (varchar, nullable)
- `available_seats` (int, nullable)
- `confidence_level` (varchar, default: 'medium')
- `note` (varchar, nullable)
- `expires_at` (timestamp, nullable)
- `created_at` (timestamp, default: now)

## Type Definitions

### Enums
```typescript
type AvailabilityStatus = 'Free' | 'Partially Busy' | 'Busy'
type OccupancyLevel = 'Empty' | 'Low' | 'Medium' | 'High' | 'Full'
type ExpiryDuration = '30m' | '1h' | '2h' | 'custom'
```

### Validation Input
```typescript
interface VolunteerHallUpdateInput {
  hallId: string
  availabilityStatus: AvailabilityStatus
  occupancyLevel: OccupancyLevel
  availableSeats?: number
  note?: string
  expiryDuration: ExpiryDuration
  expiryTime?: Date
}
```

## Security & Best Practices

### Authorization
- Volunteers can only view/edit/delete their own submissions
- Server validates `volunteerId` on every request
- All authentication is temporary until full auth system is integrated

### Input Validation
- All inputs validated server-side
- Prisma query filtering prevents SQL injection
- Type-safe API with TypeScript

### Performance
- Indexed queries on `volunteer_id` and `hall_id`
- Efficient JSON responses
- Minimal database round-trips

### Future Enhancements
1. **Batch Operations**: Update multiple submissions
2. **Admin Dashboard**: View all volunteer submissions
3. **Analytics**: Track submission accuracy
4. **Email Notifications**: Notify students of updates
5. **Scheduled Cleanup**: Automated deletion of old expired submissions
6. **Caching**: Cache lecture halls list
7. **Rate Limiting**: Prevent abuse via Redis
8. **Audit Logging**: Track all submission changes

## Testing Checklist

- ✓ Form validation with empty fields
- ✓ Form validation with invalid seat counts
- ✓ Creating a new submission
- ✓ Viewing submission list
- ✓ Real-time countdown timer
- ✓ Editing active submission
- ✓ Cannot edit expired submission
- ✓ Deleting submission
- ✓ Cooldown enforcement
- ✓ Expiry filtering in list
- ✓ Custom expiry time selection
- ✓ Hall capacity validation
- ✓ Occupancy/seats logical consistency

## Known Limitations

1. **Authentication**: Currently uses mock volunteer ID in localStorage
2. **Real-time Updates**: Submissions list doesn't auto-update (requires manual refresh)
3. **Image Upload**: Note field is text-only (no image attachments)
4. **Location-based**: Uses static hall selection, not based on user location
5. **Caching**: No caching of lecture halls or submissions

## Future Integration Points

### Authentication:
Replace the localStorage-based `currentVolunteerId` in `page.tsx` with actual auth:
```typescript
const { user } = useAuth() // From auth provider
const volunteerId = user?.id
```

### Real-time Updates:
Add WebSocket connection for live submission updates:
```typescript
const socket = useWebSocket(`ws://localhost:3000/api/volunteer/updates/${volunteerId}`)
```

### Analytics:
Send events to analytics service:
```typescript
trackEvent('volunteer_submitted', {
  hall_id: hallId,
  occupancy_level: occupancyLevel,
  duration: expiryDuration
})
```

## Support & Troubleshooting

### Common Issues

**Q: POST endpoint returns 404**
- A: Ensure the `src/app/api/volunteer/hall-updates/route.ts` file exists
- Restart dev server: `npm run dev`

**Q: Submissions not appearing in list**
- A: Check if `volunteerId` in localStorage matches database records
- Verify volunteer exists in `users` table with `role='volunteer'`

**Q: Cooldown error when trying to update same hall**
- A: This is by design. Use the Edit button on existing submission instead
- Cooldown is 15 minutes between new submissions for same hall

**Q: Expiry time shows as null**
- A: Ensure `expiryDuration` is set. Custom duration requires `expiryTime` in ISO format

## Contact & Support

For issues or enhancements, refer to the StudyNest development team.

---

**Last Updated**: March 24, 2024
**Version**: 1.0.0
**Status**: Production Ready

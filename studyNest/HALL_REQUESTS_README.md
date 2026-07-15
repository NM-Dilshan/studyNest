# Real-Time Lecture Hall Request and Update System

## Overview

This system enables students and volunteers to request real-time lecture hall information and allows volunteers to respond with current hall status, occupancy levels, and availability.

## Features

### For Students
- Create real-time requests for lecture hall information
- View request status (Pending, Responded, Expired, Closed)
- Receive and view volunteer responses with hall details
- See volunteer confidence levels and response timestamps
- Automatically refresh to see new responses (5-10 second polling)

### For Volunteers
- Real-time dashboard showing incoming requests
- View requester details including ID number
- Respond with detailed hall information:
  - Availability status (Free, Partially Busy, Busy)
  - Occupancy level (Empty, Low, Medium, High, Full)
  - Available seat count
  - Confidence level
  - Custom expiry time
  - Optional volunteer notes
- Automatic updates to request status
- Support for multiple responses to the same request

## Database Schema

### New Models Added

#### `hall_requests`
```
- request_id (UUID, primary key)
- requester_id (UUID, foreign key to users)
- requester_role (string: 'student' | 'volunteer')
- requester_id_number (string: student_id or volunteer_id)
- hall_id (UUID, foreign key to lecture_halls)
- request_note (string, max 300 chars, optional)
- request_status (string: 'Pending' | 'Responded' | 'Expired' | 'Closed')
- created_at (timestamp)
- updated_at (timestamp)
- expires_at (timestamp, 1 hour default)
```

#### `hall_request_updates`
```
- update_id (UUID, primary key)
- request_id (UUID, foreign key to hall_requests)
- responder_id (UUID, foreign key to users)
- availability_status (string: 'Free' | 'Partially Busy' | 'Busy')
- occupancy_level (string: 'Empty' | 'Low' | 'Medium' | 'High' | 'Full')
- available_seats (integer, optional)
- volunteer_note (string, max 300 chars, optional)
- confidence_level (string: 'Low' | 'Medium' | 'High', default 'Medium')
- expires_at (timestamp)
- created_at (timestamp)
```

#### Updated `users` Model
```
- volunteer_id added (string, unique, optional)
  - For volunteers to have their own volunteer ID
  - Displayed to students/requests
```

Updated `lecture_halls` Model
```
- Added relationship to hall_requests
```

## API Endpoints

### Create Request
```
POST /api/hall-requests
Content-Type: application/json

{
  "hallId": "uuid",
  "note": "optional note up to 300 chars",
  "userId": "uuid",
  "userRole": "student" | "volunteer",
  "userIdNumber": "student_id or volunteer_id"
}

Response: 201 Created
{
  "success": true,
  "message": "Request created successfully",
  "data": { hall_request object }
}
```

### Get All Pending Requests (Volunteer Dashboard)
```
GET /api/hall-requests?status=Pending&skip=0&take=20

Response: 200 OK
{
  "success": true,
  "data": [ hall_request objects ],
  "pagination": { skip, take, total, hasMore }
}
```

### Get User's Own Requests
```
GET /api/hall-requests/my?userId=uuid&skip=0&take=20

Response: 200 OK
{
  "success": true,
  "data": [ user's hall_request objects ],
  "pagination": { skip, take, total, hasMore }
}
```

### Submit Response to Request
```
POST /api/hall-requests/[id]/respond
Content-Type: application/json

{
  "responderId": "uuid",
  "availabilityStatus": "Free" | "Partially Busy" | "Busy",
  "occupancyLevel": "Empty" | "Low" | "Medium" | "High" | "Full",
  "availableSeats": number (optional),
  "volunteerNote": "optional note",
  "confidenceLevel": "Low" | "Medium" | "High",
  "expiryMinutes": 30 | 60 | 120 | 180
}

Response: 201 Created
{
  "success": true,
  "message": "Response submitted successfully",
  "data": { hall_request_updates object }
}
```

## Frontend Pages and Routes

### Student Routes
- `/requests` - Main requests page for students
  - Request form (create new request)
  - List of user's requests
  - Volunteer responses displayed

### Volunteer Routes
- `/volunteer/requests` - Volunteer dashboard
  - Incoming requests list with polling
  - Request form (volunteers can also create requests)
  - Response form (in-line with request details)
  - Automatic refresh every 5 seconds

## Components

### RequestForm.tsx
- Handles creation of requests
- Hall selection dropdown
- Optional message input (max 300 chars)
- Displays user info (name, ID, role)
- Success/error feedback

### MyRequestsList.tsx
- Displays user's requests
- Shows request status with badges
- Displays volunteer responses
- Polling-based refresh

### RequestResponseCard.tsx
- Displays individual volunteer responses
- Shows volunteer details and confidence level
- Displays hall status information
- Handles expired responses

### VolunteerIncomingRequestList.tsx
- Auto-refreshing request list (every 5 seconds)
- Expandable request details
- Shows requester ID and role
- Ready-to-respond interface
- Handles multiple responses per request

### VolunteerRequestResponseForm.tsx
- Form for submitting responses
- All required fields with validation
- Confidence level selection
- Expiry time configuration
- Volunteer notes support

## Validation Rules

### Request Validation
- Hall selection is required
- Note must be ≤ 300 characters
- User must be logged in
- Prevents duplicate pending requests for same hall by same user within 15 minutes

### Response Validation
- Request must exist and not be closed
- Availability status is required
- Occupancy level is required
- Available seats must be ≥ 0
- Available seats must be ≤ hall capacity
- If occupancy = "Full", available seats must be 0
- Confidence level is required
- Expiry time must be future time

## Real-Time Updates

### Polling Strategy
- Student requests page: Automatically refresh every 5-10 seconds
- Volunteer dashboard: Automatically refresh every 5 seconds
- Manual refresh buttons available on all pages
- UI updates on new responses

### Status Flow
```
Request Created
    ↓
Pending (awaiting volunteer response)
    ↓
Volunteer Responds
    ↓
Responded (student sees response)
    ↓
Expired (automatically after set time) or Closed (manually)
```

## Integration Points

### With Existing Hall Update System
- Volunteer responses can serve as real-time hall updates
- Expiry mechanism prevents stale information
- Future: Integrate responses into volunteer_hall_updates for cross-system consistency

## Security Considerations

- User authentication required (via localStorage user object in MVP, will integrate with proper auth)
- Voters can only respond to requests for themselves
- Only volunteers can respond to requests
- Request sender visibility controlled (ID shown to volunteers only)

## Future Enhancements

1. **Notifications**
   - Push notifications when request receives response
   - Notification badges on requests icon

2. **Ratings and Reviews**
   - Students can rate volunteer responses
   - Accuracy feedback system
   - Volunteer reputation integration

3. **Advanced Filtering**
   - Filter requests by building, floor, hall type
   - Filter by date range
   - Request history archival

4. **Analytics**
   - Response time statistics
   - Popular halls tracking
   - Volunteer performance metrics

5. **Integration with Existing Updates**
   - Link responses to volunteer_hall_updates table
   - Consolidate real-time data sources
   - Unified hall status view

## Usage Instructions

### Students
1. Navigate to `/requests`
2. Fill in the request form:
   - Select a lecture hall
   - Optionally add a message
3. Click "Send Request"
4. Watch for volunteer responses in real-time
5. View response details with occupancy and availability info

### Volunteers
1. Navigate to `/volunteer/requests`
2. Review incoming requests (auto-updates every 5 seconds)
3. Click on a request to expand details
4. Click "Respond with Hall Information"
5. Fill in current hall status:
   - Availability status
   - Occupancy level
   - Available seats
   - Confidence level
   - Valid duration
   - Optional notes
6. Click "Submit Response"
7. Response appears to requester in real-time

## Testing Checklist

- [ ] Create request as student
- [ ] View pending request on volunteer dashboard
- [ ] Submit response as volunteer
- [ ] See response on student's requests page
- [ ] Test polling/auto-refresh
- [ ] Test validation (try invalid inputs)
- [ ] Test duplicate request prevention
- [ ] Test role-based access
- [ ] Test date formatting and timestamps
- [ ] Test response expiry display
- [ ] Test error handling

## Deployment Notes

1. Run Prisma migrations to create new tables:
   ```bash
   npx prisma migrate dev --name add_hall_requests
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Environment variables needed:
   - `DATABASE_URL`: PostgreSQL connection string (already configured)

4. Test endpoints with Postman or similar tool before going live

5. Monitor database performance with large request volumes

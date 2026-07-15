# Volunteer Feedback & Level-Up System - Integration Guide

## Overview

This guide explains how to integrate the new volunteer feedback and level-up system into your StudyNest application. The system allows:

- **Users** to rate and comment on volunteer responses
- **Volunteers** to earn points and level up based on responses and feedback
- **Display** volunteer stats including level, points, and ratings

## Database

### Schema Changes

Two new models have been added:

1. **volunteer_feedback** - Stores user feedback on volunteer responses
2. **volunteer_scores** - Enhanced with points and level fields

Key fields in `volunteer_feedback`:
- `feedback_id` - Primary identifier
- `response_id` - Links to hall_request_updates
- `request_id` - Links to hall_requests
- `given_by_user_id` - The user leaving feedback
- `stars` - Rating 1-5
- `comment` - Optional comment (max 300 chars)
- `created_at` - Timestamp

Enhanced `volunteer_scores`:
- `total_responses` - Number of responses submitted
- `total_feedback_received` - Count of feedback submissions
- `average_feedback_rating` - Average star rating
- `total_points` - Accumulated gamification points
- `level` - Current level (1-5)

### Point System

**Response Points:**
- Each response submission = +5 points

**Feedback Bonus Points (per star rating):**
- 5 stars = +10 bonus points
- 4 stars = +7 bonus points
- 3 stars = +5 bonus points
- 2 stars = +2 bonus points
- 1 star = +0 bonus points

**Levels:**
- Level 1 (Beginner): 0-49 points (🌱)
- Level 2 (Contributor): 50-99 points (⭐)
- Level 3 (Expert): 100-199 points (🔥)
- Level 4 (Master): 200-349 points (👑)
- Level 5 (Legend): 350+ points (🎖️)

## Components

### 1. ResponseFeedbackForm

**Purpose:** Rating and comment form for users

**Location:** `src/components/feedback/ResponseFeedbackForm.tsx`

**Props:**
```typescript
interface ResponseFeedbackFormProps {
  responseId: string;              // hall_request_updates.update_id
  requestId: string;               // hall_requests.request_id
  volunteerId: string;             // users.user_id
  volunteerName: string;           // users.name
  onSuccess?: () => void;          // Callback after successful submission
  onClose?: () => void;            // Close handler
}
```

**Example Usage:**
```tsx
import { ResponseFeedbackForm } from "@/components/feedback/ResponseFeedbackForm";

<ResponseFeedbackForm
  responseId="uuid-of-response"
  requestId="uuid-of-request"
  volunteerId="uuid-of-volunteer"
  volunteerName="John Volunteer"
  onSuccess={() => {
    console.log("Feedback submitted!");
    // Refresh request data
  }}
  onClose={() => setShowForm(false)}
/>
```

### 2. ResponseWithFeedback

**Purpose:** Complete response display with integrated feedback button

**Location:** `src/components/feedback/ResponseWithFeedback.tsx`

**Props:**
```typescript
interface ResponseWithFeedbackProps {
  response: HallRequestUpdate;      // The volunteer response
  request: HallRequest;             // The original request
  currentUserId: string;            // Authenticated user's ID
  onFeedbackSubmitted?: () => void; // Callback after successful feedback
}
```

**Example Usage:**
```tsx
import { ResponseWithFeedback } from "@/components/feedback/ResponseWithFeedback";

<ResponseWithFeedback
  response={volunteerResponse}
  request={hallRequest}
  currentUserId={user.user_id}
  onFeedbackSubmitted={() => {
    // Refresh page or update local state
    location.reload();
  }}
/>
```

### 3. VolunteerProfileStats

**Purpose:** Display volunteer's profile, level, points, and rating stats

**Location:** `src/components/volunteer/VolunteerProfileStats.tsx`

**Props:**
```typescript
interface VolunteerProfileStatsProps {
  volunteerId: string;   // users.user_id
  onClose?: () => void;  // Close handler for modal
}
```

**Example Usage:**
```tsx
import { VolunteerProfileStats } from "@/components/volunteer/VolunteerProfileStats";

<VolunteerProfileStats
  volunteerId="uuid-of-volunteer"
  onClose={() => setShowProfile(false)}
/>
```

**Features:**
- Current level with badge and title
- Total points earned
- Progress bar to next level
- Total responses submitted
- Feedback breakdown by star rating
- Average rating
- Beautiful gradient UI

### 4. VolunteerHeaderProfile

**Purpose:** Clickable button in header to open volunteer profile stats

**Location:** `src/components/volunteer/VolunteerHeaderProfile.tsx`

**Props:**
```typescript
interface VolunteerHeaderProfileProps {
  volunteerName: string;      // users.name
  volunteerId: string;        // users.user_id
  volunteerIdNumber?: string; // users.volunteer_id
}
```

**Example Usage:**
```tsx
import { VolunteerHeaderProfile } from "@/components/volunteer/VolunteerHeaderProfile";

<VolunteerHeaderProfile
  volunteerName="John Doe"
  volunteerId="uuid"
  volunteerIdNumber="V001"
/>
```

## API Routes

### POST /api/volunteer-feedback

**Purpose:** Submit feedback for a volunteer response

**Request Body:**
```typescript
{
  response_id: string;    // ID of the response being rated
  request_id: string;     // ID of the original request
  user_id: string;        // Authenticated user's ID (from localStorage)
  stars: number;          // 1-5 rating
  comment?: string;       // Optional comment (max 300 chars)
}
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  data?: {
    feedback_id: string;
    stars: number;
    comment: string | null;
    created_at: string;
  };
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}
```

**Status Codes:**
- `201` - Feedback submitted successfully
- `400` - Invalid data
- `401` - Unauthorized
- `403` - Permission denied (not request owner)
- `404` - Request or response not found
- `409` - Duplicate feedback already submitted
- `500` - Server error

**Example:**
```typescript
const response = await fetch("/api/volunteer-feedback", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${userId}`,
  },
  body: JSON.stringify({
    response_id: "uuid",
    request_id: "uuid",
    user_id: userId,
    stars: 5,
    comment: "Very helpful response!",
  }),
});
```

### GET /api/volunteer-profile/[id]

**Purpose:** Get volunteer's stats, level, and rating information

**Parameters:**
- `id` - Volunteer's user_id (UUID)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    volunteer_id: string;
    name: string;
    volunteer_id_num: string;
    total_responses: number;
    total_feedback: number;
    average_rating: number;
    feedback_breakdown: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
    total_points: number;
    level: number;
    level_title: string;
    level_progress: {
      currentLevel: number;
      currentLevelTitle: string;
      nextLevel: number | null;
      nextLevelTitle: string | null;
      currentLevelMin: number;
      nextLevelMin: number | null;
      pointsInCurrentLevel: number;
      pointsNeededForNextLevel: number | null;
      progressPercentage: number; // 0-100
      totalPoints: number;
    };
  };
  error?: string;
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid ID
- `404` - Volunteer not found
- `500` - Server error

**Example:**
```typescript
const response = await fetch("/api/volunteer-profile/uuid");
const data = await response.json();
// Display level, points, rating breakdown
```

## Utilities

### volunteer-level.ts

Helper functions for point calculations and level determination:

```typescript
import {
  calculateResponsePoints,
  calculateFeedbackPoints,
  calculateTotalPoints,
  getLevelFromPoints,
  calculateLevelProgress,
} from "@/lib/volunteer-level";

// Calculate points from 10 responses: 10 * 5 = 50 points
const responsePoints = calculateResponsePoints(10);

// Calculate bonus for 5-star feedback: 10 points
const feedbackBonus = calculateFeedbackPoints(5);

// Total points from responses + feedback
const total = calculateTotalPoints(10, [5, 5, 4, 3]);

// Get level from points: 150 points = Level 3
const level = getLevelFromPoints(150);

// Get detailed progress info
const progress = calculateLevelProgress(150);
// Returns: { currentLevel: 3, nextLevel: 4, progressPercentage: 50, ... }
```

### feedback.ts (Validations)

Validation and error handling:

```typescript
import {
  validateFeedback,
  validateFeedbackPermission,
  FEEDBACK_ERRORS,
} from "@/lib/validations/feedback";

// Validate feedback data
const result = validateFeedback({
  stars: 5,
  comment: "Great help!",
});

if (!result.valid) {
  console.error(result.errors); // Array of validation errors
}

// Check permission
const canFeedback = validateFeedbackPermission(userId, requestOwnerId);

// Access error messages
console.log(FEEDBACK_ERRORS.NO_PERMISSION);
console.log(FEEDBACK_ERRORS.DUPLICATE_FEEDBACK);
```

### volunteer-stats.ts (Service)

Service functions for stats calculation:

```typescript
import {
  updateVolunteerScoresAfterResponse,
  updateVolunteerScoresAfterFeedback,
  getVolunteerCompleteStats,
  checkExistingFeedback,
  getFeedbackForResponse,
} from "@/services/volunteer-stats";

// Called when volunteer submits a response
await updateVolunteerScoresAfterResponse(volunteerId);

// Called when feedback is submitted
await updateVolunteerScoresAfterFeedback(volunteerId);

// Get all volunteer stats
const stats = await getVolunteerCompleteStats(volunteerId);

// Check if feedback exists
const exists = await checkExistingFeedback(responseId, userId);

// Get feedback for a specific response
const feedback = await getFeedbackForResponse(responseId);
```

## Integration Examples

### Example 1: Integrate Feedback into Request Details Page

```tsx
// In your request details component
"use client";
import { ResponseWithFeedback } from "@/components/feedback/ResponseWithFeedback";

export default function RequestDetailsPage({ params }:Props) {
  const { request, response } = useRequestData();
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1>Request Details</h1>
      
      {/* Display response with feedback option */}
      {response && (
        <ResponseWithFeedback
          response={response}
          request={request}
          currentUserId={user.user_id}
          onFeedbackSubmitted={() => {
            // Refresh request data
            refetchRequest();
          }}
        />
      )}
    </div>
  );
}
```

### Example 2: Add Profile Button to Volunteer Header

```tsx
// In your volunteer header component
import { VolunteerHeaderProfile } from "@/components/volunteer/VolunteerHeaderProfile";

export function VolunteerHeader({ volunteer }) {
  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <h1>Study Nest</h1>
        
        {/* Clickable volunteer profile */}
        <VolunteerHeaderProfile
          volunteerName={volunteer.name}
          volunteerId={volunteer.user_id}
          volunteerIdNumber={volunteer.volunteer_id}
        />
      </div>
    </header>
  );
}
```

### Example 3: Display Volunteer Stats in Volunteer Dashboard

```tsx
// In volunteer dashboard
import { VolunteerProfileStats } from "@/components/volunteer/VolunteerProfileStats";

export function VolunteerDashboard() {
  const { volunteer } = useAuth();

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* Sidebar with stats */}
      <div className="col-span-1">
        <VolunteerProfileStats volunteerId={volunteer.user_id} />
      </div>

      {/* Main content */}
      <div className="col-span-2">
        {/* Your other dashboard content */}
      </div>
    </div>
  );
}
```

### Example 4: Programmatically Submit Feedback

```tsx
async function submitFeedback(
  responseId: string,
  requestId: string,
  volunteerId: string,
  stars: number,
  comment: string
) {
  const userId = getCurrentUserId(); // From auth
  
  const response = await fetch("/api/volunteer-feedback", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      response_id: responseId,
      request_id: requestId,
      user_id: userId,
      stars,
      comment,
    }),
  });

  if (response.ok) {
    console.log("Feedback submitted!");
    // Refresh volunteer stats
  } else {
    const error = await response.json();
    console.error(error.error);
  }
}
```

## Business Logic Flow

### When a Volunteer Submits a Response:

1. Volunteer submits response via existing hal-requests API
2. System records response in `hall_request_updates`
3. `updateVolunteerScoresAfterResponse()` is called (if you add this)
   - Counts total responses
   - Calculates response points (5 per response)
   - Updates `volunteer_scores`

### When a User Submits Feedback:

1. User clicks "Rate Response" button
2. Form validates: stars required, comment optional (max 300 chars)
3. API checks:
   - User is request owner
   - Response exists
   - No duplicate feedback
4. Feedback stored in `volunteer_feedback`
5. `updateVolunteerScoresAfterFeedback()` called
   - Recalculates total points
   - Adds feedback bonus points based on stars
   - Updates average rating
   - Determines new level
   - Updates `volunteer_scores`

### When User Views Volunteer Profile:

1. Click on volunteer name/ID in header
2. Modal opens showing profile stats
3. API fetches from `/api/volunteer-profile/[id]`
4. Displays:
   - Current level with badge
   - Total points
   - Progress to next level
   - Rating breakdown
   - Response count

## Testing Checklist

- [ ] User can rate volunteer response (1-5 stars)
- [ ] User can add optional comment (max 300 chars)
- [ ] User cannot submit duplicate feedback
- [ ] Only request owner can submit feedback
- [ ] Feedback points calculated correctly
- [ ] Volunteer level updates after feedback
- [ ] Volunteer profile shows correct stats
- [ ] Click volunteer name opens stats modal
- [ ] Level badges display correctly
- [ ] Rating breakdown chart shows accurate counts
- [ ] Progress bar shows correct advancement

## Key Files Created

```
src/
├── lib/
│   ├── volunteer-level.ts          # Point/level calculations
│   └── validations/
│       └── feedback.ts             # Feedback validation
│
├── services/
│   └── volunteer-stats.ts          # Stats service
│
├── components/
│   ├── feedback/
│   │   ├── ResponseFeedbackForm.tsx    # Rating form
│   │   └── ResponseWithFeedback.tsx    # Response + feedback
│   └── volunteer/
│       ├── VolunteerProfileStats.tsx   # Stats display
│       └── VolunteerHeaderProfile.tsx  # Header button
│
└── app/api/
    ├── volunteer-feedback/
    │   └── route.ts                # Feedback submission API
    └── volunteer-profile/[id]/
        └── route.ts                # Profile stats API

prisma/
└── schema.prisma               # Updated with new models
```

## Troubleshooting

**Issue:** "Cannot read properties of undefined (reading 'name')"
- Solution: Ensure `responder` relation is populated in queries

**Issue:** "User not found" when creating feedback
- Solution: Verify user is logged in and user_id is in localStorage

**Issue:** "Duplicate feedback" error when expecting new submission
- Solution: User already submitted feedback for this response; clear and retry

**Issue:** Level not updating after feedback
- Solution: Make sure `updateVolunteerScoresAfterFeedback()` is called after creating feedback

**Issue:** Stats showing 0 for new volunteer
- Solution: Create initial `volunteer_scores` record when volunteer first submits response

## Next Steps

1. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name add_volunteer_feedback
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Integrate components into your existing pages

4. Test the complete feedback flow end-to-end

5. Monitor volunteer stats for accurate point calculations


# Volunteer Feedback & Level-Up System - Quick Start Guide

## 5-Minute Setup

### 1. Update Database

```bash
cd studyNest

# Create and apply migration
npx prisma migrate dev --name add_volunteer_feedback

# Restart dev server
npm run dev
```

### 2. Import and Use Feedback Form

```tsx
import { ResponseWithFeedback } from "@/components/feedback/ResponseWithFeedback";

<ResponseWithFeedback
  response={volunteerResponse}
  request={hallRequest}
  currentUserId={authUser.user_id}
  onFeedbackSubmitted={() => refetchData()}
/>
```

### 3. Add Volunteer Profile Button to Header

```tsx
import { VolunteerHeaderProfile } from "@/components/volunteer/VolunteerHeaderProfile";

<VolunteerHeaderProfile
  volunteerName={volunteer.name}
  volunteerId={volunteer.user_id}
  volunteerIdNumber={volunteer.volunteer_id}
/>
```

## Common Code Patterns

### Pattern 1: Display Response with Feedback Option

```tsx
import { ResponseWithFeedback } from "@/components/feedback/ResponseWithFeedback";

function RequestDetailsPage() {
  const { request, response } = useRequest();
  const { user } = useAuth();

  return (
    <div>
      {response && (
        <ResponseWithFeedback
          response={response}
          request={request}
          currentUserId={user.user_id}
          onFeedbackSubmitted={() => {
            refetchRequest();
          }}
        />
      )}
    </div>
  );
}
```

### Pattern 2: Show Volunteer Profile Stats

```tsx
import { VolunteerProfileStats } from "@/components/volunteer/VolunteerProfileStats";

function VolunteerProfileModal() {
  const [showing, setShowing] = useState(false);
  const volunteerId = "uuid-of-volunteer";

  return (
    <>
      <button onClick={() => setShowing(true)}>View Profile</button>

      {showing && (
        <div className="modal">
          <VolunteerProfileStats
            volunteerId={volunteerId}
            onClose={() => setShowing(false)}
          />
        </div>
      )}
    </>
  );
}
```

### Pattern 3: Get Volunteer Stats Programmatically

```tsx
import { getVolunteerCompleteStats } from "@/services/volunteer-stats";

async function displayVolunteerStats(volunteerId: string) {
  try {
    const stats = await getVolunteerCompleteStats(volunteerId);
    
    console.log(`${stats.name} is Level ${stats.level_title}`);
    console.log(`Points: ${stats.total_points}`);
    console.log(`Average Rating: ${stats.average_rating.toFixed(1)}/5`);
    
  } catch (error) {
    console.error("Failed to load stats");
  }
}
```

### Pattern 4: Submit Feedback Programmatically

```tsx
async function submitFeedback(
  responseId: string,
  stars: number,
  comment: string
) {
  const userId = localStorage.getItem("user")?.user_id;
  
  const res = await fetch("/api/volunteer-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response_id: responseId,
      request_id: "...",
      user_id: userId,
      stars,
      comment,
    }),
  });

  if (res.ok) {
    console.log("✓ Feedback submitted");
  } else {
    const error = await res.json();
    console.error(error.error);
  }
}
```

### Pattern 5: Calculate Points Manually

```tsx
import {
  calculateTotalPoints,
  calculateLevelProgress,
  getLevelTitle,
} from "@/lib/volunteer-level";

const totalResponses = 12;
const feedbackStars = [5, 5, 4, 3, 4];

const points = calculateTotalPoints(totalResponses, feedbackStars);
const level = calculateLevelProgress(points);

console.log(`Total: ${points} points`);
console.log(`Level: ${level.currentLevelTitle}`);
console.log(`Progress: ${level.progressPercentage.toFixed(0)}%`);
```

## File Reference

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ResponseFeedbackForm` | `/components/feedback/ResponseFeedbackForm.tsx` | 1-5 star rating form |
| `ResponseWithFeedback` | `/components/feedback/ResponseWithFeedback.tsx` | Response display + feedback |
| `VolunteerProfileStats` | `/components/volunteer/VolunteerProfileStats.tsx` | Level/points/stats modal |
| `VolunteerHeaderProfile` | `/components/volunteer/VolunteerHeaderProfile.tsx` | Clickable header button |

### Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `volunteer-level.ts` | `/lib/volunteer-level.ts` | Point/level calculations |
| `feedback.ts` | `/lib/validations/feedback.ts` | Validation & errors |
| `volunteer-stats.ts` | `/services/volunteer-stats.ts` | Stats service |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/volunteer-feedback` | POST | Submit feedback |
| `/api/volunteer-profile/[id]` | GET | Get volunteer stats |

### Types

| Type | Location | Purpose |
|------|----------|---------|
| Feedback types | `/types/volunteer-feedback.ts` | TypeScript interfaces |

## Point System Quick Reference

### Earning Points

```
Each response submitted: 5 points
Feedback bonus:
  - 5 stars: 10 points
  - 4 stars: 7 points
  - 3 stars: 5 points
  - 2 stars: 2 points
  - 1 star: 0 points
```

### Levels

```
Level 1 (Beginner   🌱): 0-49 points
Level 2 (Contributor ⭐): 50-99 points
Level 3 (Expert      🔥): 100-199 points
Level 4 (Master      👑): 200-349 points
Level 5 (Legend      🎖️): 350+ points
```

## API Reference

### POST /api/volunteer-feedback

**Request:**
```json
{
  "response_id": "uuid",
  "request_id": "uuid",
  "user_id": "uuid",
  "stars": 5,
  "comment": "Optional comment"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedback_id": "uuid",
    "stars": 5,
    "comment": "Optional comment",
    "created_at": "2024-04-08T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "You have already provided feedback for this response",
  "errors": [{"field": "root", "message": "Duplicate feedback"}]
}
```

### GET /api/volunteer-profile/[id]

**Response:**
```json
{
  "success": true,
  "data": {
    "volunteer_id": "uuid",
    "name": "John Volunteer",
    "volunteer_id_num": "V001",
    "total_responses": 45,
    "total_feedback": 32,
    "average_rating": 4.5,
    "total_points": 287,
    "level": 4,
    "level_title": "Master",
    "feedback_breakdown": {
      "five_star": 20,
      "four_star": 10,
      "three_star": 2,
      "two_star": 0,
      "one_star": 0
    },
    "level_progress": {
      "currentLevel": 4,
      "nextLevel": 5,
      "progressPercentage": 39,
      "pointsNeededForNextLevel": 63
    }
  }
}
```

## Integration Checklist

- [ ] Applied database migration
- [ ] Imported `ResponseWithFeedback` or `ResponseFeedbackForm` component
- [ ] Integrated feedback form into request details page
- [ ] Added `VolunteerHeaderProfile` to volunteer header
- [ ] Tested feedback submission
- [ ] Tested volunteer profile display
- [ ] Verified points calculation
- [ ] Tested level updates
- [ ] Checked mobile responsiveness
- [ ] Tested error handling

## Common Questions

**Q: Can a user submit feedback multiple times?**
A: No. Due to the unique constraint on `(response_id, given_by_user_id)`, each user can only submit one feedback per response. Attempting duplicate feedback returns a 409 error.

**Q: How are points calculated?**
A: Points come from two sources:
1. Response points: `number_of_responses × 5`
2. Feedback bonus: Sum of bonus points from each star rating received

**Q: When do levels update?**
A: Levels update automatically when:
1. A volunteer submits a new response (recalculates)
2. A user submits feedback (recalculates)

**Q: Can volunteers see their own stats?**
A: Yes. Click on volunteer name/ID in header to open stats modal.

**Q: Is feedback required for leveling up?**
A: No. Volunteers earn base points for responding (5 per response). Feedback gives bonus points, but isn't required.

**Q: What if volunteer deletes a response?**
A: Associated feedback is deleted via cascade, and volunteer scores are recalculated.

**Q: How can I reset volunteer scores?**
A: Update via database directly or use service function. Scores will recalculate next time feedback is submitted.

## Debugging Tips

### Check volunteer stats calculation:
```tsx
const stats = await getVolunteerCompleteStats(volunteerId);
console.log("Stats:", stats);
```

### Validate feedback data:
```tsx
import { validateFeedback } from "@/lib/validations/feedback";
const result = validateFeedback({ stars: 5, comment: "Great!" });
console.log("Valid:", result.valid);
console.log("Errors:", result.errors);
```

### Check for existing feedback:
```tsx
import { checkExistingFeedback } from "@/services/volunteer-stats";
const exists = await checkExistingFeedback(responseId, userId);
console.log("Already submitted:", exists);
```

### View volunteer scores in database:
```sql
SELECT 
  v.name,
  vs.level,
  vs.total_points,
  vs.total_responses,
  vs.average_feedback_rating
FROM volunteer_scores vs
JOIN users v ON vs.volunteer_id = v.user_id
ORDER BY vs.total_points DESC;
```

## Production Checklist

- [ ] Database backups created
- [ ] Migration tested in staging
- [ ] API error handling verified
- [ ] Validation rules working correctly
- [ ] Component styling matches design system
- [ ] Mobile responsive tested on real devices
- [ ] Performance tested with multiple users
- [ ] Security: User permission checks verified
- [ ] Security: SQL injection protection verified
- [ ] Analytics/monitoring set up
- [ ] Documentation updated
- [ ] User communication plan ready

## Support Resources

- **Integration Guide**: See `VOLUNTEER_FEEDBACK_INTEGRATION.md`
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`
- **API Docs**: See inline comments in route files
- **Type Definitions**: See `/types/volunteer-feedback.ts`
- **Service Functions**: See `/services/volunteer-stats.ts`
- **Utilities**: See `/lib/volunteer-level.ts`


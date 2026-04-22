# Volunteer Feedback & Level-Up System - Database Setup

## Overview

This document describes the database changes required to implement the volunteer feedback and level-up system.

## New Database Models

### 1. volunteer_feedback Model

Stores user feedback (ratings and comments) for volunteer responses.

**Table Structure:**
```sql
CREATE TABLE volunteer_feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL,
  request_id UUID NOT NULL,
  given_by_user_id UUID NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_response FOREIGN KEY (response_id) 
    REFERENCES hall_request_updates(update_id) ON DELETE CASCADE,
  CONSTRAINT fk_request FOREIGN KEY (request_id) 
    REFERENCES hall_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_given_by FOREIGN KEY (given_by_user_id) 
    REFERENCES users(user_id) ON DELETE NO ACTION,
  CONSTRAINT unique_feedback UNIQUE (response_id, given_by_user_id)
);

CREATE INDEX idx_volunteer_feedback_request_id ON volunteer_feedback(request_id);
CREATE INDEX idx_volunteer_feedback_given_by ON volunteer_feedback(given_by_user_id);
CREATE INDEX idx_volunteer_feedback_created_at ON volunteer_feedback(created_at);
```

**Prisma Schema:**
```prisma
model volunteer_feedback {
  feedback_id      String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  response_id      String              @db.Uuid
  request_id       String              @db.Uuid
  given_by_user_id String              @db.Uuid
  stars            Int                 // 1 to 5 stars
  comment          String?             @db.VarChar(300)
  created_at       DateTime?           @default(now()) @db.Timestamp(6)
  
  // Relations
  response         hall_request_updates @relation(fields: [response_id], references: [update_id], onDelete: Cascade)
  request          hall_requests       @relation(fields: [request_id], references: [request_id], onDelete: Cascade)
  given_by         users               @relation("feedback_giver", fields: [given_by_user_id], references: [user_id])
  volunteer_score  volunteer_scores    @relation("feedback_for_volunteer", fields: [given_by_user_id], references: [volunteer_id])
  
  @@unique([response_id, given_by_user_id])
  @@index([request_id])
  @@index([given_by_user_id])
  @@index([created_at])
}
```

### 2. volunteer_scores Model - Enhanced

The existing `volunteer_scores` table is enhanced with new fields for the feedback system.

**New Fields Added:**
- `total_responses` INT - Number of hall request responses submitted
- `total_feedback_received` INT - Count of feedback submissions received
- `average_feedback_rating` DECIMAL(3, 2) - Average star rating from feedback
- `total_points` INT - Total gamification points earned
- `level` INT - Current volunteer level (1-5)

**Migration SQL:**
```sql
ALTER TABLE volunteer_scores 
ADD COLUMN total_responses INT DEFAULT 0,
ADD COLUMN total_feedback_received INT DEFAULT 0,
ADD COLUMN average_feedback_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN total_points INT DEFAULT 0,
ADD COLUMN level INT DEFAULT 1;

-- Create index for level lookups
CREATE INDEX idx_volunteer_scores_level ON volunteer_scores(level);
CREATE INDEX idx_volunteer_scores_total_points ON volunteer_scores(total_points);
```

**Updated Prisma Schema:**
```prisma
model volunteer_scores {
  score_id                    Int                      @id @default(autoincrement())
  volunteer_id                String                   @unique @db.Uuid
  total_updates               Int?                     @default(0)
  total_reviews               Int?                     @default(0)
  average_rating              Decimal?                 @default(0) @db.Decimal(4, 2)
  accurate_count              Int?                     @default(0)
  inaccurate_count            Int?                     @default(0)
  score                       Decimal?                 @default(0) @db.Decimal(6, 2)
  total_responses             Int?                     @default(0)
  total_feedback_received     Int?                     @default(0)
  average_feedback_rating     Decimal?                 @default(0) @db.Decimal(3, 2)
  total_points                Int?                     @default(0)
  level                       Int?                     @default(1)
  updated_at                  DateTime?                @default(now()) @db.Timestamp(6)
  users                       users                    @relation(fields: [volunteer_id], references: [user_id])
  volunteer_feedback_received volunteer_feedback[]     @relation("feedback_for_volunteer")
}
```

## Updated Relations

### hall_request_updates

Added relation to `volunteer_feedback`:

```prisma
model hall_request_updates {
  // ... existing fields ...
  feedback           volunteer_feedback[]
  
  @@index([request_id])
  @@index([responder_id])
  @@index([created_at])
}
```

### hall_requests

Added relation to `volunteer_feedback`:

```prisma
model hall_requests {
  // ... existing fields ...
  feedback             volunteer_feedback[]
  
  @@index([requester_id])
  @@index([hall_id])
  @@index([request_status])
  @@index([created_at])
}
```

### users

Added relation to `volunteer_feedback`:

```prisma
model users {
  // ... existing fields ...
  volunteer_feedback_given volunteer_feedback[] @relation("feedback_giver")
}
```

## Setup Instructions

### Option 1: Using Prisma Migrations (Recommended)

1. **Update your Prisma schema** (`prisma/schema.prisma`):
   - Add the `volunteer_feedback` model
   - Update `volunteer_scores` model with new fields
   - Add relations to `hall_request_updates`, `hall_requests`, and `users`

2. **Create and apply migration**:
   ```bash
   cd studyNest
   
   # Create migration
   npx prisma migrate dev --name add_volunteer_feedback
   
   # This will:
   # - Create the migration SQL file
   # - Apply the migration to your database
   # - Regenerate Prisma Client
   ```

3. **Verify migration** was successful:
   ```bash
   # List all migrations
   npx prisma migrate status
   ```

### Option 2: Manual SQL Migration

If you prefer to manage migrations manually:

1. **Create migration file** (`prisma/migrations/[timestamp]_add_volunteer_feedback/migration.sql`):
   ```sql
   -- CreateTable volunteer_feedback
   CREATE TABLE "volunteer_feedback" (
     "feedback_id" UUID NOT NULL DEFAULT gen_random_uuid(),
     "response_id" UUID NOT NULL,
     "request_id" UUID NOT NULL,
     "given_by_user_id" UUID NOT NULL,
     "stars" INTEGER NOT NULL,
     "comment" VARCHAR(300),
     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
     
     CONSTRAINT "volunteer_feedback_pkey" PRIMARY KEY ("feedback_id"),
     CONSTRAINT "fk_response" FOREIGN KEY ("response_id") 
       REFERENCES "hall_request_updates"("update_id") ON DELETE CASCADE,
     CONSTRAINT "fk_request" FOREIGN KEY ("request_id") 
       REFERENCES "hall_requests"("request_id") ON DELETE CASCADE,
     CONSTRAINT "fk_given_by" FOREIGN KEY ("given_by_user_id") 
       REFERENCES "users"("user_id") ON DELETE NO ACTION,
     CONSTRAINT "volunteer_feedback_response_id_given_by_user_id_key" 
       UNIQUE ("response_id", "given_by_user_id")
   );

   -- CreateIndex
   CREATE INDEX "volunteer_feedback_request_id_idx" 
     ON "volunteer_feedback"("request_id");
   CREATE INDEX "volunteer_feedback_given_by_user_id_idx" 
     ON "volunteer_feedback"("given_by_user_id");
   CREATE INDEX "volunteer_feedback_created_at_idx" 
     ON "volunteer_feedback"("created_at");

   -- AlterTable volunteer_scores
   ALTER TABLE "volunteer_scores" 
   ADD COLUMN "total_responses" INTEGER DEFAULT 0,
   ADD COLUMN "total_feedback_received" INTEGER DEFAULT 0,
   ADD COLUMN "average_feedback_rating" DECIMAL(3,2) DEFAULT 0,
   ADD COLUMN "total_points" INTEGER DEFAULT 0,
   ADD COLUMN "level" INTEGER DEFAULT 1;

   CREATE INDEX "volunteer_scores_level_idx" ON "volunteer_scores"("level");
   CREATE INDEX "volunteer_scores_total_points_idx" ON "volunteer_scores"("total_points");
   ```

2. **Apply migration**:
   ```bash
   # Apply using Prisma
   npx prisma migrate deploy
   
   # OR apply directly to database
   psql -U postgres -d studynest_db -f migration.sql
   ```

3. **Update Prisma schema** in your repository

4. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Data Initialization

After applying the migration, initialize `volunteer_scores` for existing volunteers:

```typescript
// scripts/init-volunteer-scores.ts
import { prisma } from "@/lib/prisma";

async function initVolunteerScores() {
  const volunteers = await prisma.users.findMany({
    where: { role: "volunteer" },
    select: { user_id: true },
  });

  for (const volunteer of volunteers) {
    const existing = await prisma.volunteer_scores.findUnique({
      where: { volunteer_id: volunteer.user_id },
    });

    if (!existing) {
      await prisma.volunteer_scores.create({
        data: {
          volunteer_id: volunteer.user_id,
          total_responses: 0,
          total_feedback_received: 0,
          average_feedback_rating: 0,
          total_points: 0,
          level: 1,
        },
      });
    }
  }

  console.log("✓ Volunteer scores initialized");
}

initVolunteerScores();
```

Run initialization:
```bash
npx tsx scripts/init-volunteer-scores.ts
```

## Data Seeding (Optional)

If you want to test with sample data:

```typescript
// scripts/seed-volunteer-feedback.ts
import { prisma } from "@/lib/prisma";

async function seedFeedback() {
  // Get first volunteer and request
  const volunteer = await prisma.users.findFirst({
    where: { role: "volunteer" },
  });

  const request = await prisma.hall_requests.findFirst({
    include: { hall_request_updates: true },
  });

  if (!volunteer || !request || !request.hall_request_updates[0]) {
    console.log("Not enough data to seed");
    return;
  }

  const response = request.hall_request_updates[0];

  // Create sample feedback
  await prisma.volunteer_feedback.create({
    data: {
      response_id: response.update_id,
      request_id: request.request_id,
      given_by_user_id: request.requester_id,
      stars: 5,
      comment: "Great response, very helpful!",
    },
  });

  console.log("✓ Sample feedback created");
}

seedFeedback();
```

## Verification Checklist

After migration:

- [ ] `volunteer_feedback` table exists with correct schema
- [ ] `volunteer_scores` table has new columns (`total_responses`, `total_points`, `level`, etc.)
- [ ] Foreign key constraints are in place
- [ ] Unique constraint on `(response_id, given_by_user_id)` exists
- [ ] Indexes are created for performance
- [ ] Prisma Client regenerated successfully
- [ ] No migration errors in logs

## Rollback Instructions

If needed to rollback:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back

# Or reset entire database (development only!)
npx prisma migrate reset
```

## Performance Considerations

### Indexes Created:
1. `volunteer_feedback_request_id_idx` - For filtering by request
2. `volunteer_feedback_given_by_user_id_idx` - For filtering by user
3. `volunteer_feedback_created_at_idx` - For time-based queries
4. `volunteer_scores_level_idx` - For filtering by level
5. `volunteer_scores_total_points_idx` - For sorting by points

### Query Optimization:
- Unique constraint on `(response_id, given_by_user_id)` ensures no duplicates
- Cascade delete on `response_id` and `request_id` maintains referential integrity
- NO ACTION on `given_by_user_id` prevents accidental deletion

## Testing Migration

```sql
-- Test volunteer_feedback table
SELECT * FROM volunteer_feedback LIMIT 5;

-- Test constraints
-- This should fail (duplicate)
INSERT INTO volunteer_feedback (response_id, given_by_user_id, stars)
VALUES ('same-response', 'same-user', 5);

-- Test volunteer_scores fields
SELECT volunteer_id, total_points, level FROM volunteer_scores LIMIT 5;
```

## Troubleshooting

**Issue:** Foreign key constraint error during migration
- Solution: Ensure `hall_request_updates`, `hall_requests`, and `users` tables exist and are up to date

**Issue:** Unique constraint already exists error
- Solution: Drop existing constraint before recreating

**Issue:** Prisma Client out of sync
- Solution: Run `npx prisma generate`

**Issue:** Migration conflicts
- Solution: Review `/prisma/migrations/` directory and resolve conflicts manually


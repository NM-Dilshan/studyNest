# Admin Complaint Management Module - Implementation Guide

## Overview
A complete admin panel module for managing student complaints about lecture halls with automatic priority calculation based on complaint volume.

## 📁 File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── complaints/
│   │   │   └── page.tsx              # Main complaints management UI
│   │   └── components/
│   │       └── ComplaintsDashboard.tsx  # Dashboard widget
│   └── api/
│       └── admin/
│           └── complaints/
│               ├── route.ts           # GET all complaints
│               ├── [id]/
│               │   └── route.ts       # PUT update status
│               └── summary/
│                   └── route.ts       # GET hall summary with priorities
```

## 🎯 Features Implemented

### 1. Admin Complaints Page (`/admin/complaints`)
- **Two-Tab Interface:**
  - **Complaints Tab:** View all complaints with filtering and status updates
  - **Summary Tab:** Hall-wise priority breakdown with visual indicators

- **Search & Filter:**
  - Real-time search by ID, category, student name, hall name
  - Filter by status (Pending, Viewed, In Progress, Resolved)
  - Filter by lecture hall

- **Complaint Display:**
  - Complaint ID and Category
  - Student Name/ID
  - Lecture Hall Name
  - Description
  - Date and Time
  - Current Status
  - Automatic Priority Level

- **Status Management:**
  - Dropdown to update complaint status
  - Status options: Pending, Viewed, In Progress, Resolved
  - Real-time UI update on status change

### 2. Priority Calculation (Automatic)
```
Complaint Count → Priority Level
├─ > 10 complaints  → 🚨 High (Immediately Fix)
├─ > 6 complaints   → ⚠️ Medium (Monitor)
└─ 3-6 complaints   → ✓ Normal
```

### 3. Hall Summary Dashboard
- **Three Priority Sections:**
  - 🚨 **High Priority:** Halls with >10 complaints
  - ⚠️ **Medium Priority:** Halls with 6-10 complaints
  - ✓ **Normal Priority:** Halls with ≤6 complaints

- **Summary Table:**
  - Hall Name
  - Complaint Count
  - Priority Level
  - Status (Urgent, Monitor, Normal)
  - Sorted by highest complaint count

### 4. Dashboard Widget (`ComplaintsDashboard`)
- Quick overview stats (Total halls, halls with complaints, priority counts)
- High-priority alert notification
- Top 6 halls by complaint volume
- Link to full complaints module

## 📊 API Endpoints

### 1. Get All Complaints
```
GET /api/admin/complaints

Response:
{
  success: true,
  data: [
    {
      complaint_id: 1,
      student_id: "uuid",
      hall_id: "uuid",
      issue_category: "Noise",
      description: "...",
      status: "Pending",
      created_at: "2024-03-24T10:00:00Z",
      complaint_count: 5,
      users: { name: "John Doe" },
      lecture_halls: { hall_name: "A101" }
    },
    ...
  ]
}
```

### 2. Update Complaint Status
```
PUT /api/admin/complaints/[id]

Request Body:
{
  status: "Viewed" | "In Progress" | "Resolved"
}

Response:
{
  success: true,
  data: { ...updated complaint },
  message: "Complaint status updated to Viewed"
}
```

### 3. Get Hall Summary with Priorities
```
GET /api/admin/complaints/summary

Response:
{
  success: true,
  data: [
    {
      hall_id: "uuid",
      hall_name: "A101",
      complaint_count: 4,
      priority: "Normal"
    },
    ...
  ],
  stats: {
    totalHalls: 50,
    hallsWithComplaints: 12,
    highPriorityHalls: 2,
    mediumPriorityHalls: 3,
    normalPriorityHalls: 7
  }
}
```

## 🎨 UI Components & Styling

### Color Coding System
- **Status Colors:**
  - Yellow: Pending
  - Blue: Viewed
  - Orange: In Progress
  - Green: Resolved

- **Priority Colors:**
  - Red: High Priority
  - Orange: Medium Priority
  - Green: Normal Priority

### Interactive Elements
- Search bar with icon
- Dropdown filters
- Status update select
- Priority badges
- Hall summary cards with visual indicators
- Responsive grid layout

## 🔐 Authentication & Authorization
- Admin check on page load
- Redirects non-admin users to home page
- Session validation via localStorage

## 📱 Responsive Design
- Mobile-friendly layout (1 column on mobile, 2-3 columns on tablet/desktop)
- Collapsible sections on smaller screens
- Touch-friendly buttons and inputs

## 🚀 Usage

1. **Access Admin Complaints:**
   - Navigate to `/admin/complaints`
   - Must be logged in as admin or volunteer

2. **View Complaints:**
   - All complaints appear in the list
   - Each complaint shows full details
   - Sort by newest first

3. **Search & Filter:**
   - Type in search box to filter
   - Use status dropdown for status filtering
   - Use hall dropdown for location filtering

4. **Update Status:**
   - Click status dropdown on any complaint
   - Select new status
   - Changes update immediately

5. **View Summary:**
   - Click "Hall Summary" tab
   - See priority breakdown by hall
   - Identify urgent halls at a glance

## 🔄 Real-time Updates
- Status changes reflect immediately in the UI
- Complaint counts are calculated on each API call
- No page refresh needed for updates

## 📈 Performance Optimizations
- Parallel API calls for complaints and summary data
- Efficient filtering on client-side
- Complaint count calculation integrated with fetch
- Minimal database queries

## 🎯 Next Steps (Optional Enhancements)
1. Export complaints to CSV/PDF
2. Auto-notification when new high-priority complaint comes in
3. Admin response notes/comments field
4. Historical tracking of status changes
5. Analytics and trends charts

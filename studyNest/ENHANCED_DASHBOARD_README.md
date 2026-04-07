# Enhanced Admin Dashboard - Campus Complaint Management System

## 🎯 Overview

A professional, feature-rich admin dashboard built with Next.js, React, and Recharts. Provides comprehensive insights into campus complaint management with real-time analytics, visual heatmaps, and smart metrics.

## 📁 Project Structure

```
src/
├── app/
│   └── admin/
│       └── dashboard-enhanced/
│           └── page.tsx                 # Main dashboard page
├── components/
│   └── dashboard/
│       ├── DashboardCard.tsx            # Reusable card wrapper
│       ├── StatCard.tsx                 # Stat display card
│       ├── ComplaintHeatmap.tsx         # Hall/location heatmap with intensity
│       ├── ActivityTimeline.tsx         # Recent activity timeline
│       ├── ResponseTimeAnalytics.tsx    # Response time metrics
│       ├── ComplaintTrendChart.tsx      # Trend chart with bar graphs
│       ├── TopIssueCategories.tsx       # Pie chart of issue types
│       └── UrgentComplaintsWidget.tsx   # High-priority complaints widget
├── lib/
│   └── mockDashboardData.ts             # Mock data for all features
├── types/
│   └── dashboard.ts                     # TypeScript interfaces
```

## 🎨 Features

### 1. **Complaint Heatmap**
- Visual representation of complaint intensity by hall/location
- Color-coded indicators:
  - 🟢 Green = Low complaints (healthy)
  - 🟡 Yellow = Medium complaints (attention needed)
  - 🔴 Red = High complaints (urgent)
- Shows unresolved complaint count per location
- Health score progress bars (0-100%)

### 2. **Recent Activity Timeline**
- Chronological display of latest actions
- Event types:
  - Complaint submitted (blue, plus icon)
  - Complaint viewed (purple, eye icon)
  - In progress (amber, clock icon)
  - Resolved (green, checkmark icon)
- Time formatting (minutes, hours, days ago)
- Complaint ID and location metadata

### 3. **Hall Health Score**
- Individual score (0-100%) for each hall
- Based on:
  - Total complaint count
  - Unresolved complaint ratio
- Visual progress indicators
- Color-coded (green/yellow/red)

### 4. **Response Time Analytics**
- Average time to view complaints (hours)
- Average time to start work (hours)
- Average time to resolve (hours)
- Overall resolution rate (%)
- Key insights and recommendations

### 5. **Complaint Trend Chart**
- Bar chart showing daily complaint submissions
- Two metrics:
  - Total submitted (blue bars)
  - Resolved (green bars)
- Weekly overview
- Calculated statistics:
  - Total for week
  - Average per day
  - Resolution rate percentage

### 6. **Top Issue Categories**
- Pie chart visualization
- Bar chart with percentages
- Most common complaint types
- Color-coded categories
- Percentage breakdown
- Total complaint count

### 7. **Urgent Complaints Widget**
- High-priority and critical complaints
- Priority badges (orange/red)
- Quick action buttons
- Time-since-submission
- Location display
- "View All" action button

### 8. **Dashboard Statistics**
- Total complaints count
- Pending complaints
- Resolved complaints
- Average health score
- Trend indicators (up/down)

## 🛠️ Technical Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Charts**: Recharts
- **Icons**: lucide-react
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State**: React hooks

## 📊 Mock Data Structure

### ComplaintLocation
```typescript
{
  hallId: string              // e.g., "G0202"
  hallName: string            // Full location name
  complaintCount: number      // Total complaints
  intensity: 'low' | 'medium' | 'high'
  healthScore: number         // 0-100%
  unresolvedCount: number     // Pending items
}
```

### ActivityEvent
```typescript
{
  id: string
  type: 'submitted' | 'viewed' | 'in_progress' | 'resolved'
  description: string
  timestamp: Date
  complaintId: number
  location: string
}
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install recharts lucide-react
```

### 2. Navigate to Dashboard

```
http://localhost:3000/admin/dashboard-enhanced
```

### 3. Customize Mock Data

Edit `src/lib/mockDashboardData.ts` with your real data structure:

```typescript
// Replace with real API calls
const mockComplaintLocations = await fetch('/api/halls/complaints').then(r => r.json())
```

## 🔌 Integration with Real Data

### Option 1: API Fetching
```typescript
'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(r => r.json())
      .then(setData)
  }, [])

  return <ComplaintHeatmap locations={data?.locations} />
}
```

### Option 2: Server Components
```typescript
// src/app/admin/dashboard/page.tsx
import { getDashboardData } from '@/lib/dashboardService'

export default async function Dashboard() {
  const data = await getDashboardData()
  return <DashboardPage data={data} />
}
```

## 🎨 Customization

### Update Colors
Edit `src/components/dashboard/ComplaintHeatmap.tsx`:
```typescript
const getIntensityColor = (intensity) => {
  switch (intensity) {
    case 'low': return 'bg-green-100'  // Change color here
    // ...
  }
}
```

### Modify Chart Data
Edit `src/lib/mockDashboardData.ts` to adjust:
- Time ranges
- Category names
- Intensity thresholds
- Health score calculations

### Add New Components
1. Create new component in `src/components/dashboard/`
2. Wrap with `DashboardCard`
3. Add to main dashboard grid
4. Create corresponding mock data

## 📱 Responsive Design

- **Mobile**: 1 column layout
- **Tablet**: 2 column layout
- **Desktop**: 3 column layout
- Fully responsive Recharts
- Touch-friendly interactions

## 🔄 Auto-Refresh

Add to main dashboard page:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh data
  }, 60000) // 60 seconds

  return () => clearInterval(interval)
}, [])
```

## 📈 Performance Tips

1. **Memoize Data**: Use `useMemo()` for heavy calculations
2. **Lazy Load Charts**: Only render visible components
3. **Pagination**: For large timelines, implement pagination
4. **Caching**: Cache API responses with React Query
5. **Optimization**: Use `React.memo()` for large lists

## 🧪 Testing

Mock data is designed for realistic testing:
- Various complaint intensities
- Realistic timestamps
- Varied category distributions
- Critical priority items

## 📝 Adding Real Data

Steps to connect real database:

1. Create API endpoints:
   ```
   GET /api/admin/complaints/heatmap
   GET /api/admin/complaints/timeline
   GET /api/admin/complaints/metrics
   GET /api/admin/complaints/trends
   GET /api/admin/complaints/categories
   GET /api/admin/complaints/urgent
   ```

2. Update dashboard page to fetch from APIs

3. Replace mock data imports with real API calls

4. Add error handling and loading states

## 🎯 Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Export to PDF/Excel
- [ ] Custom date range filtering
- [ ] Drill-down detailed views
- [ ] Comparative analytics
- [ ] Email alerts for urgent items
- [ ] Role-based dashboard views
- [ ] Dark mode support

## 💡 Tips for Final Year Project

✅ **Strengths**:
- Professional UI/UX design
- Multiple data visualizations
- Responsive layout
- Type-safe with TypeScript
- Well-organized component structure
- Comprehensive mock data

✅ **For Presentation**:
- Highlight smart features (heatmap, health scores)
- Show real-time capabilities
- Demonstrate filtering/drilling
- Explain analytics insights
- Show responsive design

## 📞 Support

For customization or integration help:
1. Check component props in `.tsx` files
2. Review mock data structure in `types/dashboard.ts`
3. Examine Recharts documentation
4. Modify styles in Tailwind classes

---

**Created for**: Campus Complaint Management System  
**Student Project**: Final Year University Project  
**Version**: 1.0.0  
**License**: MIT

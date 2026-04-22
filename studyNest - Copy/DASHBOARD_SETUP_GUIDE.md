# Enhanced Dashboard Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Recharts
```bash
npm install recharts
# or
yarn add recharts
```

### Step 2: Access Dashboard
Navigate to:
```
http://localhost:3000/admin/dashboard-enhanced
```

## File Organization

```
📦 Dashboard System
│
├── 📁 Components (Reusable UI)
│   └── dashboard/
│       ├── DashboardCard.tsx         [Card wrapper]
│       ├── StatCard.tsx              [Stat display]
│       ├── ComplaintHeatmap.tsx      [Heatmap visualization]
│       ├── ActivityTimeline.tsx      [Timeline view]
│       ├── ResponseTimeAnalytics.tsx [Response metrics]
│       ├── ComplaintTrendChart.tsx   [Trend chart]
│       ├── TopIssueCategories.tsx    [Category pie chart]
│       └── UrgentComplaintsWidget.tsx [Urgent items]
│
├── 📁 Data & Types
│   ├── types/dashboard.ts            [TypeScript interfaces]
│   └── lib/mockDashboardData.ts      [Mock data]
│
└── 📄 Dashboard Page
    └── app/admin/dashboard-enhanced/page.tsx
```

## Component Usage Examples

### Using StatCard
```typescript
import StatCard from '@/components/dashboard/StatCard'
import { Ticket } from 'lucide-react'

<StatCard
  label="Total Complaints"
  value={122}
  icon={<Ticket size={24} />}
  color="blue"
  trend={{ value: 12, isPositive: false }}
/>
```

### Using DashboardCard
```typescript
import DashboardCard from '@/components/dashboard/DashboardCard'

<DashboardCard
  title="Feature Name"
  description="Brief description"
  headerAction={<button>Action</button>}
>
  {/* Content here */}
</DashboardCard>
```

### Using ComplaintHeatmap
```typescript
import ComplaintHeatmap from '@/components/dashboard/ComplaintHeatmap'
import { mockComplaintLocations } from '@/lib/mockDashboardData'

<ComplaintHeatmap locations={mockComplaintLocations} />
```

## Data Flow

```
mockDashboardData.ts
    ↓
    ├→ ComplaintHeatmap.tsx
    ├→ ActivityTimeline.tsx
    ├→ ResponseTimeAnalytics.tsx
    ├→ ComplaintTrendChart.tsx
    ├→ TopIssueCategories.tsx
    ├→ UrgentComplaintsWidget.tsx
    ↓
dashboard/page.tsx (Main layout)
```

## Customizing Mock Data

### Edit Heatmap Data
File: `src/lib/mockDashboardData.ts`

```typescript
export const mockComplaintLocations: ComplaintLocation[] = [
  {
    hallId: 'G0202',
    hallName: 'Your Hall Name',
    complaintCount: 24,        // Change number
    intensity: 'high',         // low | medium | high
    healthScore: 35,           // 0-100
    unresolvedCount: 8,
  },
  // Add more locations...
]
```

### Add New Activity Event
```typescript
export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'event-1',
    type: 'submitted',           // submitted | viewed | in_progress | resolved
    description: 'Your message',
    timestamp: new Date(),
    complaintId: 5250,
    location: 'G0202',
  },
  // ...
]
```

## Styling Customization

### Change Card Colors
Edit component files to modify Tailwind classes:

```typescript
// From:
<div className="bg-white rounded-xl shadow-sm border border-gray-100">

// To:
<div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200">
```

### Available Color Schemes
- **White**: `bg-white border-gray-100`
- **Blue**: `bg-blue-50 border-blue-200`
- **Green**: `bg-green-50 border-green-200`
- **Red**: `bg-red-50 border-red-200`
- **Purple**: `bg-purple-50 border-purple-200`

## Connecting Real Data

### Method 1: Replace Mock Data in Component

```typescript
'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [locations, setLocations] = useState([])
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/admin/complaints/heatmap')
      const data = await response.json()
      setLocations(data)
    }
    fetchData()
  }, [])

  return <ComplaintHeatmap locations={locations} />
}
```

### Method 2: Create Data Fetching Hook

```typescript
// src/hooks/useDashboardData.ts
import { useEffect, useState } from 'react'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
```

## Required API Endpoints

For full integration, create these endpoints:

```
┌─ GET /api/admin/complaints/heatmap
│  Returns: ComplaintLocation[]
│  
├─ GET /api/admin/complaints/timeline
│  Returns: ActivityEvent[]
│  
├─ GET /api/admin/complaints/metrics
│  Returns: ResponseTimeMetric[]
│  
├─ GET /api/admin/complaints/trends
│  Returns: ComplaintTrend[]
│  
├─ GET /api/admin/complaints/categories
│  Returns: IssueCategory[]
│  
├─ GET /api/admin/complaints/urgent
│  Returns: UrgentComplaint[]
│  
└─ GET /api/admin/complaints/stats
   Returns: DashboardStats
```

## Performance Optimization

### Use useMemo for Heavy Calculations
```typescript
const sortedLocations = useMemo(
  () => [...locations].sort((a, b) => b.complaintCount - a.complaintCount),
  [locations]
)
```

### Lazy Load Components
```typescript
import dynamic from 'next/dynamic'

const ComplaintHeatmap = dynamic(
  () => import('@/components/dashboard/ComplaintHeatmap'),
  { loading: () => <div>Loading...</div> }
)
```

### Cache API Responses
```typescript
// With React Query
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => fetch('/api/admin/dashboard').then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

## Adding Loading States

```typescript
// Skeleton loader component
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded mt-4"></div>
    </div>
  )
}

// Usage
{loading ? <CardSkeleton /> : <ComplaintHeatmap locations={locations} />}
```

## Auto-Refresh Dashboard

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh data
    fetchDashboardData()
  }, 30000) // Every 30 seconds

  return () => clearInterval(interval)
}, [])
```

## Export/Print Functionality

```typescript
const handleExport = () => {
  const element = document.getElementById('dashboard')
  const opt = {
    margin: 10,
    filename: 'dashboard.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' }
  }
  html2pdf().set(opt).save()
}
```

## Troubleshooting

### Chart Not Rendering
- Ensure Recharts is installed: `npm install recharts`
- Check data format matches interfaces
- Verify ResponsiveContainer parent has height

### Time Formatting Issues
- Check timezone settings
- Verify Date objects are valid
- Use `new Date()` constructor

### Layout Breaks on Mobile
- Check Tailwind responsive classes
- Test with device DevTools
- Ensure grid is responsive

## Next Steps

1. ✅ Dashboard displays with mock data
2. configure API endpoints
3. Replace mock data with real data
4. Add authentication checks
5. Implement error boundaries
6. Add loading/error states
7. Deploy to production

## File Checklist

- [x] `src/types/dashboard.ts` - Type definitions
- [x] `src/lib/mockDashboardData.ts` - Mock data
- [x] `src/components/dashboard/DashboardCard.tsx`
- [x] `src/components/dashboard/StatCard.tsx`
- [x] `src/components/dashboard/ComplaintHeatmap.tsx`
- [x] `src/components/dashboard/ActivityTimeline.tsx`
- [x] `src/components/dashboard/ResponseTimeAnalytics.tsx`
- [x] `src/components/dashboard/ComplaintTrendChart.tsx`
- [x] `src/components/dashboard/TopIssueCategories.tsx`
- [x] `src/components/dashboard/UrgentComplaintsWidget.tsx`
- [x] `src/app/admin/dashboard-enhanced/page.tsx` - Main page

## Links

- Recharts Docs: https://recharts.org/
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/
- lucide-react: https://lucide.dev/

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Ready for Integration

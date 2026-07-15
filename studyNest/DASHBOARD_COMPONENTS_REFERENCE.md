# Dashboard Components Reference

## Component Inventory

### 🎨 Base Components (Reusable)

#### DashboardCard
**Purpose**: Wrapper for all dashboard sections  
**Location**: `src/components/dashboard/DashboardCard.tsx`

```typescript
<DashboardCard
  title="Card Title"
  description="Optional description"
  headerAction={<button>Action</button>}
  className="custom-class"
>
  {/* Content */}
</DashboardCard>
```

**Props**:
- `title` (string, optional) - Card heading
- `description` (string, optional) - Subtitle
- `children` (ReactNode) - Main content
- `className` (string, optional) - Additional Tailwind classes
- `headerAction` (ReactNode, optional) - Top-right action button

---

#### StatCard
**Purpose**: Display key metrics with trends  
**Location**: `src/components/dashboard/StatCard.tsx`

```typescript
<StatCard
  label="Total Complaints"
  value={122}
  icon={<Ticket size={24} />}
  color="blue"
  trend={{ value: 12, isPositive: false }}
/>
```

**Props**:
- `label` (string) - Metric name
- `value` (string | number) - The metric value
- `icon` (ReactNode, optional) - Icon component
- `trend` (object, optional) - `{ value: number, isPositive: boolean }`
- `color` ('blue'|'green'|'red'|'amber'|'purple') - Icon background color

---

### 📊 Feature Components

#### ComplaintHeatmap
**Purpose**: Visualize complaint intensity by location  
**Location**: `src/components/dashboard/ComplaintHeatmap.tsx`

```typescript
<ComplaintHeatmap locations={mockComplaintLocations} />
```

**Props**:
- `locations` (ComplaintLocation[]) - Array of hall data

**Data Structure**:
```typescript
interface ComplaintLocation {
  hallId: string           // "G0202"
  hallName: string         // "Ground Floor - Block G"
  complaintCount: number   // 24
  intensity: 'low'|'medium'|'high'
  healthScore: number      // 0-100
  unresolvedCount: number  // 8
}
```

**Features**:
- Color-coded intensity badges
- Health score progress bars
- Sorted by complaint count
- Legend showing color meanings

---

#### ActivityTimeline
**Purpose**: Show recent actions in chronological order  
**Location**: `src/components/dashboard/ActivityTimeline.tsx`

```typescript
<ActivityTimeline events={mockActivityEvents} />
```

**Props**:
- `events` (ActivityEvent[]) - Array of activity events

**Data Structure**:
```typescript
interface ActivityEvent {
  id: string
  type: 'submitted'|'viewed'|'in_progress'|'resolved'
  description: string
  timestamp: Date
  complaintId: number
  location: string
}
```

**Event Icons**:
- 📝 Submitted = Blue Plus
- 👁️ Viewed = Purple Eye
- ⏱️ In Progress = Amber Clock
- ✅ Resolved = Green CheckCircle

---

#### ResponseTimeAnalytics
**Purpose**: Display KPIs for response efficiency  
**Location**: `src/components/dashboard/ResponseTimeAnalytics.tsx`

```typescript
<ResponseTimeAnalytics metrics={mockResponseTimeMetrics} />
```

**Props**:
- `metrics` (ResponseTimeMetric[]) - Array of metrics

**Data Structure**:
```typescript
interface ResponseTimeMetric {
  metricName: string    // "Avg Time to View"
  averageTime: number   // 2.5
  unit: string          // "hours" or "%"
}
```

**Default Metrics**:
1. Avg Time to View (hours)
2. Avg Time to Start Work (hours)
3. Avg Time to Resolve (hours)
4. Avg Resolution Rate (%)

---

#### ComplaintTrendChart
**Purpose**: Bar chart showing complaint trends over time  
**Location**: `src/components/dashboard/ComplaintTrendChart.tsx`

```typescript
<ComplaintTrendChart trends={mockComplaintTrends} />
```

**Props**:
- `trends` (ComplaintTrend[]) - Array of daily trend data

**Data Structure**:
```typescript
interface ComplaintTrend {
  date: string     // "Mon", "Tue", etc.
  count: number    // Total submitted
  resolved: number // Total resolved
}
```

**Visualization**:
- Blue bars = Total submitted
- Green bars = Resolved
- Shows weekly overview
- Calculates resolution rate

---

#### TopIssueCategories
**Purpose**: Pie/bar chart of complaint types  
**Location**: `src/components/dashboard/TopIssueCategories.tsx`

```typescript
<TopIssueCategories categories={mockIssueCategories} />
```

**Props**:
- `categories` (IssueCategory[]) - Array of categories

**Data Structure**:
```typescript
interface IssueCategory {
  category: string  // "AC Issues"
  count: number     // 34
  percentage: number // 28
}
```

**Visualization**:
- Pie chart (left side)
- Category list with progress bars (right side)
- 6 color palette

---

#### UrgentComplaintsWidget
**Purpose**: Highlight high-priority complaints  
**Location**: `src/components/dashboard/UrgentComplaintsWidget.tsx`

```typescript
<UrgentComplaintsWidget complaints={mockUrgentComplaints} />
```

**Props**:
- `complaints` (UrgentComplaint[]) - Array of urgent items

**Data Structure**:
```typescript
interface UrgentComplaint {
  id: number
  category: string
  location: string
  priority: 'high'|'critical'
  submittedAt: Date
}
```

**Priority Colors**:
- 🟠 High = Orange
- 🔴 Critical = Red

---

## Layout Grid System

### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│  Header + Quick Stats (4 cards in row)             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┐         │
│ │ Heatmap     │ Timeline    │ Trend Chart │         │
│ │             │             │             │         │
│ │ + Urgent    │ + Response  │ + Categories│         │
│ └─────────────┴─────────────┴─────────────┘         │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┐         │
│ │ Quick       │ Performance │ System      │         │
│ │ Actions     │ Metrics     │ Status      │         │
│ └─────────────┴─────────────┴─────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile** (< 640px): 1 column
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (> 1024px): 3 columns

---

## Color Palette

### Intensity Colors
| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| Low | Green | #10b981 | Healthy status |
| Medium | Yellow | #f59e0b | Needs attention |
| High | Red | #ef4444 | Urgent action |

### UI Colors
| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #3b82f6 |
| Success | Green | #10b981 |
| Warning | Amber | #f59e0b |
| Error | Red | #ef4444 |
| Purple | Purple | #8b5cf6 |

---

## Usage Patterns

### Pattern 1: Display Static Data
```typescript
import { mockComplaintLocations } from '@/lib/mockDashboardData'
import ComplaintHeatmap from '@/components/dashboard/ComplaintHeatmap'

export default function Dashboard() {
  return <ComplaintHeatmap locations={mockComplaintLocations} />
}
```

### Pattern 2: Fetch from API
```typescript
'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }, [])

  return data ? <Dashboard data={data} /> : <Loading />
}
```

### Pattern 3: Combine Multiple Components
```typescript
export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1"><ComplaintHeatmap {...} /></div>
      <div className="col-span-1"><ActivityTimeline {...} /></div>
      <div className="col-span-1"><ComplaintTrendChart {...} /></div>
    </div>
  )
}
```

---

## Styling Quick Reference

### Common Tailwind Classes Used

**Spacing**:
- `p-4, p-6` - Padding
- `gap-4, gap-6` - Grid gaps
- `mt-2, mt-4` - Margin top
- `mb-2, mb-4` - Margin bottom

**Colors**:
- `bg-white, bg-gray-50` - Backgrounds
- `text-gray-900, text-gray-600` - Text colors
- `border-gray-200, border-gray-100` - Borders

**Layout**:
- `grid grid-cols-1 lg:grid-cols-3` - Responsive grid
- `flex items-center justify-between` - Flexbox
- `rounded-lg, rounded-xl` - Border radius

**Sizing**:
- `w-full, w-1/2` - Width
- `h-2, h-8` - Height
- `text-sm, text-lg, text-2xl` - Text sizes

---

## Interactive Features

### 1. Progress Bars
```typescript
<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-green-500 rounded-full" 
    style={{ width: `${percentage}%` }}
  ></div>
</div>
```

### 2. Color Legends
```typescript
<div className="flex gap-4">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-green-500"></div>
    <span>Low</span>
  </div>
  {/* More items */}
</div>
```

### 3. Status Indicators
```typescript
<span className="inline-flex items-center gap-1.5">
  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
  Operational
</span>
```

---

## Performance Tips

| Issue | Solution |
|-------|----------|
| Slow chart rendering | Use `useMemo()` for data |
| Too many re-renders | Memoize components |
| Large lists | Implement pagination |
| API delays | Add loading skeletons |
| Memory leaks | Clear intervals/listeners |

---

## Icon Library

Using `lucide-react`:

```typescript
import {
  Ticket,        // Complaints
  AlertCircle,   // Urgent
  CheckCircle2,  // Resolved
  Clock,         // Time-related
  Eye,           // Viewed
  Plus,          // Add/Submitted
  Zap,           // Performance
  AlertTriangle, // Warning
  ChevronRight,  // Navigation
} from 'lucide-react'
```

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Maintained**: StudyNest Project

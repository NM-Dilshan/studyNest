// Dashboard type definitions

export interface ComplaintLocation {
  hallId: string
  hallName: string
  complaintCount: number
  intensity: 'low' | 'medium' | 'high'
  healthScore: number
  unresolvedCount: number
}

export interface ActivityEvent {
  id: string
  type: 'submitted' | 'viewed' | 'in_progress' | 'resolved'
  description: string
  timestamp: Date
  complaintId: number
  location: string
}

export interface ResponseTimeMetric {
  metricName: string
  averageTime: number // in hours
  unit: string
}

export interface ComplaintTrend {
  date: string
  count: number
  resolved: number
}

export interface IssueCategory {
  category: string
  count: number
  percentage: number
}

export interface UrgentComplaint {
  id: number
  category: string
  location: string
  priority: 'high' | 'critical'
  submittedAt: Date
}

export interface DashboardStats {
  totalComplaints: number
  pendingComplaints: number
  resolvedComplaints: number
  avgResponseTime: number
  healthScoreAverage: number
}

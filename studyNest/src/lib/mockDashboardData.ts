import {
  ComplaintLocation,
  ActivityEvent,
  ResponseTimeMetric,
  ComplaintTrend,
  IssueCategory,
  UrgentComplaint,
  DashboardStats,
} from '@/types/dashboard'

// Mock complaint locations with intensity
export const mockComplaintLocations: ComplaintLocation[] = [
  {
    hallId: 'G0202',
    hallName: 'Ground Floor - Block G',
    complaintCount: 24,
    intensity: 'high',
    healthScore: 35,
    unresolvedCount: 8,
  },
  {
    hallId: 'G0101',
    hallName: 'Ground Floor - Block A',
    complaintCount: 12,
    intensity: 'medium',
    healthScore: 62,
    unresolvedCount: 3,
  },
  {
    hallId: 'F0505',
    hallName: 'First Floor - Block E',
    complaintCount: 5,
    intensity: 'low',
    healthScore: 78,
    unresolvedCount: 1,
  },
  {
    hallId: 'F0202',
    hallName: 'First Floor - Block B',
    complaintCount: 18,
    intensity: 'high',
    healthScore: 42,
    unresolvedCount: 6,
  },
  {
    hallId: 'S0303',
    hallName: 'Second Floor - Block C',
    complaintCount: 8,
    intensity: 'medium',
    healthScore: 68,
    unresolvedCount: 2,
  },
  {
    hallId: 'T0101',
    hallName: 'Third Floor - Block A',
    complaintCount: 3,
    intensity: 'low',
    healthScore: 82,
    unresolvedCount: 0,
  },
]

// Mock activity timeline
export const mockActivityEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'resolved',
    description: 'Complaint #5248 marked as resolved',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    complaintId: 5248,
    location: 'G0202',
  },
  {
    id: '2',
    type: 'in_progress',
    description: 'Complaint #5247 moved to in progress',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    complaintId: 5247,
    location: 'F0505',
  },
  {
    id: '3',
    type: 'viewed',
    description: 'Complaint #5246 marked as viewed',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    complaintId: 5246,
    location: 'G0101',
  },
  {
    id: '4',
    type: 'submitted',
    description: 'New complaint submitted: AC Not Working',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    complaintId: 5245,
    location: 'S0303',
  },
  {
    id: '5',
    type: 'resolved',
    description: 'Complaint #5244 marked as resolved',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    complaintId: 5244,
    location: 'F0202',
  },
  {
    id: '6',
    type: 'submitted',
    description: 'New complaint submitted: Light Flickering',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    complaintId: 5243,
    location: 'T0101',
  },
  {
    id: '7',
    type: 'in_progress',
    description: 'Complaint #5242 moved to in progress',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    complaintId: 5242,
    location: 'G0202',
  },
]

// Mock response time analytics
export const mockResponseTimeMetrics: ResponseTimeMetric[] = [
  {
    metricName: 'Avg Time to View',
    averageTime: 2.5,
    unit: 'hours',
  },
  {
    metricName: 'Avg Time to Start Work',
    averageTime: 8.3,
    unit: 'hours',
  },
  {
    metricName: 'Avg Time to Resolve',
    averageTime: 48.7,
    unit: 'hours',
  },
  {
    metricName: 'Avg Resolution Rate',
    averageTime: 85,
    unit: '%',
  },
]

// Mock complaint trend data
export const mockComplaintTrends: ComplaintTrend[] = [
  { date: 'Mon', count: 12, resolved: 8 },
  { date: 'Tue', count: 19, resolved: 14 },
  { date: 'Wed', count: 15, resolved: 11 },
  { date: 'Thu', count: 25, resolved: 18 },
  { date: 'Fri', count: 22, resolved: 19 },
  { date: 'Sat', count: 8, resolved: 7 },
  { date: 'Sun', count: 5, resolved: 5 },
]

// Mock issue categories
export const mockIssueCategories: IssueCategory[] = [
  { category: 'AC Issues', count: 34, percentage: 28 },
  { category: 'Electricity', count: 26, percentage: 21 },
  { category: 'Furniture', count: 19, percentage: 15 },
  { category: 'Cleanliness', count: 23, percentage: 19 },
  { category: 'Water Supply', count: 14, percentage: 11 },
  { category: 'Other', count: 6, percentage: 6 },
]

// Mock urgent complaints
export const mockUrgentComplaints: UrgentComplaint[] = [
  {
    id: 5250,
    category: 'Water Leak',
    location: 'G0202',
    priority: 'critical',
    submittedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 5249,
    category: 'No Electricity',
    location: 'F0202',
    priority: 'high',
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 5248,
    category: 'AC Malfunction',
    location: 'G0101',
    priority: 'high',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalComplaints: 122,
  pendingComplaints: 34,
  resolvedComplaints: 88,
  avgResponseTime: 2.5,
  healthScoreAverage: 61,
}

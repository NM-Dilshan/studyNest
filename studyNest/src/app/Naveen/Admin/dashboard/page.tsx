"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Clock, MapPin, Users, Eye, TrendingUp, Plus } from "lucide-react";

interface ComplaintItem {
  complaint_id: number;
  issue_category: string;
  status: string;
  created_at: string;
  complaint_count?: number;
  lecture_halls?: {
    hall_name: string;
  };
  study_areas?: {
    area_name: string;
  };
}

interface DashboardStats {
  volunteers: {
    total: number;
    activeToday: number;
  };
  activeSpaces: {
    total: number;
    halls: number;
    areas: number;
  };
}

// Data
const lectureHallsData = [
  { name: "Hall A101", usage: 148 },
  { name: "Hall B205", usage: 132 },
  { name: "Hall C301", usage: 118 },
  { name: "Hall D102", usage: 96 },
  { name: "Hall A205", usage: 74 },
];

const studyAreasData = [
  { name: "Main Library", usage: 245 },
  { name: "Science Library", usage: 210 },
  { name: "Student Center", usage: 178 },
  { name: "Engineering Study", usage: 125 },
  { name: "24/7 Study Hall", usage: 110 },
];

const peakHoursData = [
  { hour: "8AM", students: 30 },
  { hour: "9AM", students: 55 },
  { hour: "10AM", students: 100 },
  { hour: "11AM", students: 135 },
  { hour: "12PM", students: 155 },
  { hour: "1PM", students: 165 },
  { hour: "2PM", students: 160 },
  { hour: "3PM", students: 140 },
  { hour: "4PM", students: 110 },
  { hour: "5PM", students: 75 },
];

const weeklyData = [
  { day: "Mon", visits: 300 },
  { day: "Tue", visits: 340 },
  { day: "Wed", visits: 380 },
  { day: "Thu", visits: 410 },
  { day: "Fri", visits: 390 },
  { day: "Sat", visits: 210 },
  { day: "Sun", visits: 180 },
];

// Badges
const PriorityBadge = ({ priority }: { priority: "High" | "Medium" | "Normal" }) => {
  const colors = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Normal: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[priority]}`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = (status || "").toLowerCase();
  const statusColor =
    normalized.includes("resolve")
      ? "bg-green-100 text-green-700 border-green-200"
      : normalized.includes("progress")
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : normalized.includes("view")
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
    >
      {status}
    </span>
  );
};

const getPriorityFromCount = (count: number) => {
  if (count > 10) return "High" as const;
  if (count > 6) return "Medium" as const;
  return "Normal" as const;
};

const getRelativeTime = (timestamp: string) => {
  const ms = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Summary Card
const SummaryCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendPositive = true,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        {trend ? (
          <div
            className={`flex items-center text-xs font-medium mt-2 ${
              trendPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{trend}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">{description}</p>
        )}
      </div>
      <div className="text-[#2E6F95]">{icon}</div>
    </div>
  );
};

// Chart Wrapper
const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    {children}
  </div>
);

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    volunteers: {
      total: 0,
      activeToday: 0,
    },
    activeSpaces: {
      total: 0,
      halls: 0,
      areas: 0,
    },
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setComplaintsLoading(true);
        const response = await fetch("/api/admin/complaints");
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setComplaints(data.data);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        console.error("Error fetching admin complaints:", error);
        setComplaints([]);
      } finally {
        setComplaintsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch("/api/admin/dashboard/stats");
        const data = await response.json();
        if (response.ok && data.success && data.data) {
          setDashboardStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const complaintStats = useMemo(() => {
    const pending = complaints.filter((c) => {
      const value = (c.status || "").toLowerCase();
      return value.includes("pending");
    }).length;

    const viewed = complaints.filter((c) =>
      (c.status || "").toLowerCase().includes("view")
    ).length;

    const inProgress = complaints.filter((c) =>
      (c.status || "").toLowerCase().includes("progress")
    ).length;

    const resolved = complaints.filter((c) =>
      (c.status || "").toLowerCase().includes("resolve")
    ).length;

    return {
      total: complaints.length,
      pending,
      viewed,
      pendingAndViewed: pending + viewed,
      inProgress,
      resolved,
    };
  }, [complaints]);

  const recentComplaints = useMemo(() => complaints.slice(0, 6), [complaints]);

  const complaintStatusChartData = useMemo(
    () => [
      { name: "Pending", value: complaintStats.pending, color: "#9ca3af" },
      { name: "Viewed", value: complaintStats.viewed, color: "#2563eb" },
      { name: "In Progress", value: complaintStats.inProgress, color: "#f59e0b" },
      { name: "Resolved", value: complaintStats.resolved, color: "#16a34a" },
    ],
    [complaintStats]
  );

  return (
    <div className="min-h-screen bg-[#F4F9F8]">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">


        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Complaints"
            value={complaintsLoading ? "..." : complaintStats.total}
            description=""
            icon={<AlertCircle className="w-10 h-10" />}
            trend={complaintsLoading ? undefined : `${complaintStats.resolved} resolved so far`}
            trendPositive={true}
          />
          <SummaryCard
            title="Pending"
            value={complaintsLoading ? "..." : complaintStats.pendingAndViewed}
            description="Requires attention"
            icon={<Clock className="w-10 h-10" />}
          />
          <SummaryCard
            title="Active Spaces"
            value={statsLoading ? "..." : dashboardStats.activeSpaces.total}
            description={
              statsLoading
                ? "Loading active spaces"
                : `${dashboardStats.activeSpaces.halls} halls, ${dashboardStats.activeSpaces.areas} areas`
            }
            icon={<MapPin className="w-10 h-10" />}
          />
          <SummaryCard
            title="Volunteers"
            value={statsLoading ? "..." : dashboardStats.volunteers.total}
            description=""
            icon={<Users className="w-10 h-10" />}
            trend={statsLoading ? undefined : `+${dashboardStats.volunteers.activeToday} active today`}
            trendPositive={true}
          />
        </div>

        {/* Horizontal Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Most Used Lecture Halls" subtitle="This week's statistics">
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={lectureHallsData} margin={{ top: 10, right: 30, left: 90, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 160]} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" width={85} tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                  <Bar dataKey="usage" fill="#7FB89B" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Most Used Study Areas" subtitle="This week's statistics">
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={studyAreasData} margin={{ top: 10, right: 30, left: 120, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 260]} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                  <Bar dataKey="usage" fill="#2E6F95" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
              <p className="text-sm text-gray-500">Latest issues reported by students</p>
            </div>
            <Link href="/admin/complaints" className="text-sm font-semibold text-[#2E6F95] hover:text-[#1f4b66] transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaintsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading complaints...
                    </td>
                  </tr>
                ) : recentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No complaints available
                    </td>
                  </tr>
                ) : (
                  recentComplaints.map((complaint) => (
                  <tr key={complaint.complaint_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name || "Unknown Location"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.issue_category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={getPriorityFromCount(complaint.complaint_count || 0)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRelativeTime(complaint.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href="/admin/complaints" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))) }
              </tbody>
            </table>
          </div>
        </div>

        {/* Complaint Status Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Complaint Status Overview</h2>
            <p className="text-sm text-gray-500">Live status distribution from database complaints</p>
          </div>

          {complaintsLoading ? (
            <p className="text-sm font-medium text-gray-500 py-8">Loading chart data...</p>
          ) : complaintStatusChartData.every((item) => item.value === 0) ? (
            <p className="text-sm font-medium text-gray-500 py-8">No complaint data available for chart</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintStatusChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {complaintStatusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {complaintStatusChartData.map((item) => (
                  <div key={item.name} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.name}</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Bar & Line Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Peak Usage Time" subtitle="Average student count per hour">
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="hour" tick={{ fontSize: 13, fill: "#6b7280" }} stroke="#9ca3af" />
                  <YAxis domain={[0, 180]} tick={{ fontSize: 13, fill: "#6b7280" }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                  <Bar dataKey="students" fill="#4FA3C7" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Weekly Usage Trend" subtitle="Student visits per day">
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 13, fill: "#6b7280" }} stroke="#9ca3af" />
                  <YAxis domain={[0, 500]} tick={{ fontSize: 13, fill: "#6b7280" }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="visits" stroke="#7FB89B" strokeWidth={3} dot={{ fill: "#7FB89B", r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
        </div>
      </div>
    </div>
  );
}
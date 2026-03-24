"use client";

import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Clock, MapPin, Users, Eye, TrendingUp, Plus } from "lucide-react";

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

const complaintsData = [
  {
    id: 1,
    location: "Lecture Hall A101",
    issue: "AC not working",
    priority: "High" as const,
    status: "Pending" as const,
    time: "10 min ago",
  },
  {
    id: 2,
    location: "Main Library",
    issue: "Wi-Fi connectivity",
    priority: "Medium" as const,
    status: "In Progress" as const,
    time: "30 min ago",
  },
  {
    id: 3,
    location: "Study Room 3",
    issue: "Lighting issue",
    priority: "Low" as const,
    status: "Resolved" as const,
    time: "1 hour ago",
  },
];

// Badges
const PriorityBadge = ({ priority }: { priority: "High" | "Medium" | "Low" }) => {
  const colors = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[priority]}`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: "Pending" | "In Progress" | "Resolved" }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Resolved: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}
    >
      {status}
    </span>
  );
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
  return (
    <div className="min-h-screen bg-[#F4F9F8]">
      {/* Header */}
      <AdminHeader />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">


        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Complaints"
            value="248"
            description=""
            icon={<AlertCircle className="w-10 h-10" />}
            trend="+12% from last month"
            trendPositive={false}
          />
          <SummaryCard
            title="Pending"
            value="23"
            description="Requires attention"
            icon={<Clock className="w-10 h-10" />}
          />
          <SummaryCard
            title="Active Spaces"
            value="42"
            description="18 halls, 24 areas"
            icon={<MapPin className="w-10 h-10" />}
          />
          <SummaryCard
            title="Volunteers"
            value="156"
            description=""
            icon={<Users className="w-10 h-10" />}
            trend="+8 active today"
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
                {complaintsData.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.issue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href="/admin/complaints" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
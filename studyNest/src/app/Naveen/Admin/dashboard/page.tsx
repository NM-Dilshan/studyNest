"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
import { AlertCircle, Clock, MapPin, Users, Download, Activity } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import AppButton from "@/components/ui/AppButton";
import AppLinkButton from "@/components/ui/AppLinkButton";
import DashboardStatCard from "@/components/admin-dashboard/DashboardStatCard";
import DashboardSection from "@/components/admin-dashboard/DashboardSection";
import DashboardChartCard from "@/components/admin-dashboard/DashboardChartCard";
import ComplaintInsightCard from "@/components/admin-dashboard/ComplaintInsightCard";

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

interface TopUsageItem {
  name: string;
  usage: number;
}

interface DashboardSummaryResponse {
  success?: boolean;
  summary?: {
    activeSpaces: number;
    activeHalls: number;
    activeStudyAreas: number;
    totalVolunteers: number;
    activeVolunteersToday: number;
  };
  topLectureHalls?: TopUsageItem[];
}

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

const statTileClassName = "rounded-xl border border-white/15 bg-white/5 p-4";

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

export default function AdminDashboard() {
  const shouldReduceMotion = useReducedMotion();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse["summary"] | null>(null);
  const [topLectureHalls, setTopLectureHalls] = useState<TopUsageItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardSummary = async () => {
      try {
        setSummaryLoading(true);
        const response = await fetch("/api/admin/dashboard/summary", {
          signal: controller.signal,
        });
        const data = (await response.json()) as DashboardSummaryResponse;

        if (response.ok && data.success && data.summary) {
          setDashboardSummary(data.summary);
          setTopLectureHalls(Array.isArray(data.topLectureHalls) ? data.topLectureHalls : []);
        } else {
          setDashboardSummary(null);
          setTopLectureHalls([]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error fetching dashboard summary:", error);
        setDashboardSummary(null);
        setTopLectureHalls([]);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchDashboardSummary();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchComplaints = async () => {
      try {
        setComplaintsLoading(true);
        const response = await fetch("/api/admin/complaints", {
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setComplaints(data.data);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error fetching admin complaints:", error);
        setComplaints([]);
      } finally {
        setComplaintsLoading(false);
      }
    };

    fetchComplaints();

    return () => {
      controller.abort();
    };
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

  const chartTooltipStyle = {
    backgroundColor: "#0f172a",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 10,
    color: "#f8fafc",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#0f172a,_#020617_58%)]">
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="mb-8">
            <PageHeader
              eyebrow="Admin Analytics"
              title="Campus Operations Dashboard"
              subtitle="Track complaint flow, usage pressure, and response health in one place."
              actions={(
                <AppButton variant="primary">
                  <Download className="h-4 w-4" />
                  Generate Report
                </AppButton>
              )}
            />
          </AnimatedSection>

          {/* Summary Cards */}
          <AnimatedSection delay={0.04} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
            title="Total Complaints"
            value={complaintStats.total}
            loading={complaintsLoading}
            icon={<AlertCircle className="w-10 h-10" />}
            trend={complaintsLoading ? undefined : `${complaintStats.resolved} resolved so far`}
            trendPositive={true}
          />
            <DashboardStatCard
            title="Pending"
            value={complaintStats.pendingAndViewed}
            loading={complaintsLoading}
            description="Requires attention"
            icon={<Clock className="w-10 h-10" />}
          />
            <DashboardStatCard
            title="Active Spaces"
            value={dashboardSummary?.activeSpaces ?? 0}
            loading={summaryLoading}
            description={
              summaryLoading
                ? "Loading..."
                : `${dashboardSummary?.activeHalls ?? 0} halls, ${dashboardSummary?.activeStudyAreas ?? 0} areas`
            }
            icon={<MapPin className="w-10 h-10" />}
          />
            <DashboardStatCard
            title="Volunteers"
            value={dashboardSummary?.totalVolunteers ?? 0}
            loading={summaryLoading}
            description=""
            icon={<Users className="w-10 h-10" />}
            trend={summaryLoading ? undefined : `+${dashboardSummary?.activeVolunteersToday ?? 0} active today`}
            trendPositive={true}
          />
          </AnimatedSection>

          {/* Horizontal Bar Charts */}
          <AnimatedSection delay={0.08} className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DashboardChartCard
              title="Most Used Lecture Halls"
              subtitle="This week's statistics"
              isLoading={summaryLoading}
              isEmpty={topLectureHalls.length === 0}
              loadingText="Loading lecture hall usage..."
              emptyText="No lecture hall usage data available"
            >
        {/* Horizontal Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Most Used Lecture Halls" subtitle="This week's statistics">
            <div style={{ width: '100%', height: 320 }}>
              {summaryLoading ? (
                <p className="text-sm font-medium text-gray-500 py-8">Loading lecture hall usage...</p>
              ) : topLectureHalls.length === 0 ? (
                <p className="text-sm font-medium text-gray-500 py-8">No lecture hall usage data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topLectureHalls} margin={{ top: 10, right: 30, left: 90, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" width={85} tick={{ fontSize: 13, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                    <Bar dataKey="usage" fill="#7FB89B" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Complaint Status Distribution" subtitle="Current complaint pipeline">
            <div style={{ width: '100%', height: 320 }}>
              {summaryLoading ? (
                <p className="text-sm font-medium text-gray-500 py-8">Loading complaint breakdown...</p>
              ) : complaintStatusChartData.every((entry) => entry.value === 0) ? (
                <p className="text-sm font-medium text-gray-500 py-8">No complaint status data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintStatusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {complaintStatusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
                <BarChart layout="vertical" data={topLectureHalls} margin={{ top: 10, right: 24, left: 70, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={65} tick={{ fontSize: 12, fill: "#cbd5e1" }} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                  <Bar dataKey="usage" fill="#6ee7b7" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardChartCard>

            <DashboardChartCard
              title="Most Used Study Areas"
              subtitle="This week's statistics"
              isLoading={summaryLoading}
              isEmpty={topStudyAreas.length === 0}
              loadingText="Loading study area usage..."
              emptyText="No study area usage data available"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topStudyAreas} margin={{ top: 10, right: 24, left: 90, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" width={85} tick={{ fontSize: 12, fill: "#cbd5e1" }} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                  <Bar dataKey="usage" fill="#38bdf8" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardChartCard>
          </AnimatedSection>

          {/* Complaint Insight Panel */}
          <AnimatedSection delay={0.12} className="mb-8">
            <DashboardSection
              title="Recent Complaints"
              subtitle="Latest issues reported by students"
              action={(
                <Link href="/admin/complaints" className="text-sm font-semibold text-cyan-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded">
                  View All
                </Link>
              )}
            >
              {complaintsLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <LoadingSkeleton key={index} className="h-28 w-full border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : recentComplaints.length === 0 ? (
                <EmptyState
                  title="No Complaints Available"
                  description="No complaint records are currently available for display."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {recentComplaints.map((complaint) => (
                    <ComplaintInsightCard
                      key={complaint.complaint_id}
                      location={complaint.lecture_halls?.hall_name || complaint.study_areas?.area_name || "Unknown Location"}
                      issueCategory={complaint.issue_category}
                      priorityLabel={getPriorityFromCount(complaint.complaint_count || 0)}
                      status={complaint.status}
                      timeText={getRelativeTime(complaint.created_at)}
                    />
                  ))}
                </div>
              )}
            </DashboardSection>
          </AnimatedSection>

          {/* Complaint Status Chart */}
          <AnimatedSection delay={0.14} className="mb-8">
            <DashboardSection
              title="Complaint Status Overview"
              subtitle="Live status distribution from database complaints"
            >
              {complaintsLoading ? (
                <div className="flex h-[280px] items-center justify-center text-sm font-medium text-slate-300">Loading chart data...</div>
              ) : complaintStatusChartData.every((item) => item.value === 0) ? (
                <div className="flex h-[280px] items-center justify-center text-sm font-medium text-slate-300">No complaint data available for chart</div>
              ) : (
                <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-2">
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
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {complaintStatusChartData.map((item) => (
                      <div key={item.name} className={statTileClassName}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{item.name}</p>
                        </div>
                        <p className="text-2xl font-black text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DashboardSection>
          </AnimatedSection>

          {/* Trend and Activity Charts */}
          <AnimatedSection delay={0.18} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DashboardChartCard
              title="Peak Usage Time"
              subtitle="Average student count per hour"
              isLoading={false}
              isEmpty={false}
              loadingText=""
              emptyText=""
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#cbd5e1" }} stroke="#94a3b8" />
                  <YAxis domain={[0, 180]} tick={{ fontSize: 12, fill: "#cbd5e1" }} stroke="#94a3b8" />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                  <Bar dataKey="students" fill="#38bdf8" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardChartCard>

            <DashboardSection
              title="Activity Snapshot"
              subtitle="Static trend references"
              className="xl:col-span-1"
            >
              <div className="space-y-4">
                <div className={statTileClassName}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Peak Hour</p>
                  <p className="mt-1 text-2xl font-black text-white">1PM</p>
                  <p className="text-xs text-slate-400">Highest load from configured trend data</p>
                </div>
                <div className={statTileClassName}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Weekly Growth</p>
                  <p className="mt-1 text-2xl font-black text-emerald-200">+17%</p>
                  <p className="text-xs text-slate-400">Compared to weekend baseline</p>
                </div>
                <AppLinkButton
                  href="/admin/complaints"
                  size="sm"
                  variant="secondary"
                >
                  <Activity className="h-4 w-4" />
                  Open Complaint Workflow
                </AppLinkButton>
              </div>
            </DashboardSection>
          </AnimatedSection>

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut", delay: 0.24 }}
            className="mt-6"
          >
            <DashboardChartCard
              title="Weekly Usage Trend"
              subtitle="Student visits per day"
              isLoading={false}
              isEmpty={false}
              loadingText=""
              emptyText=""
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#cbd5e1" }} stroke="#94a3b8" />
                  <YAxis domain={[0, 500]} tick={{ fontSize: 12, fill: "#cbd5e1" }} stroke="#94a3b8" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="visits" stroke="#6ee7b7" strokeWidth={3} dot={{ fill: "#6ee7b7", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </DashboardChartCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
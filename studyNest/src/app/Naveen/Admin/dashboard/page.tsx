"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { jsPDF } from "jspdf";
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
  topStudyAreas?: TopUsageItem[];
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

const statTileClassName = "themed-chart-frame rounded-xl p-4";
const chartGridStroke = "var(--chart-grid)";
const chartAxisStroke = "var(--chart-axis)";
const chartAxisTick = { fontSize: 12, fill: "var(--chart-axis-text)" };
const chartCursor = { fill: "var(--accent-bg)" };

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
  const [reportState, setReportState] = useState<"idle" | "success" | "error">("idle");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse["summary"] | null>(null);
  const [topLectureHalls, setTopLectureHalls] = useState<TopUsageItem[]>([]);
  const [topStudyAreas, setTopStudyAreas] = useState<TopUsageItem[]>([]);

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
          setTopStudyAreas(Array.isArray(data.topStudyAreas) ? data.topStudyAreas : []);
        } else {
          setDashboardSummary(null);
          setTopLectureHalls([]);
          setTopStudyAreas([]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error fetching dashboard summary:", error);
        setDashboardSummary(null);
        setTopLectureHalls([]);
        setTopStudyAreas([]);
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
    const pending = complaints.filter((c) => (c.status || "").toLowerCase().includes("pending")).length;
    const viewed = complaints.filter((c) => (c.status || "").toLowerCase().includes("view")).length;
    const inProgress = complaints.filter((c) => (c.status || "").toLowerCase().includes("progress")).length;
    const resolved = complaints.filter((c) => (c.status || "").toLowerCase().includes("resolve")).length;

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
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: 10,
    color: "var(--chart-tooltip-text)",
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      setReportState("idle");

      const generatedAt = new Date();
      const reportDate = generatedAt.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const summary = dashboardSummary ?? {
        activeSpaces: 0,
        activeHalls: 0,
        activeStudyAreas: 0,
        totalVolunteers: 0,
        activeVolunteersToday: 0,
      };

      const response = await fetch("/logo.jpeg");
      if (!response.ok) {
        throw new Error("Logo could not be loaded for the PDF report.");
      }

      const logoBlob = await response.blob();
      const logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to convert logo image."));
        reader.readAsDataURL(logoBlob);
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const addFooter = () => {
        const pageCount = pdf.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          pdf.setPage(page);
          pdf.setDrawColor(220, 228, 236);
          pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`StudyNest Admin Report`, margin, pageHeight - 7);
          pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, {
            align: "right",
          });
        }
      };

      const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      const drawSectionTitle = (title: string, subtitle?: string) => {
        ensureSpace(20);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.setTextColor(15, 23, 42);
        pdf.text(title, margin, y);
        y += 6;

        if (subtitle) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 116, 139);
          pdf.text(subtitle, margin, y);
          y += 6;
        }

        pdf.setDrawColor(209, 213, 219);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 7;
      };

      const drawMetricCard = (
        x: number,
        top: number,
        width: number,
        height: number,
        label: string,
        value: string,
        accent: [number, number, number]
      ) => {
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(x, top, width, height, 4, 4, "FD");
        pdf.setFillColor(...accent);
        pdf.roundedRect(x, top, 4, height, 2, 2, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.text(label, x + 8, top + 8);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, x + 8, top + 18);
      };

      const drawListBlock = (
        title: string,
        items: TopUsageItem[],
        accent: [number, number, number]
      ) => {
        const blockHeight = Math.max(36, items.length * 10 + 18);
        ensureSpace(blockHeight);

        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, y, contentWidth, blockHeight, 4, 4, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(title, margin + 6, y + 8);

        if (!items.length) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 116, 139);
          pdf.text("No data available", margin + 6, y + 18);
          y += blockHeight + 6;
          return;
        }

        items.forEach((item, index) => {
          const rowY = y + 16 + index * 10;
          const maxBarWidth = 60;
          const barWidth = Math.max(8, Math.min(maxBarWidth, item.usage * 0.55));

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(30, 41, 59);
          pdf.text(`${index + 1}. ${item.name}`, margin + 6, rowY);

          pdf.setFillColor(241, 245, 249);
          pdf.roundedRect(pageWidth - margin - maxBarWidth - 22, rowY - 4, maxBarWidth, 4, 2, 2, "F");
          pdf.setFillColor(...accent);
          pdf.roundedRect(pageWidth - margin - maxBarWidth - 22, rowY - 4, barWidth, 4, 2, 2, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(...accent);
          pdf.text(String(item.usage), pageWidth - margin - 6, rowY, { align: "right" });
        });

        y += blockHeight + 6;
      };

      const drawComplaintCard = (complaint: ComplaintItem) => {
        const location =
          complaint.lecture_halls?.hall_name ||
          complaint.study_areas?.area_name ||
          "Unknown Location";
        const priority = getPriorityFromCount(complaint.complaint_count || 0);
        const lines = pdf.splitTextToSize(complaint.issue_category, contentWidth - 18);
        const cardHeight = Math.max(28, 18 + lines.length * 5);

        ensureSpace(cardHeight + 4);

        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, y, contentWidth, cardHeight, 4, 4, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(`#${complaint.complaint_id}  ${lines[0] || "Complaint"}`, margin + 6, y + 8);

        if (lines.length > 1) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(71, 85, 105);
          pdf.text(lines.slice(1), margin + 6, y + 13);
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.text(`Location: ${location}`, margin + 6, y + cardHeight - 10);
        pdf.text(`Status: ${complaint.status}`, margin + 70, y + cardHeight - 10);
        pdf.text(`Priority: ${priority}`, margin + 112, y + cardHeight - 10);
        pdf.text(
          new Date(complaint.created_at).toLocaleString("en-US"),
          pageWidth - margin - 6,
          y + cardHeight - 10,
          { align: "right" }
        );

        y += cardHeight + 4;
      };

      pdf.setFillColor(18, 64, 88);
      pdf.roundedRect(margin, 14, contentWidth, 34, 6, 6, "F");
      pdf.addImage(logoDataUrl, "JPEG", margin + 6, 19, 20, 20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text("StudyNest", margin + 31, 28);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Admin Dashboard Report", margin + 31, 36);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(219, 234, 254);
      pdf.text(`Generated on ${reportDate}`, margin + 31, 42);
      y = 58;

      drawSectionTitle(
        "Executive Snapshot",
        "Live overview of complaint flow, space activity, and volunteer readiness."
      );

      const cardGap = 6;
      const cardWidth = (contentWidth - cardGap) / 2;
      const cardHeight = 24;
      drawMetricCard(margin, y, cardWidth, cardHeight, "Total Complaints", String(complaintStats.total), [37, 99, 235]);
      drawMetricCard(
        margin + cardWidth + cardGap,
        y,
        cardWidth,
        cardHeight,
        "Pending Attention",
        String(complaintStats.pendingAndViewed),
        [245, 158, 11]
      );
      y += cardHeight + 6;
      drawMetricCard(margin, y, cardWidth, cardHeight, "Active Spaces", String(summary.activeSpaces), [14, 165, 233]);
      drawMetricCard(
        margin + cardWidth + cardGap,
        y,
        cardWidth,
        cardHeight,
        "Volunteers",
        String(summary.totalVolunteers),
        [16, 185, 129]
      );
      y += cardHeight + 10;

      ensureSpace(30);
      pdf.setFillColor(244, 248, 251);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, y, contentWidth, 24, 4, 4, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Operational Highlights", margin + 6, y + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(
        `Resolved complaints: ${complaintStats.resolved}   |   In progress: ${complaintStats.inProgress}   |   Active today: ${summary.activeVolunteersToday} volunteers`,
        margin + 6,
        y + 16
      );
      y += 32;

      drawSectionTitle("Usage Leaders", "Most used spaces from the current dashboard dataset.");
      drawListBlock("Top Lecture Halls", topLectureHalls, [110, 231, 183]);
      drawListBlock("Top Study Areas", topStudyAreas, [56, 189, 248]);

      drawSectionTitle("Recent Complaints", "Latest complaint records visible on the dashboard.");
      if (!recentComplaints.length) {
        ensureSpace(20);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text("No recent complaints available.", margin, y);
        y += 10;
      } else {
        recentComplaints.forEach(drawComplaintCard);
      }

      const fileDate = generatedAt.toISOString().slice(0, 10);
      addFooter();
      pdf.save(`studynest-admin-dashboard-report-${fileDate}.pdf`);

      setReportState("success");
    } catch (error) {
      console.error("Failed to generate dashboard report:", error);
      setReportState("error");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="themed-page-main min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection className="mb-8 rounded-[2rem] themed-hero-surface px-6 py-8 sm:px-8">
            <PageHeader
              eyebrow="Admin Analytics"
              title="Campus Operations Dashboard"
              subtitle="Track complaint flow, usage pressure, and response health in one place."
              actions={(
                <AppButton
                  variant="primary"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport || complaintsLoading || summaryLoading}
                >
                  <Download className="h-4 w-4" />
                  {isGeneratingReport ? "Generating..." : "Generate Report"}
                </AppButton>
              )}
            />
            {reportState === "success" && (
              <p className="mt-4 text-sm font-semibold text-emerald-600">
                Dashboard report downloaded successfully.
              </p>
            )}
            {reportState === "error" && (
              <p className="mt-4 text-sm font-semibold text-rose-600">
                Unable to generate the dashboard report right now.
              </p>
            )}
          </AnimatedSection>

          <AnimatedSection delay={0.04} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              title="Total Complaints"
              value={complaintStats.total}
              loading={complaintsLoading}
              icon={<AlertCircle className="h-10 w-10" />}
              trend={complaintsLoading ? undefined : `${complaintStats.resolved} resolved so far`}
              trendPositive
            />
            <DashboardStatCard
              title="Pending"
              value={complaintStats.pendingAndViewed}
              loading={complaintsLoading}
              description="Requires attention"
              icon={<Clock className="h-10 w-10" />}
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
              icon={<MapPin className="h-10 w-10" />}
            />
            <DashboardStatCard
              title="Volunteers"
              value={dashboardSummary?.totalVolunteers ?? 0}
              loading={summaryLoading}
              icon={<Users className="h-10 w-10" />}
              trend={summaryLoading ? undefined : `+${dashboardSummary?.activeVolunteersToday ?? 0} active today`}
              trendPositive
            />
          </AnimatedSection>

          <AnimatedSection delay={0.08} className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DashboardChartCard
              title="Most Used Lecture Halls"
              subtitle="This week's statistics"
              isLoading={summaryLoading}
              isEmpty={topLectureHalls.length === 0}
              loadingText="Loading lecture hall usage..."
              emptyText="No lecture hall usage data available"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topLectureHalls} margin={{ top: 10, right: 24, left: 90, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridStroke} />
                  <XAxis type="number" stroke={chartAxisStroke} tick={chartAxisTick} />
                  <YAxis type="category" dataKey="name" width={85} tick={chartAxisTick} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={chartCursor} />
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridStroke} />
                  <XAxis type="number" stroke={chartAxisStroke} tick={chartAxisTick} />
                  <YAxis type="category" dataKey="name" width={85} tick={chartAxisTick} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={chartCursor} />
                  <Bar dataKey="usage" fill="#38bdf8" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardChartCard>
          </AnimatedSection>

          <AnimatedSection delay={0.12} className="mb-8">
            <DashboardSection
              title="Recent Complaints"
              subtitle="Latest issues reported by students"
              action={(
                <Link href="/admin/complaints" className="rounded text-sm font-semibold text-[var(--accent-text)] transition-colors hover:text-[var(--text-main)]">
                  View All
                </Link>
              )}
            >
              {complaintsLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <LoadingSkeleton key={index} className="h-28 w-full themed-inset" />
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

          <AnimatedSection delay={0.14} className="mb-8">
            <DashboardSection
              title="Complaint Status Overview"
              subtitle="Live status distribution from database complaints"
            >
              {complaintsLoading ? (
                <div className="flex h-[280px] items-center justify-center text-sm font-medium text-[var(--text-soft)]">Loading chart data...</div>
              ) : complaintStatusChartData.every((item) => item.value === 0) ? (
                <div className="flex h-[280px] items-center justify-center text-sm font-medium text-[var(--text-soft)]">No complaint data available for chart</div>
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
                        <Legend wrapperStyle={{ color: "var(--chart-axis-text)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {complaintStatusChartData.map((item) => (
                      <div key={item.name} className={statTileClassName}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{item.name}</p>
                        </div>
                        <p className="text-2xl font-black text-[var(--text-main)]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DashboardSection>
          </AnimatedSection>

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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                  <XAxis dataKey="hour" tick={chartAxisTick} stroke={chartAxisStroke} />
                  <YAxis domain={[0, 180]} tick={chartAxisTick} stroke={chartAxisStroke} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={chartCursor} />
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Peak Hour</p>
                  <p className="mt-1 text-2xl font-black text-[var(--text-main)]">1PM</p>
                  <p className="text-xs text-[var(--text-muted)]">Highest load from configured trend data</p>
                </div>
                <div className={statTileClassName}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Weekly Growth</p>
                  <p className="mt-1 text-2xl font-black text-emerald-600">+17%</p>
                  <p className="text-xs text-[var(--text-muted)]">Compared to weekend baseline</p>
                </div>
                <AppLinkButton href="/admin/complaints" size="sm" variant="secondary">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                  <XAxis dataKey="day" tick={chartAxisTick} stroke={chartAxisStroke} />
                  <YAxis domain={[0, 500]} tick={chartAxisTick} stroke={chartAxisStroke} />
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

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, Clock3, MapPin, Radar, Send } from "lucide-react";
import MainHeader from "@/components/MainHeader";
import SearchBar from "@/components/SearchBar";
import AppBackground from "@/components/AppBackground";
import AnimatedSection from "@/components/ui/AnimatedSection";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import AppLinkButton from "@/components/ui/AppLinkButton";
import FeatureSpotlightCard from "@/components/home/FeatureSpotlightCard";
import GPSPermissionModal from "@/components/home/GPSPermissionModal";
import RecentUpdatesPanel, { type HomeRecentUpdate } from "@/components/home/RecentUpdatesPanel";
import { readStoredUser, type ClientUser } from "@/lib/auth/clientUser";

const ParticleHero = dynamic(() => import("@/components/effects/ParticleHero"), { ssr: false });
const FloatingCampusNodes = dynamic(() => import("@/components/3d/FloatingCampusNodes"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-slate-800/50" />,
});

export default function HomePage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showGPSDialog, setShowGPSDialog] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "enabled" | "denied">("idle");

  const [user] = useState<ClientUser | null>(() => readStoredUser());

  const [recentUpdates] = useState<HomeRecentUpdate[]>(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000).toISOString();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000).toISOString();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000).toISOString();

    return [
      {
        type: "Hall",
        name: "Lecture Hall A101",
        building: "Building A",
        occupancy: "FREE",
        reporter: "John Doe",
        time: fiveMinutesAgo,
      },
      {
        type: "Study Area",
        name: "Main Library",
        building: "Building B",
        occupancy: "MEDIUM",
        reporter: "Jane Smith",
        time: fifteenMinutesAgo,
      },
      {
        type: "Hall",
        name: "Lecture Hall B205",
        building: "Building C",
        occupancy: "OCCUPIED",
        reporter: "Mike Johnson",
        time: thirtyMinutesAgo,
      },
    ];
  });

  useEffect(() => {
    setIsHydrated(true);

    if (!user) {
      router.push("/login/signIN");
      return;
    }

    const gpsDialogShown = localStorage.getItem(`gpsDialogShown_${user.user_id}`);
    if (!gpsDialogShown) {
      setTimeout(() => {
        setShowGPSDialog(true);
      }, 900);
    }
  }, [user, router]);

  const requestGPSPermission = async () => {
    if (!user) return;

    setGpsStatus("requesting");

    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });

      if (permission.state === "denied") {
        setGpsStatus("denied");
        localStorage.setItem(`gpsDialogShown_${user.user_id}`, "true");
        setTimeout(() => setShowGPSDialog(false), 1800);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsStatus("enabled");
          localStorage.setItem(`gpsEnabled_${user.user_id}`, "true");
          localStorage.setItem(`gpsDialogShown_${user.user_id}`, "true");

          fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.user_id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          }).catch(console.error);

          setTimeout(() => setShowGPSDialog(false), 1200);
        },
        () => {
          setGpsStatus("denied");
          localStorage.setItem(`gpsDialogShown_${user.user_id}`, "true");
          setTimeout(() => setShowGPSDialog(false), 1800);
        }
      );
    } catch {
      setGpsStatus("denied");
      localStorage.setItem(`gpsDialogShown_${user.user_id}`, "true");
      setTimeout(() => setShowGPSDialog(false), 1800);
    }
  };

  const handleSkipGPS = () => {
    if (user) {
      localStorage.setItem(`gpsDialogShown_${user.user_id}`, "true");
    }
    setShowGPSDialog(false);
  };

  if (!isHydrated) {
    return (
      <AppBackground>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-300">Preparing your smart campus workspace...</div>
        </div>
      </AppBackground>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.name?.split(" ")[0] || "Student";

  return (
    <AppBackground>
      <MainHeader />

      <GPSPermissionModal show={showGPSDialog} status={gpsStatus} onEnable={requestGPSPermission} onSkip={handleSkipGPS} />

      <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#1e293b_0%,#0f172a_45%,#020617_100%)]">
        <ParticleHero />

        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <AnimatedSection>
            <PageHeader
              eyebrow="StudyNest Smart Campus"
              title={`Welcome back, ${firstName}`}
              subtitle="Real-time occupancy, volunteer-powered hall intelligence, and data-driven campus operations in one premium workspace."
              actions={
                <div className="flex flex-wrap gap-2">
                  <AppLinkButton
                    href="/study-areas"
                    variant="primary"
                    className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  >
                    Explore Study Areas
                  </AppLinkButton>
                  <AppLinkButton
                    href="/requests"
                    variant="secondary"
                    className="border-cyan-300/45 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                  >
                    Open Hall Requests
                  </AppLinkButton>
                </div>
              }
            />
          </AnimatedSection>

          <AnimatedSection className="mt-7">
            <GlassCard className="border-cyan-300/20 bg-slate-900/55 p-4">
              <SearchBar />
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" delay={0.05}>
            <StatCard title="Live Updates" value={recentUpdates.length} helper="Community status pulses" icon={<Activity className="h-5 w-5" />} />
            <StatCard title="Role" value={user.role.toUpperCase()} helper="Adaptive experience enabled" icon={<Radar className="h-5 w-5" />} />
            <StatCard title="Access" value="Realtime" helper="Polling and notification sync" icon={<Clock3 className="h-5 w-5" />} />
            <StatCard title="Signal" value="Stable" helper="Campus telemetry online" icon={<BarChart3 className="h-5 w-5" />} />
          </AnimatedSection>

          <AnimatedSection className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]" delay={0.08}>
            <GlassCard className="border-white/15 bg-slate-900/55 p-5 md:p-6">
              <h2 className="text-xl font-semibold text-white">Core Modules</h2>
              <p className="mt-1 text-sm text-slate-300">Navigate quickly to the most-used student, volunteer, and admin workflows.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FeatureSpotlightCard
                  href="/study-areas"
                  title="Study Areas"
                  description="Live occupancy indicators with practical card-based insights."
                  badge="Low / Medium / High"
                  icon={MapPin}
                />
                <FeatureSpotlightCard
                  href="/requests"
                  title="Hall Requests"
                  description="Task-focused request-response flow between students and volunteers."
                  badge="Pending"
                  icon={Send}
                />
                <FeatureSpotlightCard
                  href="/Sunera/volunteer"
                  title="Volunteer Updates"
                  description="Fast update submission and confidence-driven hall status responses."
                  badge="Responded"
                  icon={Activity}
                />
                <FeatureSpotlightCard
                  href="/Naveen/Admin/dashboard"
                  title="Admin Analytics"
                  description="Complaints, activity trends, and operational summary visualization."
                  badge="Resolved"
                  icon={BarChart3}
                />
              </div>
            </GlassCard>

            <GlassCard className="border-indigo-300/20 bg-slate-900/55 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">Campus signal graph</p>
              <FloatingCampusNodes />
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection className="mt-10" delay={0.12}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Recent Activity Feed</h2>
                <p className="mt-1 text-sm text-slate-300">Latest crowd and hall updates reported by your campus network.</p>
              </div>
            </div>
            {recentUpdates.length > 0 ? (
              <RecentUpdatesPanel updates={recentUpdates} />
            ) : (
              <EmptyState
                title="No activity yet"
                description="When volunteers and students report space updates, they will appear here with occupancy signals."
                icon={<Activity className="h-6 w-6" />}
                action={
                  <AppLinkButton
                    href="/requests"
                    variant="secondary"
                    size="sm"
                    className="border-cyan-300/40 text-cyan-100 hover:bg-cyan-300/10"
                  >
                    Create First Request
                  </AppLinkButton>
                }
              />
            )}
          </AnimatedSection>
        </div>
      </main>
    </AppBackground>
  );
}

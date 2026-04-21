"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, BellRing, Clock3, MapPin, Radar, Send } from "lucide-react";
import MainHeader from "@/components/MainHeader";
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
  loading: () => <div className="themed-inset h-[320px] animate-pulse rounded-2xl" />,
});

type AdminBroadcastMessage = {
  message_id: number;
  title: string;
  message: string;
  scheduled_at: string;
  expires_at: string | null;
  created_by: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const [showGPSDialog, setShowGPSDialog] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "enabled" | "denied">("idle");
  const [user] = useState<ClientUser | null>(() => readStoredUser());
  const [adminMessages, setAdminMessages] = useState<AdminBroadcastMessage[]>([]);
  const [loadingAdminMessages, setLoadingAdminMessages] = useState(true);
  const [activeAdminMessageIndex, setActiveAdminMessageIndex] = useState(0);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

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
    if (!user) {
      router.push("/login/signIN");
      return;
    }

    const gpsDialogShown = localStorage.getItem(`gpsDialogShown_${user.user_id}`);
    if (!gpsDialogShown) {
      const timer = setTimeout(() => {
        setShowGPSDialog(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadAdminMessages = async () => {
      try {
        setLoadingAdminMessages(true);
        const response = await fetch("/api/admin/messages/active?limit=3", {
          signal: abortController.signal,
        });
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Failed to fetch admin messages");
        }

        setAdminMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load admin broadcast messages:", error);
          setAdminMessages([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingAdminMessages(false);
        }
      }
    };

    loadAdminMessages();

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (adminMessages.length <= 1) {
      setActiveAdminMessageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveAdminMessageIndex((previous) => (previous + 1) % adminMessages.length);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [adminMessages]);

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
          <div className="text-[var(--text-soft)]">Preparing your smart campus workspace...</div>
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

      <main className="themed-page-main relative overflow-hidden">
        <ParticleHero />

        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <AnimatedSection className="themed-hero-surface relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
            <PageHeader
              eyebrow="StudyNest Smart Campus"
              title={`Welcome back, ${firstName}`}
              subtitle="Real-time occupancy, volunteer-powered hall intelligence, and data-driven campus operations in one premium workspace."
              actions={
                <div className="flex flex-wrap gap-2">
                  <AppLinkButton href="/study-areas" variant="primary">
                    Explore Study Areas
                  </AppLinkButton>
                  <AppLinkButton href="/requests" variant="secondary">
                    Open Hall Requests
                  </AppLinkButton>
                </div>
              }
            />
          </AnimatedSection>

          <AnimatedSection className="mt-7" delay={0.03}>
            <GlassCard className="overflow-hidden p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="themed-panel-info inline-flex rounded-xl p-2.5">
                      <BellRing className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-main)]">Admin Broadcasts</h2>
                      <p className="mt-1 text-sm text-[var(--text-soft)]">
                        Important announcements published from the admin dashboard.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="themed-badge-info rounded-full px-3 py-1 text-xs font-semibold">
                  Live notices
                </div>
              </div>

              {loadingAdminMessages ? (
                <div className="themed-inset mt-4 rounded-2xl p-4">
                  <p className="text-sm text-[var(--text-soft)]">Loading latest announcements...</p>
                </div>
              ) : adminMessages.length > 0 ? (
                <div className="themed-inset mt-4 rounded-[24px] p-3.5 md:p-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="themed-panel-info inline-flex rounded-xl p-2.5">
                        <BellRing className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Campus Alert</h3>
                        <p className="mt-1 text-xs font-medium text-[var(--accent-text)]">Updates every 10 seconds</p>
                      </div>
                    </div>
                    <div className="themed-badge-info rounded-full px-2.5 py-1 text-xs font-semibold">
                      {activeAdminMessageIndex + 1} / {adminMessages.length}
                    </div>
                  </div>

                  <div className="themed-surface mt-4 rounded-2xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-base leading-7 text-[var(--text-soft)] md:text-lg md:leading-8">
                          <span className="font-semibold text-[var(--text-main)]">
                            {adminMessages[activeAdminMessageIndex]?.title}
                          </span>
                          {adminMessages[activeAdminMessageIndex]?.message ? (
                            <>
                              {" "}
                              {adminMessages[activeAdminMessageIndex]?.message}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="themed-surface-muted rounded-lg px-2.5 py-1.5 text-right text-[11px] font-medium text-[var(--text-soft)]">
                        {new Date(adminMessages[activeAdminMessageIndex]?.scheduled_at).toLocaleString()}
                      </div>
                    </div>

                    {adminMessages[activeAdminMessageIndex]?.created_by && (
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Published by {adminMessages[activeAdminMessageIndex]?.created_by}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-1.5">
                      {adminMessages.map((message, index) => (
                        <button
                          key={message.message_id}
                          type="button"
                          onClick={() => setActiveAdminMessageIndex(index)}
                          aria-label={`Show announcement ${index + 1}`}
                          className={`h-2.5 w-2.5 rounded-full transition-all ${
                            index === activeAdminMessageIndex
                              ? "bg-[var(--accent-text)]"
                              : "bg-[var(--surface-border)] hover:bg-[var(--text-soft)]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="themed-progress-track mt-4 h-1.5 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--accent-text)] transition-all duration-300"
                        style={{
                          width: `${((activeAdminMessageIndex + 1) / adminMessages.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="themed-inset mt-4 rounded-2xl p-4">
                  <p className="text-sm text-[var(--text-soft)]">No active announcements right now.</p>
                </div>
              )}
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" delay={0.05}>
            <StatCard title="Live Updates" value={recentUpdates.length} helper="Community status pulses" icon={<Activity className="h-5 w-5" />} />
            <StatCard title="Role" value={user.role.toUpperCase()} helper="Adaptive experience enabled" icon={<Radar className="h-5 w-5" />} />
            <StatCard title="Access" value="Realtime" helper="Polling and notification sync" icon={<Clock3 className="h-5 w-5" />} />
            <StatCard title="Signal" value="Stable" helper="Campus telemetry online" icon={<BarChart3 className="h-5 w-5" />} />
          </AnimatedSection>

          <AnimatedSection className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]" delay={0.08}>
            <GlassCard className="p-5 md:p-6">
              <h2 className="text-xl font-semibold text-[var(--text-main)]">Core Modules</h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">Navigate quickly to the most-used student, volunteer, and admin workflows.</p>
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

            <GlassCard className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-text)]">Campus signal graph</p>
              <FloatingCampusNodes />
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection className="mt-10" delay={0.12}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text-main)]">Recent Activity Feed</h2>
                <p className="mt-1 text-sm text-[var(--text-soft)]">Latest crowd and hall updates reported by your campus network.</p>
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
                  <AppLinkButton href="/requests" variant="secondary" size="sm">
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

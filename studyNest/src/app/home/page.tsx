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
import MainHeader from '@/components/MainHeader'
import SearchBar from '@/components/SearchBar'
import AppBackground from '@/components/AppBackground'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, X, MessageCircle, BookOpen, MapPinIcon, AlertCircle, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'

type RecentUpdate = {
  type: 'Hall' | 'Study Area'
  name: string | null | undefined
  building: string | null | undefined
  occupancy: string
  reporter: string | null | undefined
  time: string
}

type ActiveAdminMessage = {
  message_id: number
  title: string
  message: string
  scheduled_at: string
  created_at?: string | null
}

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
  is_active: boolean
  created_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [showGPSDialog, setShowGPSDialog] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'enabled' | 'denied'>('idle')
  const [activeAdminMessages, setActiveAdminMessages] = useState<ActiveAdminMessage[]>([])
  const [activeMessageIndex, setActiveMessageIndex] = useState(0)
  const [isAdminMessageLoading, setIsAdminMessageLoading] = useState(false)
  
  // Initialize user from localStorage without setState in effect
  const [user] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem('user')
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  })

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
    // Mark hydration complete after component mounts
    setIsHydrated(true)
    
    // Handle authentication redirect
    if (!user) {
      router.push('/login/signIN')
    } else {
      // Show GPS permission dialog after login
      const gpsDialogShown = localStorage.getItem(`gpsDialogShown_${user.user_id}`)
      if (!gpsDialogShown) {
        // Show dialog after a short delay for better UX
        setTimeout(() => {
          setShowGPSDialog(true)
        }, 1000)
      }
    }
  }, [user, router])

  useEffect(() => {
    if (!user?.user_id) return

    let isMounted = true

    const fetchLatestAdminMessage = async () => {
      try {
        setIsAdminMessageLoading(true)
        const response = await fetch('/api/admin/messages/active?limit=5')
        if (!response.ok) return

        const data = await response.json()
        const messages: ActiveAdminMessage[] = data.messages || []

        if (isMounted) {
          setActiveAdminMessages(messages)
          setActiveMessageIndex(0)
        }
      } catch (error) {
        console.error('Failed to fetch admin message:', error)
      } finally {
        if (isMounted) {
          setIsAdminMessageLoading(false)
        }
      }
    }

    fetchLatestAdminMessage()

    return () => {
      isMounted = false
    }
  }, [user?.user_id])

  useEffect(() => {
    if (activeAdminMessages.length <= 1) return

    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % activeAdminMessages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeAdminMessages.length])

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

  const currentAdminMessage = activeAdminMessages[activeMessageIndex] || null

  const goToPreviousMessage = () => {
    if (!activeAdminMessages.length) return
    setActiveMessageIndex((prev) =>
      prev === 0 ? activeAdminMessages.length - 1 : prev - 1
    )
  }

  const goToNextMessage = () => {
    if (!activeAdminMessages.length) return
    setActiveMessageIndex((prev) => (prev + 1) % activeAdminMessages.length)
  }

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
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-2">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2">
              Welcome, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{firstName}</span>! 👋
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">Find your perfect study space on campus</p>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="mt-6">
            <SearchBar />
          </div>

          {/* Admin Message Section */}
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/70 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-amber-900">Notices</h2>
                  <p className="text-xs text-amber-700/90">Important Notices... ({activeAdminMessages.length})</p>
                </div>
              </div>

              {activeAdminMessages.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousMessage}
                    className="h-8 w-8 rounded-full border border-amber-200 bg-white/80 text-amber-700 hover:bg-white transition flex items-center justify-center"
                    aria-label="Previous admin message"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextMessage}
                    className="h-8 w-8 rounded-full border border-amber-200 bg-white/80 text-amber-700 hover:bg-white transition flex items-center justify-center"
                    aria-label="Next admin message"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-white/70 border border-amber-100 p-3 sm:p-4 transition-all duration-500">
              {isAdminMessageLoading ? (
                <p className="text-sm text-gray-500">Loading admin message...</p>
              ) : currentAdminMessage ? (
                <>
                  <div className="inline-flex items-center gap-2 mb-2 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                    LIVE UPDATE
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{currentAdminMessage.title}</p>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{currentAdminMessage.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {currentAdminMessage.scheduled_at
                      ? formatTime(currentAdminMessage.scheduled_at)
                      : 'Recently updated'}
                  </p>

                  {activeAdminMessages.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      {activeAdminMessages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveMessageIndex(index)}
                          className={`h-1.5 rounded-full transition-all ${
                            index === activeMessageIndex
                              ? 'w-6 bg-amber-500'
                              : 'w-2 bg-amber-200 hover:bg-amber-300'
                          }`}
                          aria-label={`Go to message ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">No admin messages right now.</p>
              )}
            </div>
          </div>
        </div>

        {/* Premium Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Free Lecture Hall Finder */}
          <Link 
            href="/student/halls" 
            className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <div className="relative p-6 sm:p-8 backdrop-blur-md border border-white/30 shadow-xl">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-200/50 backdrop-blur-sm">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Free Lecture Hall Finder</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Find available lecture halls with real-time updates</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-medium border border-blue-200/50 backdrop-blur-sm">
                📍 Real-time finder
              </div>
            </div>
          </Link>

          {/* Study Area Finder */}
          <Link 
            href="/study-areas" 
            className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
            <div className="relative p-6 sm:p-8 backdrop-blur-md border border-white/30 shadow-xl">
              <div className="h-14 w-14 bg-gradient-to-br from-emerald-200/50 to-green-200/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-200/50 backdrop-blur-sm">
                <MapPinIcon className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Study Area Finder</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Check crowd levels in libraries and study spaces</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-medium border border-emerald-200/50 backdrop-blur-sm">
                🗺️ Real-time GPS tracking
              </div>
            </div>
          </Link>

          {/* Submit Complaint */}
          <Link 
            href="/Naveen/my-complaints" 
            className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <div className="relative p-6 sm:p-8 backdrop-blur-md border border-white/30 shadow-xl">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-purple-200/50 backdrop-blur-sm">
                <AlertCircle className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Submit Complaint</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Report issues with facilities or study spaces</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/50 text-purple-700 text-xs font-medium border border-purple-200/50 backdrop-blur-sm">
                ⏱️ 2-3 days response
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Updates Section */}
        {recentUpdates.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent Updates</h2>
              <p className="text-gray-600 text-sm mt-1">Real-time status changes from the community</p>
            </div>

            <div className="space-y-3">
              {recentUpdates.map((update, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg hover:shadow-xl hover:bg-white/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-bold ${getOccupancyColor(update.occupancy)}`}>
                        {getOccupancyEmoji(update.occupancy)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{update.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{update.building}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getOccupancyColor(update.occupancy)}`}>
                        {update.occupancy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{update.reporter}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(update.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </AppBackground>
  );
}

'use client'

import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Activity, Compass, ShieldCheck, Sparkles, Users, Wifi } from 'lucide-react'

interface User {
  user_id: string
  student_id: string
  name: string
  email: string
  role: 'student' | 'volunteer' | 'admin'
}

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(raw ? (JSON.parse(raw) as User) : null)
    } catch (error) {
      console.error('Failed to parse user:', error)
      setUser(null)
    }
    setIsHydrated(true)
  }, [])

  return (
    <AppBackground>
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern id="about-grid" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M0 42 L42 0" fill="transparent" stroke="#2E6F95" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>
      </div>

      <MainHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="themed-surface relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div className="pointer-events-none absolute -right-28 -top-20 h-64 w-64 rounded-full bg-[var(--brand-primary)]/15 blur-3xl" />
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
                About StudyNest
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
                Smarter Campus Spaces, In Real Time
              </h1>
              <p className="mt-4 text-lg text-[var(--text-soft)]">
                StudyNest helps students find the right environment for focused work, collaboration, and revision with live occupancy signals.
              </p>
              <p className="mt-2 text-[var(--text-muted)]">
                Built for campus realities: limited space, shifting schedules, and changing crowd patterns.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {user ? (
                  <Link href="/study-areas" className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-primary-dark)]">
                    Explore Study Areas
                  </Link>
                ) : (
                  <Link href="/login/signIN" className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-primary-dark)]">
                    Get Started Now
                  </Link>
                )}
                <a href="#mission" className="themed-input rounded-xl px-6 py-3 font-semibold text-[var(--text-soft)] transition hover:bg-[var(--button-hover)]">
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-[24px] border border-[var(--surface-border)] sm:h-[340px]">
              <Image
                src="/login.png"
                alt="Students collaborating in a modern StudyNest learning space"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                Live insights for lecture halls and study zones
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="mt-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="themed-surface rounded-3xl p-6">
              <div className="mb-4 inline-flex rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Real-time Updates</h2>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Instant signals from student volunteers and connected feeds help you avoid crowded spaces.
              </p>
            </div>

            <div className="themed-surface rounded-3xl p-6">
              <div className="mb-4 inline-flex rounded-xl bg-blue-500/15 p-3 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Privacy by Design</h2>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Occupancy is anonymous and aggregated. No personal location trails are stored.
              </p>
            </div>

            <div className="themed-surface rounded-3xl p-6">
              <div className="mb-4 inline-flex rounded-xl bg-fuchsia-500/15 p-3 text-fuchsia-400">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Community Powered</h2>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Volunteers and students keep availability data fresh for everyone on campus.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="mt-12">
          <div className="mb-6 text-center">
            <h3 className="text-3xl font-black text-[var(--text-main)]">Why Students Choose StudyNest</h3>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--text-soft)]">
              Designed with a calm, productivity-first flow from search to decision.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Live Occupancy',
                desc: 'View space usage in real time and decide faster.',
                icon: <Activity className="h-5 w-5" />,
              },
              {
                title: 'GPS Awareness',
                desc: 'Discover nearby spaces and reduce campus walking time.',
                icon: <Compass className="h-5 w-5" />,
              },
              {
                title: 'Peak Trends',
                desc: 'Plan around crowd cycles and exam-week pressure.',
                icon: <Sparkles className="h-5 w-5" />,
              },
              {
                title: 'Issue Reporting',
                desc: 'Flag problems quickly and track complaint updates.',
                icon: <ShieldCheck className="h-5 w-5" />,
              },
              {
                title: 'Volunteer Loop',
                desc: 'Contributors improve data quality for everyone.',
                icon: <Users className="h-5 w-5" />,
              },
              {
                title: 'Reliable Connectivity',
                desc: 'Filter spaces with stable network and power support.',
                icon: <Wifi className="h-5 w-5" />,
              },
            ].map((feature) => (
              <article key={feature.title} className="themed-surface rounded-2xl p-6">
                <div className="mb-3 inline-flex rounded-lg bg-[var(--accent-bg)] p-2 text-[var(--accent-text)]">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-[var(--text-main)]">{feature.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-soft)]">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="themed-surface rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-2xl font-black text-[var(--text-main)]">Our Team</h3>
            <p className="mt-2 text-[var(--text-soft)]">
              Built by students, supported by volunteers, guided by academic mentors.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Development Team', 'Volunteer Coordinator', 'Product Manager'].map((role) => (
                <div key={role} className="themed-surface-muted rounded-xl p-4 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)]">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-[var(--text-main)]">{role}</h4>
                </div>
              ))}
            </div>
          </article>

          <article className="themed-surface rounded-2xl p-6">
            <h3 className="text-xl font-black text-[var(--text-main)]">StudyNest At A Glance</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Platform focus</dt>
                <dd className="font-semibold text-[var(--text-main)]">Campus spaces</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Core value</dt>
                <dd className="font-semibold text-[var(--text-main)]">Live availability</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Privacy model</dt>
                <dd className="font-semibold text-[var(--text-main)]">Anonymous counts</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-bg)] p-8 text-center">
          <h3 className="text-3xl font-black text-[var(--text-main)]">Ready to Find Your Ideal Study Spot?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--text-soft)]">
            Join students who use StudyNest to plan smarter sessions and avoid unnecessary crowding.
          </p>
          <div className="mt-6">
            {isHydrated && user ? (
              <Link href="/study-areas" className="inline-block rounded-xl bg-[var(--brand-primary)] px-8 py-3 font-bold text-white transition hover:bg-[var(--brand-primary-dark)]">
                Explore Now
              </Link>
            ) : (
              <Link href="/login/signIN" className="inline-block rounded-xl bg-[var(--brand-primary)] px-8 py-3 font-bold text-white transition hover:bg-[var(--brand-primary-dark)]">
                Get Started Free
              </Link>
            )}
          </div>
        </section>

        <footer className="mt-10 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-6 py-5 text-center text-sm text-[var(--text-muted)]">
          � 2026 StudyNest. All rights reserved.
        </footer>
      </main>
    </AppBackground>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '../lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLinkButton from '@/components/ui/AppLinkButton'
import HeaderShell from '@/components/navigation/HeaderShell'
import ThemeToggle from '@/components/navigation/ThemeToggle'

const publicNavItems = [
  { href: '#features', label: 'Features' },
  { href: '/about', label: 'About' },
  { href: '/login/signIN', label: 'Sign in' },
]

const featureCards = [
  {
    title: 'Real-Time Updates',
    description:
      'Live occupancy signals from trusted volunteer reports help students choose the right space without wandering campus.',
    icon: Compass,
    tone: 'themed-panel-info',
  },
  {
    title: 'Reliable Data',
    description:
      'StudyNest layers ratings, freshness, and contributor reputation so availability feels dependable instead of noisy.',
    icon: ShieldCheck,
    tone: 'themed-panel-success',
  },
  {
    title: 'Community Driven',
    description:
      'Students and volunteers improve the experience together, creating a faster and calmer way to find space across campus.',
    icon: Users,
    tone: 'themed-panel-info',
  },
]

const heroSignals = [
  'Real-time updates',
  'Volunteer-powered accuracy',
  'Free for students',
]

export default async function LandingPage() {
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="themed-page-shell min-h-screen">
      <HeaderShell className="border-b border-[var(--header-border)]/90">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl px-1 py-1 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
        >
          <Image
            src="/logo.jpeg"
            alt="StudyNest Logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl border border-[var(--header-border)] shadow-[var(--surface-shadow)]"
            priority
          />
          <div>
            <p className="text-lg font-black tracking-tight text-[var(--header-text)]">StudyNest</p>
            <p className="text-xs font-medium text-[var(--header-text-muted)]">Smart Space Finder</p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Landing navigation">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-[var(--header-text-soft)] transition hover:border-[var(--header-border)] hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-4">
          <ThemeToggle className="px-2.5 sm:px-3" />
          <AppLinkButton href="/login/signUP" variant="primary" size="md" className="hidden sm:inline-flex">
            Get Started
          </AppLinkButton>
        </div>
      </HeaderShell>

      <main className="themed-page-main">
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:px-8 lg:py-24">
            <div className="relative z-10 flex flex-col justify-center">
              <div className="themed-panel-info inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Premium campus navigation for focused study
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
                Find your perfect
                <span className="block bg-gradient-to-r from-[var(--brand-primary)] via-[#3d89b3] to-[#62b2ce] bg-clip-text text-transparent">
                  study space
                </span>
                without the campus guesswork.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-soft)] sm:text-xl">
                StudyNest helps students discover lecture halls and study areas with live availability,
                trusted updates, and a calmer decision flow that feels consistent across the whole app.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <AppLinkButton href="/login/signUP" variant="primary" size="lg" className="group">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </AppLinkButton>
                <AppLinkButton href="#features" variant="secondary" size="lg">
                  Explore Features
                </AppLinkButton>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                {heroSignals.map((item) => (
                  <div
                    key={item}
                    className="themed-surface-muted inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--text-soft)]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="themed-chart-frame rounded-2xl p-4">
                  <p className="text-2xl font-black text-[var(--text-main)] sm:text-3xl">500+</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">Active users</p>
                </div>
                <div className="themed-chart-frame rounded-2xl p-4">
                  <p className="text-2xl font-black text-[var(--text-main)] sm:text-3xl">50+</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">Study spaces</p>
                </div>
                <div className="themed-chart-frame rounded-2xl p-4">
                  <p className="text-2xl font-black text-[var(--text-main)] sm:text-3xl">1000+</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">Daily updates</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-10 top-6 h-56 rounded-full bg-[var(--accent-bg)] blur-3xl sm:h-72" />
              <div className="themed-hero-surface relative w-full max-w-xl overflow-hidden rounded-[30px] p-5 sm:p-6 lg:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        Live overview
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--text-main)]">Campus availability</h2>
                    </div>
                    <div className="themed-badge-info rounded-full px-3 py-1 text-xs font-semibold">
                      Updated now
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="themed-surface rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-main)]">Lecture Halls</p>
                          <p className="mt-1 text-sm text-[var(--text-soft)]">
                            Compare nearby halls by live availability and confidence.
                          </p>
                        </div>
                        <div className="themed-badge-success rounded-full px-3 py-1 text-xs font-semibold">
                          Free now
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="themed-inset rounded-xl p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Best match
                          </p>
                          <p className="mt-2 text-lg font-bold text-[var(--text-main)]">A2-401</p>
                          <p className="mt-1 text-sm text-[var(--text-soft)]">Low occupancy</p>
                        </div>
                        <div className="themed-inset rounded-xl p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Confidence
                          </p>
                          <p className="mt-2 text-lg font-bold text-[var(--text-main)]">94%</p>
                          <p className="mt-1 text-sm text-[var(--text-soft)]">Fresh volunteer signal</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="themed-surface rounded-2xl p-4">
                        <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-soft)]">
                          <span>Study area pulse</span>
                          <span className="text-[var(--text-muted)]">This hour</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            { label: 'Library North', value: 'Quiet', width: '72%', tone: 'bg-emerald-500' },
                            { label: 'Innovation Hub', value: 'Moderate', width: '56%', tone: 'bg-sky-500' },
                            { label: 'Commons', value: 'Busy', width: '84%', tone: 'bg-amber-500' },
                          ].map((bar) => (
                            <div key={bar.label}>
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-[var(--text-main)]">{bar.label}</span>
                                <span className="text-[var(--text-muted)]">{bar.value}</span>
                              </div>
                              <div className="themed-progress-track h-2.5 overflow-hidden rounded-full">
                                <div className={`h-full rounded-full ${bar.tone}`} style={{ width: bar.width }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="themed-surface-muted rounded-2xl p-4">
                        <p className="text-sm font-semibold text-[var(--text-main)]">What makes it feel premium</p>
                        <ul className="mt-4 space-y-3 text-sm text-[var(--text-soft)]">
                          <li className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-text)]" />
                            Unified light and dark theme surfaces
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-text)]" />
                            Clear CTA hierarchy with premium motion
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-text)]" />
                            Calm, readable panels that match internal pages
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-28 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:max-w-3xl">
              <div className="themed-badge-info inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                Why StudyNest
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">
                Designed to feel fast, calm, and trustworthy.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-lg">
                The landing experience now follows the same premium system as the rest of StudyNest:
                softer surfaces, sharper hierarchy, and polished calls to action that still stay lightweight.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon

                return (
                  <article key={feature.title} className="themed-surface rounded-[28px] p-6 sm:p-7">
                    <div className={`inline-flex rounded-2xl p-3 ${feature.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-2xl font-black tracking-tight text-[var(--text-main)]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="themed-hero-surface rounded-[32px] px-6 py-8 text-center sm:px-10 sm:py-10">
              <h2 className="text-3xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">
                Ready to find your next study space?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-lg">
                Join students already using StudyNest to check availability faster, choose better spaces,
                and spend more time studying instead of searching.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <AppLinkButton href="/login/signUP" variant="primary" size="lg">
                  Create Your Account
                </AppLinkButton>
                <AppLinkButton href="/login/signIN" variant="secondary" size="lg">
                  Sign In
                </AppLinkButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--surface-border)] bg-[var(--header-surface-solid)]/90 py-10 text-[var(--text-soft)] backdrop-blur-xl sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.jpeg"
                  alt="StudyNest Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl border border-[var(--surface-border)]"
                />
                <div>
                  <p className="text-lg font-black text-[var(--text-main)]">StudyNest</p>
                  <p className="text-sm text-[var(--text-muted)]">Campus Free Space Finder</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--text-soft)]">
                A premium-feeling campus availability experience for lecture halls and study areas.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Product</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
                <Link href="#features" className="transition hover:text-[var(--text-main)]">Features</Link>
                <Link href="/login/signUP" className="transition hover:text-[var(--text-main)]">Get Started</Link>
                <Link href="/login/signIN" className="transition hover:text-[var(--text-main)]">Sign In</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Company</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
                <Link href="/about" className="transition hover:text-[var(--text-main)]">About</Link>
                <Link href="/login/signUP" className="transition hover:text-[var(--text-main)]">Join StudyNest</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Theme</h3>
              <p className="mt-4 text-sm leading-6 text-[var(--text-soft)]">
                The landing page now follows the same premium light and dark mode language as the redesigned app.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--surface-border)] pt-6 text-center text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} StudyNest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

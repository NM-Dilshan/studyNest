'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import AppBackground from '@/components/AppBackground'
import MainHeader from '@/components/MainHeader'
import RequestForm from '@/components/hall-requests/RequestForm'
import MyRequestsList from '@/components/hall-requests/MyRequestsList'
import AnimatedSection from '@/components/ui/AnimatedSection'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { clearStoredSession, readStoredUser, type ClientUser } from '@/lib/auth/clientUser'

export default function RequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<ClientUser | null>(null)
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const parsedUser = readStoredUser()

    if (!parsedUser) {
      clearStoredSession()
      router.push('/login/signIN')
      return
    }

    setTimeout(() => setUser(parsedUser), 0)
  }, [router])

  if (!isHydrated) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-300" />
            <p className="text-[var(--text-soft)]">Loading...</p>
          </div>
        </div>
      </AppBackground>
    )
  }

  if (!user) {
    return null
  }

  const handleRequestCreated = () => {
    // Trigger refresh of the requests list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <AppBackground>
      <MainHeader />
      <main className="themed-page-main min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatedSection>
          <PageHeader
            eyebrow="Hall Intelligence"
            title="Hall Information Requests"
            subtitle="Create request tickets and track volunteer responses with clear status updates and confidence indicators."
          />
        </AnimatedSection>

        <AnimatedSection className="mt-6" delay={0.04}>
        {user.role === 'student' ? (
          <GlassCard className="themed-panel-info p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--panel-info-text)]" />
              <div>
                <p className="themed-panel-title text-sm font-semibold">
                Welcome, {user.name}!
                </p>
                <p className="themed-panel-copy mt-1 text-sm">
                Use the form below to request real-time information about any lecture hall. Volunteers will respond with
                current status, occupancy, and availability.
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="themed-panel-warning p-4">
            <p className="text-sm">
              As a {user.role}, you can create requests and also earn reputation by responding to requests from others.
              Visit{' '}
              <Link href="/volunteer/requests" className="font-bold underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]">
                the volunteer dashboard
              </Link>{' '}
              to respond to incoming requests.
            </p>
          </GlassCard>
        )}
        </AnimatedSection>

        <AnimatedSection className="mt-8" delay={0.08}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <RequestForm
              userId={user.user_id}
              userRole={user.role as 'student' | 'volunteer'}
              userIdNumber={user.student_id || user.user_id.slice(0, 8)}
              userName={user.name || 'User'}
              onRequestCreated={handleRequestCreated}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-[var(--text-main)]">Your Requests</h2>
                <p className="text-sm text-[var(--text-soft)]">Track responses and submit feedback when volunteers answer your request.</p>
              </div>
              <span className="themed-panel-success inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live Sync
              </span>
            </div>
            <MyRequestsList userId={user.user_id} refreshTrigger={refreshTrigger} />
          </div>
        </div>
        </AnimatedSection>
      </div>
      </main>
    </AppBackground>
    )
}

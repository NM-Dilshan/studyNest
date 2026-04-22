'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Bell, ShieldCheck, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import MainHeader from '@/components/MainHeader'
import VolunteerIncomingRequestList from '@/components/hall-requests/VolunteerIncomingRequestList'
import VolunteerHallForm from '@/components/volunteer/VolunteerHallForm'
import VolunteerSubmissionList from '@/components/volunteer/VolunteerSubmissionList'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import AnimatedSection from '@/components/ui/AnimatedSection'
import StatCard from '@/components/ui/StatCard'
import AppButton from '@/components/ui/AppButton'
import { clearStoredSession, readStoredUser, type ClientUser } from '@/lib/auth/clientUser'

export default function VolunteerRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<ClientUser | null>(null)
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'requests' | 'submit'>('requests')
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const parsedUser = readStoredUser()

    if (!parsedUser) {
      clearStoredSession()
      router.push('/login/signIN')
      return
    }

    if (parsedUser.role !== 'volunteer' && parsedUser.role !== 'admin') {
      router.push('/requests')
      return
    }

    setTimeout(() => setUser(parsedUser), 0)
  }, [router])

  if (!isHydrated) {
    return (
      <div className="themed-page-shell flex min-h-screen items-center justify-center" role="status" aria-live="polite" aria-busy="true">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--button-primary-bg)]" />
          <p className="text-[var(--text-soft)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <MainHeader />
      <main className="themed-page-main min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PageHeader
            title="Volunteer Command Center"
            subtitle="Respond quickly to incoming requests and publish trustworthy hall updates."
            icon={<Bell className="h-7 w-7 text-[var(--accent-text)]" />}
          />

          <AnimatedSection delay={0.05} className="mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title="Volunteer" value={user.name || 'Volunteer'} icon={<ShieldCheck className="h-5 w-5 text-[var(--accent-text)]" />} />
              <StatCard title="Role" value={user.role || 'Volunteer'} icon={<Sparkles className="h-5 w-5 text-[var(--accent-text)]" />} />
              <StatCard title="Session" value="Live" icon={<Bell className="h-5 w-5 text-[var(--accent-text)]" />} />
            </div>
          </AnimatedSection>

          <GlassCard className="themed-panel-info mb-6 p-5">
            <h2 className="themed-panel-title mb-1 text-lg font-semibold">Welcome, {user.name || 'Volunteer'}</h2>
            <p className="themed-panel-copy text-sm">
              Your updates help students find seating fast. Switch between request responses and direct hall updates below.
            </p>
          </GlassCard>

          <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3" role="tablist" aria-label="Volunteer dashboard views">
            <AppButton
              id="volunteer-tab-requests"
              onClick={() => setActiveTab('requests')}
              variant={activeTab === 'requests' ? 'primary' : 'secondary'}
              className="w-full rounded-full"
              role="tab"
              aria-selected={activeTab === 'requests'}
              aria-controls="volunteer-panel-requests"
            >
              Incoming Requests
            </AppButton>
            <AppButton
              id="volunteer-tab-submit"
              onClick={() => setActiveTab('submit')}
              variant={activeTab === 'submit' ? 'primary' : 'secondary'}
              className="w-full rounded-full"
              role="tab"
              aria-selected={activeTab === 'submit'}
              aria-controls="volunteer-panel-submit"
            >
              Submit Hall Update
            </AppButton>
          </div>

          {activeTab === 'requests' ? (
            <motion.section
              key="requests"
              id="volunteer-panel-requests"
              role="tabpanel"
              aria-labelledby="volunteer-tab-requests"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="themed-panel-warning flex items-start gap-3 rounded-xl p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  This dashboard refreshes every 5 seconds so newly created requests appear quickly.
                </p>
              </div>

              <VolunteerIncomingRequestList
                volunteerId={user.user_id}
                refreshTrigger={refreshTrigger}
              />
            </motion.section>
          ) : (
            <motion.section
              key="submit"
              id="volunteer-panel-submit"
              role="tabpanel"
              aria-labelledby="volunteer-tab-submit"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <div className="space-y-6 lg:col-span-2">
                <VolunteerHallForm
                  volunteerId={user.user_id}
                  onSubmitSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                />

                <GlassCard className="p-5">
                  <h3 className="mb-3 text-base font-semibold text-[var(--text-main)]">Tips for Accurate Updates</h3>
                  <ul className="space-y-2 text-sm text-[var(--text-soft)]">
                    <li>Submit updates only when you have current hall visibility.</li>
                    <li>Match occupancy and seat counts consistently for higher trust.</li>
                    <li>Use shorter validity windows when the hall changes quickly.</li>
                    <li>Add notes for events, maintenance, or special constraints.</li>
                  </ul>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard className="p-5 lg:sticky lg:top-20">
                  <h3 className="mb-3 text-base font-semibold text-[var(--text-main)]">Status Guide</h3>
                  <div className="space-y-2 text-sm text-[var(--text-soft)]">
                    <p><span className="font-semibold text-emerald-600">Free:</span> plenty of seats.</p>
                    <p><span className="font-semibold text-amber-600">Partially Busy:</span> some seats available.</p>
                    <p><span className="font-semibold text-rose-500">Busy:</span> few seats left.</p>
                    <p><span className="font-semibold text-red-600">Full:</span> no seats available.</p>
                  </div>
                </GlassCard>

                <VolunteerSubmissionList volunteerId={user.user_id} refreshTrigger={refreshTrigger} />
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </>
  )
}

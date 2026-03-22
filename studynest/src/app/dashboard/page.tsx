// app/dashboard/page.tsx
import { createClient, isSupabaseConfigured } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import SpaceCard from '@/components/SpaceCard'

type Rating = {
  is_accurate: boolean
}

type Report = {
  ratings?: Rating[]
  profiles?: {
    reputation?: number
  } | null
}

type Space = {
  id: string | number
  reports?: Report[]
  [key: string]: unknown
}

export default async function Dashboard() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-xl font-semibold">Supabase is not configured</h1>
          <p className="mt-2 text-sm">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env to enable authentication and dashboard data.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch spaces with latest active report
  const { data: spaces, error } = await supabase
    .from('spaces')
    .select(`
      *,
      reports!inner (
        *,
        profiles!user_id (reputation),
        ratings (*)
      )
    `)
    .eq('reports.is_active', true)
    .gt('reports.expires_at', new Date().toISOString())
    .order('reports.timestamp', { ascending: false, foreignTable: 'reports' })
    .limit(1, { foreignTable: 'reports' })

  // Compute confidence
  const computeConfidence = (ratings: Rating[]) => {
    if (!ratings.length) return 50
    const accurate = ratings.filter(r => r.is_accurate).length
    return Math.round((accurate / ratings.length) * 100)
  }

  const typedSpaces = (spaces ?? []) as Space[]

  const enrichedSpaces = typedSpaces.map(space => ({
    ...space,
    currentReport: space.reports?.[0] ? {
      ...space.reports[0],
      confidence: computeConfidence(space.reports[0].ratings || []),
      reporterReputation: space.reports[0].profiles?.reputation ?? 0
    } : null
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">StudyNest</h1>
            <p className="mt-1 text-sm text-gray-600">Find your perfect study space</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedSpaces?.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      </main>
    </div>
  )
}
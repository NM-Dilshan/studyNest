import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StudyAreaCard from '@/components/StudyAreaCard'

export default async function StudyAreasPage() {
  let user = null
  let profile = null
  let studyAreas = []
  let buildings: string[] = []

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">StudyNest</h1>
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">Configuration Required</h2>
            <p className="text-yellow-800">Please configure your Supabase credentials in .env.local to view study areas.</p>
          </div>
        </main>
      </div>
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')
    user = authUser
  } catch (error) {
    redirect('/login')
  }

  // Fetch user profile for name
  try {
    const supabase = await createClient()
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    profile = userProfile
  } catch (error) {
    console.error('Error fetching profile:', error)
  }

  // Fetch all study areas with their latest active update
  try {
    const supabase = await createClient()
    const { data: areas } = await supabase
      .from('study_areas')
      .select(`
        *,
        area_updates:volunteer_study_area_updates (
          *,
          profiles!user_id (name, reputation),
          reviews:volunteer_reviews (*)
        )
      `)
      .eq('is_active', true)
      .order('area_name', { ascending: true })
    
    studyAreas = areas || []
  } catch (error) {
    console.error('Error fetching study areas:', error)
    studyAreas = []
  }

  // For each study area, get the most recent valid update
  const processedAreas = studyAreas?.map(area => {
    // Filter active, non-expired updates
    const activeUpdates = area.area_updates?.filter((update: { is_active: boolean; expires_at: string | number | Date }) => 
      update.is_active === true && 
      new Date(update.expires_at) > new Date()
    ) || []
    
    // Get the most recent
    const latestUpdate = activeUpdates.sort((a: { created_at: string | number | Date }, b: { created_at: string | number | Date }) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    // Compute confidence from reviews
    const computeConfidence = (reviews: any[]) => {
      if (!reviews?.length) return null
      const accurate = reviews.filter(r => r.is_accurate).length
      return Math.round((accurate / reviews.length) * 100)
    }

    return {
      ...area,
      currentUpdate: latestUpdate ? {
        crowd_status: latestUpdate.crowd_status,
        estimated_people: latestUpdate.estimated_people,
        available_seats: latestUpdate.available_seats,
        confidence: computeConfidence(latestUpdate.reviews),
        reporter_name: latestUpdate.profiles?.name,
        reporter_reputation: latestUpdate.profiles?.reputation,
        reported_at: latestUpdate.created_at,
        update_id: latestUpdate.area_update_id,
      } : null
    }
  }) || []

  // Get unique buildings for filter (optional)
  buildings = [...new Set(processedAreas?.map(area => area.building).filter(Boolean))]

  // Stats for hero
  const totalAreas = processedAreas?.length || 0
  const areasWithUpdates = processedAreas?.filter(a => a.currentUpdate)?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/home" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">StudyNest</h1>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex space-x-6">
              <Link href="/home" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/spaces" className="text-gray-600 hover:text-gray-900">All Spaces</Link>
              <Link href="/study-areas" className="text-indigo-600 font-medium">Study Areas</Link>
              <Link href="/lecture-halls" className="text-gray-600 hover:text-gray-900">Lecture Halls</Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">
                Hello, {profile?.name?.split(' ')[0] || 'Student'}
              </span>
              <form action="/api/auth/signout" method="post">
                <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Areas</h1>
          <p className="text-gray-600 mt-2">
            Find quiet zones, group study spots, and AC‑cooled spaces across campus.
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              📍 {totalAreas} areas total
            </span>
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              🟢 {areasWithUpdates} with live updates
            </span>
          </div>
        </div>

        {/* Filter Bar (optional) */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <select className="border rounded-md px-3 py-1.5 text-sm">
            <option>All buildings</option>
            {buildings.map(b => <option key={b}>{b}</option>)}
          </select>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" className="rounded" /> Quiet zone only
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" className="rounded" /> With AC
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" className="rounded" /> Charging ports
          </label>
        </div>

        {/* Study Areas Grid */}
        {processedAreas?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No study areas found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedAreas?.map((area) => (
              <StudyAreaCard key={area.study_area_id} area={area} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
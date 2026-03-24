'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudyAreaCard({ area }: { area: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [requestLoading, setRequestLoading] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)

  const current = area.currentUpdate

  // Status badge colours
  const statusColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    full: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800',
  }

  const statusLabel: Record<string, string> = {
    low: 'Low Crowd',
    medium: 'Moderate',
    high: 'Busy',
    full: 'Full',
    unknown: 'Unknown',
  }

  const handleRequestUpdate = async () => {
    setRequestLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { error } = await supabase.from('update_request_pings').insert([{
      student_id: user.id,
      study_area_id: area.study_area_id,
      status: 'Pending',
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }] as any)
    if (error) alert(error.message)
    else alert('Update requested – volunteers have been notified.')
    setRequestLoading(false)
  }

  const handleRate = async (isAccurate: boolean) => {
    if (!current) return
    setRatingLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { error } = await supabase.from('volunteer_reviews').insert([{
      student_id: user.id,
      volunteer_id: area.currentUpdate?.reporter_reputation, // This is not the volunteer ID – need to fetch separately
      area_update_id: current.update_id,
      rating: isAccurate ? 5 : 1,
      is_accurate: isAccurate,
      comment: null,
    }] as any)
    if (error) alert(error.message)
    else alert('Thank you for your feedback!')
    setRatingLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{area.area_name}</h3>
          {area.silent_zone && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              🔇 Quiet Zone
            </span>
          )}
        </div>

        {area.building && (
          <p className="text-sm text-gray-500 mb-3">
            📍 {area.building}, Floor {area.floor || '?'}
          </p>
        )}

        {/* Features icons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {area.wifi && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📶 Wi-Fi</span>
          )}
          {area.ac && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">❄️ AC</span>
          )}
          {area.charging_ports && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🔌 Charging</span>
          )}
          {area.capacity && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              🪑 Capacity: {area.capacity}
            </span>
          )}
        </div>

        {current ? (
          <>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[current.crowd_status?.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100'}`}>
                  {statusLabel[current.crowd_status?.toLowerCase() as keyof typeof statusLabel] || current.crowd_status}
                </span>
                {current.available_seats && (
                  <span className="text-sm text-gray-500">
                    {current.available_seats} seats free
                  </span>
                )}
              </div>
              {current.confidence && (
                <span className="text-xs text-gray-400">⚡ {current.confidence}% accurate</span>
              )}
            </div>

            {current.reported_at && (
              <p className="text-xs text-gray-400 mt-2">
                Reported by {current.reporter_name || 'volunteer'} • {new Date(current.reported_at).toLocaleString()}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleRate(true)}
                disabled={ratingLoading}
                className="flex-1 bg-green-50 text-green-700 text-sm font-medium py-1.5 rounded-md hover:bg-green-100 transition"
              >
                Accurate
              </button>
              <button
                onClick={() => handleRate(false)}
                disabled={ratingLoading}
                className="flex-1 bg-red-50 text-red-700 text-sm font-medium py-1.5 rounded-md hover:bg-red-100 transition"
              >
                Inaccurate
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No recent updates – request a fresh report.</p>
        )}

        <button
          onClick={handleRequestUpdate}
          disabled={requestLoading}
          className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 border-t border-gray-100 transition"
        >
          {requestLoading ? 'Requesting...' : 'Request update'}
        </button>
      </div>
    </div>
  )
}
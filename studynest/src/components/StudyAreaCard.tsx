'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wifi, Coffee, MapPin, Users, Wind } from 'lucide-react'

export default function StudyAreaCard({ area }: { area: any }) {
  const router = useRouter()
  const [requestLoading, setRequestLoading] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [currentCount, setCurrentCount] = useState(area.occupancy?.[0]?.current_count || 0)
  const [status, setStatus] = useState<'low' | 'medium' | 'high'>(
    area.occupancy?.[0] ? getStatus(area.occupancy[0].current_count, area.capacity) : 'low'
  )

  const current = area.currentUpdate

  function getStatus(count: number, capacity: number): 'low' | 'medium' | 'high' {
    if (!capacity) return 'low'
    const percent = (count / capacity) * 100
    if (percent > 70) return 'high'
    if (percent > 30) return 'medium'
    return 'low'
  }

  // Status badge colours
  const statusColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  const statusLabel = {
    low: 'Low Crowd',
    medium: 'Moderate',
    high: 'Busy',
  }

  const percent = area.capacity ? (currentCount / area.capacity) * 100 : 0
  const available = area.capacity ? area.capacity - currentCount : 0

  const handleRequestUpdate = async () => {
    setRequestLoading(true)
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login/signIN')
      return
    }
    
    try {
      const user = JSON.parse(userData)
      const response = await fetch('/api/study-areas/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.user_id,
          study_area_id: area.study_area_id,
          status: 'Pending',
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        }),
      })
      
      if (response.ok) {
        alert('Update requested – volunteers have been notified.')
      } else {
        alert('Failed to submit request')
      }
    } catch (error) {
      alert('Error submitting request')
      console.error(error)
    }
    setRequestLoading(false)
  }

  const handleRate = async (isAccurate: boolean) => {
    if (!current) return
    setRatingLoading(true)
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login/signIN')
      return
    }

    try {
      const user = JSON.parse(userData)
      const response = await fetch('/api/study-areas/rate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.user_id,
          volunteer_id: current?.reporter_reputation,
          area_update_id: current.update_id,
          rating: isAccurate ? 5 : 1,
          is_accurate: isAccurate,
          comment: null,
        }),
      })
      
      if (response.ok) {
        alert('Thank you for your feedback!')
      } else {
        alert('Failed to submit rating')
      }
    } catch (error) {
      alert('Error submitting rating')
      console.error(error)
    }
    setRatingLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{area.area_name}</span>
            </div>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {statusLabel[status]}
            </span>
          </div>
          {area.silent_zone && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              🔇 Quiet
            </span>
          )}
        </div>

        {area.building && (
          <p className="text-sm text-gray-500 mb-3">
            {area.building}, Floor {area.floor || '?'}
          </p>
        )}

        {/* Real-time Occupancy */}
        {area.capacity && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Occupancy</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-300" 
                style={{ width: `${percent}%` }} 
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {currentCount} / {area.capacity} students  •  {available} seats available
            </p>
          </div>
        )}

        {/* Features icons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {area.wifi && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Wifi className="h-3 w-3" /> Wi-Fi</span>}
          {area.silent_zone && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Users className="h-3 w-3" /> Quiet Zone</span>}
          {area.cafe && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Coffee className="h-3 w-3" /> Café</span>}
          {area.ac && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Wind className="h-3 w-3" /> AC</span>}
        </div>

        {current ? (
          <>
            <div className="mt-4">
              <p className="text-xs text-gray-400">
                Updated {area.occupancy?.updated_at ? new Date(area.occupancy.updated_at).toLocaleTimeString() : 'recently'}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleRate(true)}
                disabled={ratingLoading}
                className="flex-1 bg-green-50 text-green-700 text-xs font-medium py-1.5 rounded-md hover:bg-green-100 transition disabled:opacity-50"
              >
                Accurate
              </button>
              <button
                onClick={() => handleRate(false)}
                disabled={ratingLoading}
                className="flex-1 bg-red-50 text-red-700 text-xs font-medium py-1.5 rounded-md hover:bg-red-100 transition disabled:opacity-50"
              >
                Inaccurate
              </button>
            </div>
          </>
        ) : (
          <p className="mt-4 text-xs text-gray-500">No recent volunteer updates.</p>
        )}

        <button
          onClick={handleRequestUpdate}
          disabled={requestLoading}
          className="mt-3 w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-2 border-t border-gray-100 transition disabled:opacity-50"
        >
          {requestLoading ? 'Requesting...' : 'Request update'}
        </button>
      </div>
    </div>
  )
}
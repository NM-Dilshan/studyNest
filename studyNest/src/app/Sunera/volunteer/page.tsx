'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VolunteerRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new merged volunteer dashboard
    router.push('/volunteer/requests')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E6F95] mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to Volunteer Dashboard...</p>
      </div>
    </div>
  )
}

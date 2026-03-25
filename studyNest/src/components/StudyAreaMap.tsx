'use client'

interface StudyArea {
  id: string
  name: string
  lat: number
  lng: number
  radius_meters: number
}

interface StudyAreaMapProps {
  areas: StudyArea[]
  token: string
  occupancy: Record<string, number>
}

export default function StudyAreaMap({ areas, token, occupancy }: StudyAreaMapProps) {
  return (
    <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Study Area Map</p>
        <p className="text-sm text-gray-500">({areas.length} areas)</p>
      </div>
    </div>
  )
}

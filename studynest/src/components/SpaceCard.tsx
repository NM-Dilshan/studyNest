type Space = {
  id: string | number
  name?: string
  location?: string
  currentReport?: {
    confidence?: number
    reporterReputation?: number
  } | null
}

type SpaceCardProps = {
  space: Space
}

export default function SpaceCard({ space }: SpaceCardProps) {
  const confidence = space.currentReport?.confidence ?? 50
  const reputation = space.currentReport?.reporterReputation ?? 0
  
  // Determine status based on confidence
  const getStatusColor = (conf: number) => {
    if (conf >= 80) return 'bg-green-100 text-green-800'
    if (conf >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusText = (conf: number) => {
    if (conf >= 80) return 'Available'
    if (conf >= 60) return 'Moderate'
    return 'Crowded'
  }

  return (
    <article className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{space.name ?? `Space ${space.id}`}</h2>
            <p className="text-sm text-gray-600 flex items-center">
              <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {space.location ?? 'Location unavailable'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(confidence)}`}>
            {getStatusText(confidence)}
          </span>
        </div>

        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-700">Confidence Level</span>
            <span className="text-sm font-bold text-indigo-600">{confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Reporter Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {reputation > 0 ? '⭐' : '👤'}
              </div>
              <div>
                <p className="text-xs text-gray-600">Reporter</p>
                <p className="text-sm font-bold text-gray-900">Rep: {reputation}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

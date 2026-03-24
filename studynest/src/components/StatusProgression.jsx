'use client'

export function StatusProgression({ currentStatus }) {
  // Define the status progression flow
  const statuses = ['Pending', 'Viewed', 'In Progress', 'Resolved']
  
  const statusConfig = {
    'Pending': {
      icon: '📝',
      color: '#FFC107',
      bgColor: '#FFF9E6',
      textColor: '#F39C12',
      label: 'Pending'
    },
    'Viewed': {
      icon: '✓',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      textColor: '#1976D2',
      label: 'Viewed'
    },
    'In Progress': {
      icon: '⚙️',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      textColor: '#F57C00',
      label: 'In Progress'
    },
    'Resolved': {
      icon: '✓✓',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      textColor: '#388E3C',
      label: 'Resolved'
    }
  }

  // Determine current index
  const currentIndex = statuses.indexOf(currentStatus) >= 0 ? statuses.indexOf(currentStatus) : 0
  
  const getStepStatus = (index) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <p className="text-xs text-gray-600 font-semibold mb-4 uppercase">Progress</p>
      
      {/* Horizontal Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center gap-2">
          {statuses.map((status, index) => {
            const stepStatus = getStepStatus(index)
            const config = statusConfig[status]
            const isCompleted = stepStatus === 'completed'
            const isCurrent = stepStatus === 'current'
            
            return (
              <div key={status} className="flex-1 flex items-center">
                {/* Status Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    font-bold text-lg flex-shrink-0 transition-all
                    ${isCurrent ? 'ring-4 ring-offset-2 scale-110' : ''}
                  `}
                  style={{
                    backgroundColor: isCompleted || isCurrent ? config.color : '#E0E0E0',
                    color: isCompleted || isCurrent ? 'white' : '#999',
                    ringColor: config.color
                  }}
                >
                  {config.icon}
                </div>

                {/* Connecting Line */}
                {index < statuses.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-2 transition-all"
                    style={{
                      backgroundColor: index < currentIndex ? config.color : '#E0E0E0'
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Status Labels */}
        <div className="flex justify-between mt-3">
          {statuses.map((status) => (
            <div key={`label-${status}`} className="flex-1">
              <p className="text-xs text-center font-medium text-gray-700">
                {status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Card */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: statusConfig[currentStatus].bgColor,
          borderLeft: `4px solid ${statusConfig[currentStatus].color}`
        }}
      >
        <div style={{ color: statusConfig[currentStatus].textColor }}>
          <p className="text-sm font-bold mb-1">
            {statusConfig[currentStatus].icon} {currentStatus}
          </p>
          <p className="text-xs opacity-75">
            {currentStatus === 'Pending' && 'Your complaint has been received and is waiting for review'}
            {currentStatus === 'Viewed' && 'Your complaint has been reviewed and acknowledged'}
            {currentStatus === 'In Progress' && 'Maintenance team is actively working on your issue'}
            {currentStatus === 'Resolved' && 'Your issue has been fixed and verified'}
          </p>
        </div>
      </div>
    </div>
  )
}

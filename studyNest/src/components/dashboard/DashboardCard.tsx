// Reusable dashboard card wrapper component

interface DashboardCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
}

export default function DashboardCard({
  title,
  description,
  children,
  className = '',
  headerAction,
}: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {(title || description || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          {headerAction && <div className="ml-4">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

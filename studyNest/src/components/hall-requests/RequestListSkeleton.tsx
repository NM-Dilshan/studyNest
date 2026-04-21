import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

export default function RequestListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true" aria-label="Loading your requests">
      <p className="sr-only">Loading your requests</p>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="themed-surface rounded-2xl p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="w-full max-w-sm space-y-2">
              <LoadingSkeleton className="h-5 w-2/3" />
              <LoadingSkeleton className="h-4 w-3/4" />
            </div>
            <LoadingSkeleton className="h-7 w-24 rounded-full" />
          </div>
          <LoadingSkeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

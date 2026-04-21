import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

export default function RequestListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true" aria-label="Loading your requests">
      <p className="sr-only">Loading your requests</p>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/15 bg-slate-950/55 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="w-full max-w-sm space-y-2">
              <LoadingSkeleton className="h-5 w-2/3 bg-slate-700/50" />
              <LoadingSkeleton className="h-4 w-3/4 bg-slate-700/50" />
            </div>
            <LoadingSkeleton className="h-7 w-24 rounded-full bg-slate-700/50" />
          </div>
          <LoadingSkeleton className="h-16 w-full bg-slate-700/50" />
        </div>
      ))}
    </div>
  )
}

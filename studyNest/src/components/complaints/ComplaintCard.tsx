'use client'

interface ComplaintCardProps {
  complaintId: number
  title: string
  location: string
  description: string
  status: string
  priority?: string
  createdAt: string
  complaintIdsForGroup?: number[]
  children?: React.ReactNode
}

/**
 * Reusable complaint card with scroll/highlight target attributes.
 */
export default function ComplaintCard({
  complaintId,
  title,
  location,
  description,
  status,
  priority,
  createdAt,
  complaintIdsForGroup = [],
  children,
}: ComplaintCardProps) {
  return (
    <article
      id={`complaint-${complaintId}`}
      data-complaint-ids={complaintIdsForGroup.map((id) => `|${id}|`).join('')}
      className="rounded-[24px] border border-white/70 bg-[var(--bg-glass)] backdrop-blur-md p-5 shadow-[0_16px_38px_rgba(30,41,59,0.08)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-emerald-600">{location}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Complaint ID: <span className="font-semibold">#{complaintId}</span>
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
        </div>
        {priority && (
          <span className="px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide bg-rose-50 text-rose-700 border-rose-200">
            {priority}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-bold text-slate-800">Status:</span> {status}
        </p>
        <p>
          <span className="font-bold text-slate-800">Date:</span>{' '}
          {new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString()}
        </p>
        <p>
          <span className="font-bold text-slate-800">Description:</span> {description}
        </p>
      </div>

      {children ? <div className="mt-4 pt-4 border-t border-slate-200/80">{children}</div> : null}
    </article>
  )
}

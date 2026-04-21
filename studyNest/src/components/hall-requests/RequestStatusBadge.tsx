import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'

interface RequestStatusBadgeProps {
  status: string
}

const statusIconMap = [
  { match: 'responded', status: 'Responded', Icon: CheckCircle2 },
  { match: 'pending', status: 'Pending', Icon: Clock3 },
  { match: 'expired', status: 'Expired', Icon: XCircle },
] as const

export default function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const normalized = status.toLowerCase()
  const matched = statusIconMap.find((item) => normalized.includes(item.match))
  const Icon = matched?.Icon || XCircle
  const displayStatus = matched?.status || status

  return (
    <StatusBadge status={displayStatus} className="inline-flex items-center gap-1 normal-case tracking-normal">
      <Icon className="h-3.5 w-3.5" />
    </StatusBadge>
  )
}

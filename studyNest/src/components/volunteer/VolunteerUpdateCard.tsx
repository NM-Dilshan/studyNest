import { Edit2, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/ui/StatusBadge'
import AppButton from '@/components/ui/AppButton'

interface Submission {
  hall_update_id: number
  volunteer_id: string
  hall_id: string
  availability_status: string
  occupancy_level?: string
  available_seats?: number
  note?: string
  created_at: string
  expires_at: string
  isExpired: boolean
  lecture_halls: {
    hall_id: string
    hall_name: string
    building?: string
    floor?: number
  }
}

interface VolunteerUpdateCardProps {
  submission: Submission
  timeRemainingText?: string
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function VolunteerUpdateCard({
  submission,
  timeRemainingText,
  deleting,
  onEdit,
  onDelete,
}: VolunteerUpdateCardProps) {
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`rounded-xl border p-4 ${submission.isExpired ? 'themed-inset' : 'themed-inset-strong'}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[var(--text-main)]">{submission.lecture_halls.hall_name}</h4>
          <p className="text-xs text-[var(--text-soft)]">
            {submission.lecture_halls.building && `${submission.lecture_halls.building}`}
            {submission.lecture_halls.floor && ` • Floor ${submission.lecture_halls.floor}`}
          </p>
        </div>
        <StatusBadge status={submission.isExpired ? 'Expired' : 'Active'} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <StatusBadge status={submission.availability_status} />
        {submission.occupancy_level ? <StatusBadge status={submission.occupancy_level} /> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-soft)] sm:grid-cols-4">
        {submission.available_seats !== null && submission.available_seats !== undefined ? (
          <div>
            <p className="text-[var(--text-muted)]">Available Seats</p>
            <p className="font-semibold text-[var(--text-main)]">{submission.available_seats}</p>
          </div>
        ) : null}
        <div>
          <p className="text-[var(--text-muted)]">Created</p>
          <p className="font-semibold text-[var(--text-main)]">{formatTime(submission.created_at)}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Expires</p>
          <p className="font-semibold text-[var(--text-main)]">{formatTime(submission.expires_at)}</p>
        </div>
        {!submission.isExpired ? (
          <div>
            <p className="text-[var(--text-muted)]">Time Left</p>
            <p className="font-semibold text-[var(--text-main)]">{timeRemainingText || '-'}</p>
          </div>
        ) : null}
      </div>

      {submission.note ? (
        <div className="themed-inset mt-3 rounded-lg p-2">
          <p className="text-xs text-[var(--text-soft)]">{submission.note}</p>
        </div>
      ) : null}

      {!submission.isExpired ? (
        <div className="mt-3 flex gap-2 border-t border-[var(--surface-border)] pt-3">
          <AppButton onClick={onEdit} className="flex-1" variant="primary" size="sm">
            <Edit2 className="h-4 w-4" />
            Edit
          </AppButton>
          <AppButton onClick={onDelete} disabled={deleting} className="flex-1" variant="danger" size="sm">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </AppButton>
        </div>
      ) : null}
    </motion.div>
  )
}

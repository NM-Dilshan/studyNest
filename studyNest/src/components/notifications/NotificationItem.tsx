'use client'

import { useRouter } from 'next/navigation'
import { Clock3, MapPin } from 'lucide-react'
import { ComplaintNotification, useNotifications } from '@/contexts/NotificationContext'

interface NotificationItemProps {
  notification: ComplaintNotification
  onClose?: () => void
}

function formatTimeAgo(date: Date) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter()
  const { markAsRead } = useNotifications()

  const handleClick = () => {
    markAsRead(notification.id)
    onClose?.()
    router.push(`/admin/complaints?highlight=${notification.complaint_id}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-3 border-b border-gray-100 hover:bg-slate-50 transition-colors ${
        notification.isImmediateFix
          ? notification.isRead
            ? 'bg-red-50/50 border-red-100'
            : 'bg-red-100/70 border-red-200'
          : notification.isRead
            ? 'bg-white'
            : 'bg-blue-50/50'
      }`}
    >
      <div className="flex items-start gap-2">
        {!notification.isRead && (
          <span
            className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
              notification.isImmediateFix ? 'bg-red-600' : 'bg-blue-600'
            }`}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">{notification.title}</p>
            {notification.isImmediateFix && (
              <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Immediately Fix
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.description}</p>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {notification.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

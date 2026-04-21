'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { useOptionalNotifications } from '@/contexts/NotificationContext'

interface HallRequestNotification {
  notification_id: number
  user_id: string
  title: string
  message: string
  notification_type?: string
  is_read: boolean
  created_at: string
}

interface NotificationBellProps {
  notifications?: HallRequestNotification[]
  unreadCount?: number
  userRole?: 'student' | 'volunteer' | 'admin'
  onMarkAsRead?: (id: number) => Promise<void>
  onMarkAllAsRead?: () => Promise<void>
  onDeleteNotification?: (id: number) => Promise<void>
}

export default function NotificationBell({
  notifications = [],
  unreadCount = 0,
  userRole = 'student',
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const optionalNotifications = useOptionalNotifications()
  const complaintNotifications = optionalNotifications?.notifications || []
  const complaintUnreadCount = optionalNotifications?.unreadCount || 0

  // Combine both notification types
  const totalUnreadCount = unreadCount + complaintUnreadCount
  const isVolunteer = userRole === 'volunteer'

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative rounded-xl border border-[var(--header-border)] bg-[var(--header-button-bg)] p-2 text-[var(--header-text-soft)] transition hover:bg-[var(--header-button-hover)] hover:text-[var(--header-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]"
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {totalUnreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] overflow-hidden rounded-xl border border-[var(--header-border)] bg-[var(--header-surface-solid)] shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-[var(--header-border)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--header-text)]">Notifications</h3>
            <span className="text-xs text-[var(--header-text-muted)]">{totalUnreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Hall Request Notifications (only for volunteers) */}
            {isVolunteer && notifications.length > 0 && (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`border-b border-[var(--header-border)] px-4 py-3 transition ${
                      !notification.is_read ? 'bg-[var(--header-accent-bg)]' : 'hover:bg-[var(--header-button-hover)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--header-text)]">{notification.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--header-text-soft)]">{notification.message}</p>
                        <p className="mt-1 text-xs text-[var(--header-text-muted)]">{formatTime(notification.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.is_read && onMarkAsRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.notification_id)}
                            className="rounded p-1 text-[var(--header-accent-text)] transition hover:bg-[var(--header-accent-bg)]"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {onDeleteNotification && (
                          <button
                            onClick={() => onDeleteNotification(notification.notification_id)}
                            className="rounded p-1 text-[var(--header-text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty State */}
            {notifications.length === 0 && complaintNotifications.length === 0 && (
              <div className="p-6 text-center text-sm text-[var(--header-text-muted)]">No notifications yet</div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-t border-[var(--header-border)] bg-[var(--header-button-bg)] px-3 py-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--header-border)] px-3 py-1.5 text-xs font-semibold text-[var(--header-text-soft)] hover:bg-[var(--header-button-hover)]"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
              {isVolunteer && notifications.length > 0 && (
                <a
                  href="/volunteer/requests"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--header-accent-border)] px-3 py-1.5 text-xs font-semibold text-[var(--header-accent-text)] hover:bg-[var(--header-accent-bg)]"
                >
                  View requests →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

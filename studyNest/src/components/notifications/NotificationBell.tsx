'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import NotificationDropdownList from './NotificationDropdownList'
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
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <span className="text-xs text-slate-500">{totalUnreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Hall Request Notifications (only for volunteers) */}
            {isVolunteer && notifications.length > 0 && (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.is_read && onMarkAsRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.notification_id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {onDeleteNotification && (
                          <button
                            onClick={() => onDeleteNotification(notification.notification_id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
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
              <div className="p-6 text-center text-sm text-slate-500">No notifications yet</div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-md border border-slate-200"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
              {isVolunteer && notifications.length > 0 && (
                <a
                  href="/volunteer/requests"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-white rounded-md border border-blue-200"
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

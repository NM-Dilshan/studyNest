'use client'

import { CheckCheck, Trash2 } from 'lucide-react'
import { ComplaintNotification } from '@/contexts/NotificationContext'
import NotificationItem from './NotificationItem'

interface NotificationDropdownListProps {
  notifications: ComplaintNotification[]
  unreadCount: number
  onClose: () => void
  onMarkAllRead: () => void
  onClearAll: () => void
}

export default function NotificationDropdownList({
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onClearAll,
}: NotificationDropdownListProps) {
  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <span className="text-xs text-slate-500">{unreadCount} unread</span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No complaint notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onClose={onClose} />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-md border border-slate-200"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-white rounded-md border border-red-200"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useHallRequestNotifications } from '@/hooks/useHallRequestNotifications'
import NotificationBell from './NotificationBell'

interface NotificationBellWrapperProps {
  userId: string
  userRole: 'student' | 'volunteer' | 'admin'
}

export default function NotificationBellWrapper({ userId, userRole }: NotificationBellWrapperProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useHallRequestNotifications(userId, userRole)

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      userRole={userRole}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onDeleteNotification={deleteNotification}
    />
  )
}

import { useCallback, useEffect, useState } from 'react'

export interface Notification {
  notification_id: number
  user_id: string
  title: string
  message: string
  notification_type?: string
  is_read: boolean
  created_at: string
}

export function useHallRequestNotifications(userId: string | null, userRole: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!userId || userRole !== 'volunteer') {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, userRole])

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 10 seconds for volunteers
    if (userRole === 'volunteer') {
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [userId, userRole, fetchNotifications])

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
        })

        if (response.ok) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) =>
              n.notification_id === notificationId ? { ...n, is_read: true } : n
            )
          )
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    []
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [userId])

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AppNotificationType = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: AppNotificationType
  isRead: boolean
  createdAt: string
}

interface AddNotificationInput {
  title: string
  message: string
  type?: AppNotificationType
}

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (input: AddNotificationInput) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const addNotification = ({ title, message, type = 'info' }: AddNotificationInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    setNotifications((prev) => [
      {
        id,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
    }),
    [notifications, unreadCount]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }

  return context
}

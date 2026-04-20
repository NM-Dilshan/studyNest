'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildComplaintNotification } from '@/utils/notificationService'

export interface ComplaintNotification {
  id: string
  notification_key?: string
  complaint_id: number
  title: string
  location: string
  category: string
  description: string
  timestamp: Date
  isRead: boolean
  readAt?: Date
  isImmediateFix?: boolean
  hall_id?: string
  study_area_id?: string
}

type ComplaintPayload = {
  complaint_id: number | string
  issue_category?: string
  description?: string
  created_at?: string
  complaint_count?: number | string
  lecture_halls?: { hall_name?: string } | null
  study_areas?: { area_name?: string } | null
  hall_id?: string | null
  study_area_id?: string | null
}

interface NotificationContextType {
  notifications: ComplaintNotification[]
  unreadCount: number
  addNotification: (notification: Omit<ComplaintNotification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const makeNotificationId = () => `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([])
  const notificationsRef = useRef<ComplaintNotification[]>([])
  const dismissedIdsRef = useRef<Set<number>>(new Set())
  const readStateRef = useRef<Map<number, string>>(new Map())
  const persistedStateLoadedRef = useRef(false)

  const DISMISSED_STORAGE_KEY = 'studynest:dismissed-complaint-notifications'
  const READ_STATE_STORAGE_KEY = 'studynest:read-complaint-notifications'

  const persistDismissedIds = useCallback(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      DISMISSED_STORAGE_KEY,
      JSON.stringify(Array.from(dismissedIdsRef.current))
    )
  }, [])

  const persistReadState = useCallback(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      READ_STATE_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(readStateRef.current.entries()))
    )
  }, [])

  const ensurePersistedStateLoaded = useCallback(() => {
    if (typeof window === 'undefined') return
    if (persistedStateLoadedRef.current) return

    try {
      const raw = window.localStorage.getItem(DISMISSED_STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          parsed.forEach((value) => {
            const id = Number(value)
            if (!Number.isNaN(id) && id > 0) {
              dismissedIdsRef.current.add(id)
            }
          })
        }
      }
    } catch {
      // Ignore local storage parse issues.
    }

    try {
      const rawRead = window.localStorage.getItem(READ_STATE_STORAGE_KEY)
      if (rawRead) {
        const parsed: unknown = JSON.parse(rawRead)
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
            const complaintId = Number(key)
            if (Number.isNaN(complaintId) || complaintId <= 0) return
            if (typeof value !== 'string') return
            readStateRef.current.set(complaintId, value)
          })
        }
      }
    } catch {
      // Ignore local storage parse issues.
    }

    persistedStateLoadedRef.current = true
  }, [])

  const addNotification = useCallback(
    (notification: Omit<ComplaintNotification, 'id' | 'timestamp' | 'isRead'>) => {
      setNotifications((prev) => {
        // Dedupe by complaint id + title to avoid repeated inserts.
        const duplicate = prev.some(
          (n) => n.complaint_id === notification.complaint_id && n.title === notification.title
        )
        if (duplicate) return prev

        const next: ComplaintNotification = {
          ...notification,
          notification_key:
            notification.hall_id
              ? `hall:${notification.hall_id}`
              : notification.study_area_id
                ? `study:${notification.study_area_id}`
                : `complaint:${notification.complaint_id}`,
          id: makeNotificationId(),
          timestamp: new Date(),
          isRead: false,
          isImmediateFix: notification.isImmediateFix ?? false,
        }

        return [next, ...prev]
      })
    },
    []
  )

  const markAsRead = useCallback((id: string) => {
    const now = new Date()
    const target = notificationsRef.current.find((n) => n.id === id)
    if (target) {
      readStateRef.current.set(target.complaint_id, now.toISOString())
      persistReadState()
    }

    setNotifications((prev) =>
      prev.map((n) => {
        return n.id === id ? { ...n, isRead: true, readAt: now } : n
      })
    )
  }, [persistReadState])

  const markAllAsRead = useCallback(() => {
    const now = new Date()
    notificationsRef.current.forEach((n) => {
      if (!n.isRead) {
        readStateRef.current.set(n.complaint_id, now.toISOString())
      }
    })
    persistReadState()

    setNotifications((prev) =>
      prev.map((n) => {
        return n.isRead ? n : { ...n, isRead: true, readAt: now }
      })
    )
  }, [persistReadState])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    readStateRef.current.clear()
    persistReadState()
  }, [persistReadState])

  useEffect(() => {
    notificationsRef.current = notifications
  }, [notifications])

  useEffect(() => {
    const fetchAndSyncNotifications = async () => {
      try {
        ensurePersistedStateLoaded()

        const response = await fetch('/api/admin/complaints', { cache: 'no-store' })
        if (!response.ok) return

        const result = await response.json()
        const rows = Array.isArray(result?.data) ? (result.data as ComplaintPayload[]) : []

        const complaints = rows
          .map((row) => {
            const id = Number(row.complaint_id)
            if (Number.isNaN(id) || id <= 0) return null

            const locationKey = row.hall_id
              ? `hall:${row.hall_id}`
              : row.study_area_id
                ? `study:${row.study_area_id}`
                : row.lecture_halls?.hall_name
                  ? `hall-name:${row.lecture_halls.hall_name}`
                  : row.study_areas?.area_name
                    ? `study-name:${row.study_areas.area_name}`
                    : `complaint:${id}`

            return {
              notification_key: locationKey,
              complaint_id: id,
              issue_category: row.issue_category || 'Complaint',
              description: row.description || 'No description provided',
              created_at: row.created_at,
              complaint_count: Number(row.complaint_count || 0),
              lecture_halls: row.lecture_halls,
              study_areas: row.study_areas,
              hall_id: row.hall_id,
              study_area_id: row.study_area_id,
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .filter((item) => !dismissedIdsRef.current.has(item.complaint_id))

        const uniqueByLocation = Array.from(
          complaints.reduce((map, complaint) => {
            // API already returns newest first, so keep first item per location.
            if (!map.has(complaint.notification_key)) {
              map.set(complaint.notification_key, complaint)
            }
            return map
          }, new Map<string, (typeof complaints)[number]>()).values()
        ).slice(0, 20)

        setNotifications((prev) => {
          const prevByKey = new Map(prev.map((n) => [n.notification_key, n]))

          return uniqueByLocation.map((complaint) => {
            const existing = prevByKey.get(complaint.notification_key)
            const base = buildComplaintNotification(complaint)
            const isImmediateFix = complaint.complaint_count > 10

            return {
              ...base,
              id: existing?.id || `notif-${complaint.notification_key}`,
              notification_key: complaint.notification_key,
              timestamp: existing?.timestamp || (complaint.created_at ? new Date(complaint.created_at) : new Date()),
              isRead:
                (existing?.complaint_id === complaint.complaint_id
                  ? existing?.isRead
                  : undefined) ??
                (readStateRef.current.has(complaint.complaint_id) ? true : false),
              readAt:
                (existing?.complaint_id === complaint.complaint_id
                  ? existing?.readAt
                  : undefined) ||
                (readStateRef.current.get(complaint.complaint_id)
                  ? new Date(readStateRef.current.get(complaint.complaint_id) as string)
                  : undefined),
              isImmediateFix,
            }
          })
        })
      } catch {
        // Silent fail: notification polling should not break the UI.
      }
    }

    fetchAndSyncNotifications()
    const interval = window.setInterval(fetchAndSyncNotifications, 10000)
    return () => window.clearInterval(interval)
  }, [ensurePersistedStateLoaded])

  useEffect(() => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000

    const removeExpiredReadNotifications = () => {
      const now = Date.now()

      setNotifications((prev) => {
        const kept = prev.filter((notification) => {
          if (!notification.isRead || !notification.readAt) return true

          const readAtMs = new Date(notification.readAt).getTime()
          const isExpired = now - readAtMs >= ONE_DAY_MS

          if (isExpired) {
            dismissedIdsRef.current.add(notification.complaint_id)
            readStateRef.current.delete(notification.complaint_id)
          }

          return !isExpired
        })

        return kept
      })

      persistDismissedIds()
      persistReadState()
    }

    removeExpiredReadNotifications()
    const interval = window.setInterval(removeExpiredReadNotifications, 60 * 1000)
    return () => window.clearInterval(interval)
  }, [persistDismissedIds, persistReadState])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAllNotifications]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}

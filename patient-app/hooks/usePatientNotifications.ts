import { useState, useEffect, useCallback } from 'react'
import {
  PatientNotification,
  getAllNotifications,
  markAllNotificationsAsRead,
  addNotification,
} from '@/lib/notificationStore'

export function usePatientNotifications() {
  const [notifications, setNotifications] = useState<PatientNotification[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const reloadNotifications = useCallback(() => {
    const list = getAllNotifications()
    setNotifications(list)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    reloadNotifications()

    const handleUpdate = () => {
      reloadNotifications()
    }

    window.addEventListener('patientNotificationChange', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('patientNotificationChange', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [reloadNotifications])

  const markAllRead = useCallback(() => {
    markAllNotificationsAsRead()
    reloadNotifications()
  }, [reloadNotifications])

  const notify = useCallback(
    (notif: Parameters<typeof addNotification>[0]) => {
      const created = addNotification(notif)
      reloadNotifications()
      return created
    },
    [reloadNotifications]
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    unreadCount,
    markAllRead,
    notify,
    isLoaded,
    reloadNotifications,
  }
}

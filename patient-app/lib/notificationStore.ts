/**
 * Unified Patient Notification Store
 *
 * Derived exclusively from actual patient events (successful bookings, queue updates, etc.)
 * Never displays fabricated or unrelated mock notifications.
 */

import { AppointmentRecord } from './appointmentStore'

export interface PatientNotification {
  id: string
  type: 'appointment_confirmed' | 'token_update' | 'prescription_available' | 'health_announcement'
  timestamp: number
  timeAgoHi: string
  timeAgoEn: string
  titleHi: string
  titleEn: string
  bodyHi: string
  bodyEn: string
  isRead: boolean
  tokenNumber?: string
  appointmentId?: string
}

const NOTIFICATIONS_STORAGE_KEY = 'swasthyaq_patient_notifications'

/**
 * Format relative time strings.
 */
function getRelativeTime(timestamp: number): { hi: string; en: string } {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 60) {
    return { hi: 'अभी-अभी', en: 'Just now' }
  }
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) {
    return { hi: `${diffMin} मिनट पहले`, en: `${diffMin}m ago` }
  }
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) {
    return { hi: `${diffHr} घंटे पहले`, en: `${diffHr}h ago` }
  }
  const diffDay = Math.floor(diffHr / 24)
  return { hi: `${diffDay} दिन पहले`, en: `${diffDay}d ago` }
}

/**
 * Retrieves all stored notifications.
 */
export function getAllNotifications(): PatientNotification[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (raw) {
      const parsed: PatientNotification[] = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((n) => {
          const rel = getRelativeTime(n.timestamp || Date.now())
          return {
            ...n,
            timeAgoHi: rel.hi,
            timeAgoEn: rel.en,
          }
        })
      }
    }
  } catch (err) {
    console.warn('Error reading notifications from storage:', err)
  }

  return []
}

/**
 * Adds a notification and notifies listeners.
 */
export function addNotification(
  notif: Omit<PatientNotification, 'id' | 'timestamp' | 'timeAgoHi' | 'timeAgoEn' | 'isRead'>
): PatientNotification {
  const currentList = getAllNotifications()
  const timestamp = Date.now()
  const rel = getRelativeTime(timestamp)

  const newNotif: PatientNotification = {
    ...notif,
    id: `notif-${timestamp}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp,
    timeAgoHi: rel.hi,
    timeAgoEn: rel.en,
    isRead: false,
  }

  const updatedList = [newNotif, ...currentList.slice(0, 49)] // Keep max 50

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedList))
      window.dispatchEvent(new CustomEvent('patientNotificationChange', { detail: newNotif }))
    } catch (err) {
      console.warn('Error saving notification:', err)
    }
  }

  return newNotif
}

/**
 * Marks all notifications as read.
 */
export function markAllNotificationsAsRead(): void {
  const currentList = getAllNotifications()
  const updatedList = currentList.map((n) => ({ ...n, isRead: true }))

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedList))
      window.dispatchEvent(new Event('patientNotificationChange'))
    } catch (err) {}
  }
}

/**
 * Creates an authoritative notification for a newly confirmed appointment.
 */
export function createAppointmentNotification(appointment: AppointmentRecord): PatientNotification {
  const cleanToken = appointment.tokenNumber.startsWith('#')
    ? appointment.tokenNumber
    : `#${appointment.tokenNumber}`

  return addNotification({
    type: 'appointment_confirmed',
    tokenNumber: cleanToken,
    appointmentId: appointment.id,
    titleHi: 'अपॉइंटमेंट कन्फर्मेशन',
    titleEn: 'Appointment Confirmation',
    bodyHi: `आपका टोकन ${cleanToken} ${appointment.date} को ${appointment.time} बजे ${appointment.doctorName} के साथ ${appointment.facility} पर कन्फर्म हो गया है। स्थिति: ${appointment.status === 'Waiting' ? 'प्रतीक्षारत (Waiting)' : 'कन्फर्म'}।`,
    bodyEn: `Your token ${cleanToken} has been generated for ${appointment.date} at ${appointment.time} with ${appointment.doctorName} at ${appointment.facility}. Status: ${appointment.status}.`,
  })
}

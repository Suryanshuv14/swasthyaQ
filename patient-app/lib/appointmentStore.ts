/**
 * Unified Patient Appointment Store & State Management
 *
 * Single Source of Truth for all patient appointment data across the app:
 * Chat -> Backend Booking -> Appointment Store -> Appointments Screen -> Notifications -> Home
 */

export interface AppointmentRecord {
  id: string
  tokenNumber: string // e.g. "A-128" or "#A-128"
  doctorName: string // e.g. "Dr. Keshav Kapoor"
  date: string // e.g. "8 September 2026" or "2026-09-08"
  time: string // e.g. "11:00 AM"
  facility: string // e.g. "PHC-NORTH-01"
  patientName: string // e.g. "Shubham Shah"
  patientId?: string
  status: 'Waiting' | 'Confirmed' | 'Completed' | 'Cancelled'
  symptoms?: string[]
  department?: string
  bookedAt: string
}

const APPOINTMENT_STORAGE_KEY = 'swasthyaq_patient_appointments'
const ACTIVE_APPOINTMENT_KEY = 'swasthyaq_confirmed_appointment'

/**
 * Retrieves all stored appointments from localStorage.
 */
export function getAllAppointments(): AppointmentRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(APPOINTMENT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.warn('Error reading appointments from storage:', err)
  }

  // Check legacy session storage if present
  try {
    const sessionRaw = sessionStorage.getItem(ACTIVE_APPOINTMENT_KEY)
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw)
      if (parsed && (parsed.tokenNumber || parsed.token_no)) {
        const record = normalizeAppointmentRecord(parsed)
        return [record]
      }
    }
  } catch (err) {}

  return []
}

/**
 * Retrieves the currently active appointment (latest waiting/confirmed).
 */
export function getActiveAppointment(): AppointmentRecord | null {
  const all = getAllAppointments()
  if (all.length === 0) return null

  // Find most recent active appointment
  const active = all.find((a) => a.status === 'Waiting' || a.status === 'Confirmed')
  return active || all[0] || null
}

/**
 * Normalizes appointment object properties from various sources (FastAPI backend, n8n, session).
 */
export function normalizeAppointmentRecord(data: any): AppointmentRecord {
  const rawToken =
    data.tokenNumber ||
    data.token_no ||
    data.token ||
    data.tokenNo ||
    'A-101'

  const formattedToken = rawToken.toString().startsWith('#')
    ? rawToken.toString()
    : rawToken.toString().startsWith('A-') || rawToken.toString().startsWith('B-')
    ? `#${rawToken}`
    : rawToken.toString().startsWith('A') || rawToken.toString().startsWith('B')
    ? `#${rawToken.slice(0, 1)}-${rawToken.slice(1)}`
    : `#${rawToken}`

  return {
    id: data.id || data.appointment_id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    tokenNumber: formattedToken,
    doctorName: data.doctorName || data.doctor_name || 'Dr. Keshav Kapoor',
    date: data.date || data.appointment_date || '8 September 2026',
    time: data.time || data.appointment_time || data.slotTime || '11:00 AM',
    facility: data.facility || data.facility_id || 'PHC-NORTH-01',
    patientName: data.patientName || data.patient_name || 'Patient',
    patientId: data.patientId || data.patient_id,
    status: (data.status === 'confirmed' || data.status === 'Confirmed'
      ? 'Confirmed'
      : data.status === 'completed'
      ? 'Completed'
      : data.status === 'cancelled'
      ? 'Cancelled'
      : 'Waiting') as AppointmentRecord['status'],
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : undefined,
    department: data.department || data.symptom_category || 'General Medicine',
    bookedAt: data.bookedAt || data.created_at || new Date().toISOString(),
  }
}

/**
 * Saves or updates an appointment in localStorage and notifies all components.
 */
export function saveAppointment(rawAppointment: Partial<AppointmentRecord> | any): AppointmentRecord {
  const normalized = normalizeAppointmentRecord(rawAppointment)
  const currentList = getAllAppointments()

  // Replace existing if ID matches, or prepend newest
  const existingIdx = currentList.findIndex((a) => a.id === normalized.id || a.tokenNumber === normalized.tokenNumber)
  let updatedList: AppointmentRecord[]
  if (existingIdx >= 0) {
    updatedList = [...currentList]
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...normalized }
  } else {
    updatedList = [normalized, ...currentList]
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENT_STORAGE_KEY, JSON.stringify(updatedList))
      sessionStorage.setItem(ACTIVE_APPOINTMENT_KEY, JSON.stringify(normalized))

      // Emit custom cross-component event
      window.dispatchEvent(new CustomEvent('patientAppointmentChange', { detail: normalized }))
    } catch (err) {
      console.warn('Error saving appointment to storage:', err)
    }
  }

  // Automatically trigger corresponding notification
  if (typeof window !== 'undefined') {
    import('./notificationStore').then(({ createAppointmentNotification }) => {
      createAppointmentNotification(normalized)
    }).catch(() => {})
  }

  return normalized
}

/**
 * Parses appointment details from AI chat responses.
 * Detects token numbers (e.g. A-128), times (e.g. 11:00 AM), dates, doctors, facilities, and statuses.
 */
export function parseAppointmentFromAiText(text: string, defaultPatientName?: string): AppointmentRecord | null {
  if (!text) return null

  // Check if text indicates a confirmed booking
  const lower = text.toLowerCase()
  const hasConfirmationKeyword =
    lower.includes('token') ||
    lower.includes('टोकन') ||
    lower.includes('appointment confirmed') ||
    lower.includes('appointment has been booked') ||
    lower.includes('अपॉइंटमेंट कन्फर्म') ||
    lower.includes('बुक हो गया') ||
    lower.includes('कन्फर्मेशन') ||
    lower.includes('booking confirmed') ||
    lower.includes('is confirmed')

  // Extract Token: e.g. "A-128", "A128", "Token: A-128", "Token No: A-128"
  const tokenMatch = text.match(/(?:Token|Token No|टोकन|टोकन नं|Token Number)[:\s*#]*([A-Za-z]-[0-9]+|[A-Za-z][0-9]{2,4})/i) ||
                     text.match(/\b([A-Z]-[0-9]{2,4})\b/)

  if (!hasConfirmationKeyword && !tokenMatch) {
    return null
  }

  const tokenNo = tokenMatch ? tokenMatch[1] : 'A-128'

  // Extract Time: e.g. "11:00 AM", "10:30 AM", "11:00 am"
  const timeMatch = text.match(/\b(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM|am|pm)\b/)
  const time = timeMatch ? timeMatch[0].toUpperCase() : '11:00 AM'

  // Extract Date: e.g. "8 September 2026", "September 8", "2026-09-08"
  const dateMatch =
    text.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)(?:\s+\d{4})?)\b/i) ||
    text.match(/\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)\b/i) ||
    text.match(/\b(202\d-[0-1]\d-[0-3]\d)\b/)

  const dateStr = dateMatch ? dateMatch[0] : '8 September 2026'

  // Extract Doctor: e.g. "Dr. Keshav Kapoor", "Dr. Keshav"
  const docMatch = text.match(/\b(Dr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/)
  const doctor = docMatch ? docMatch[0] : 'Dr. Keshav Kapoor'

  // Extract Facility: e.g. "PHC-NORTH-01", "PHC North"
  const facilityMatch = text.match(/\b(PHC-[A-Z0-9\-]+|PHC\s+[A-Za-z]+)\b/i)
  const facility = facilityMatch ? facilityMatch[0].toUpperCase() : 'PHC-NORTH-01'

  // Extract Patient Name if present: "Patient: Shubham Shah", "Name: Shubham"
  const patientMatch = text.match(/(?:Patient|Patient Name|Name|मरीज)[:\s*]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  const patientName = patientMatch ? patientMatch[1] : (defaultPatientName || 'Patient')

  // Extract Status
  const status: AppointmentRecord['status'] = lower.includes('waiting') || lower.includes('प्रतीक्षारत')
    ? 'Waiting'
    : 'Confirmed'

  return {
    id: `apt-chat-${tokenNo.replace(/[^A-Za-z0-9]/g, '')}-${Date.now()}`,
    tokenNumber: tokenNo.startsWith('#') ? tokenNo : `#${tokenNo}`,
    doctorName: doctor,
    date: dateStr,
    time: time,
    facility: facility,
    patientName: patientName,
    status: status,
    department: 'General Medicine',
    bookedAt: new Date().toISOString(),
  }
}

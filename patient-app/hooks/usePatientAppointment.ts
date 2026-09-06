import { useState, useEffect, useCallback } from 'react'
import {
  AppointmentRecord,
  getActiveAppointment,
  getAllAppointments,
  saveAppointment,
} from '@/lib/appointmentStore'

export function usePatientAppointment() {
  const [activeAppointment, setActiveAppointment] = useState<AppointmentRecord | null>(null)
  const [allAppointments, setAllAppointments] = useState<AppointmentRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const reloadAppointments = useCallback(() => {
    const active = getActiveAppointment()
    const all = getAllAppointments()
    setActiveAppointment(active)
    setAllAppointments(all)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    reloadAppointments()

    const handleUpdate = () => {
      reloadAppointments()
    }

    window.addEventListener('patientAppointmentChange', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('patientAppointmentChange', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [reloadAppointments])

  const recordAppointment = useCallback(
    (appointment: Partial<AppointmentRecord>) => {
      const saved = saveAppointment(appointment)
      reloadAppointments()
      return saved
    },
    [reloadAppointments]
  )

  return {
    activeAppointment,
    allAppointments,
    recordAppointment,
    isLoaded,
    reloadAppointments,
  }
}

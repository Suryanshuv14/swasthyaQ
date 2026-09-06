'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PatientProfile,
  DEFAULT_PATIENT_PROFILE,
  getPatientProfile,
  savePatientProfile,
  getPatientInitials,
} from '@/lib/patientProfile'

export function usePatientProfile() {
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = getPatientProfile()
      setProfile(current)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    const handleProfileChange = () => {
      const updated = getPatientProfile()
      setProfile(updated)
    }

    window.addEventListener('patientProfileChange', handleProfileChange)
    window.addEventListener('storage', handleProfileChange)

    return () => {
      window.removeEventListener('patientProfileChange', handleProfileChange)
      window.removeEventListener('storage', handleProfileChange)
    }
  }, [])

  const updateProfile = useCallback((updates: Partial<PatientProfile>) => {
    const updated = savePatientProfile(updates)
    setProfile(updated)
    return updated
  }, [])

  const initials = getPatientInitials(profile.name)

  return {
    profile,
    updateProfile,
    initials,
    isLoaded,
  }
}

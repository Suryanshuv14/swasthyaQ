/**
 * Patient Profile Management Module
 *
 * Persists patient profile data in localStorage, with reactive event emission.
 */

export interface PatientProfile {
  name: string
  userId: string // e.g. ABHA ID or User ID: "94-8231-5612" or "PAT-90821"
  phone: string
  age: number
  gender: string
  village: string
  facilityId: string
}

export interface PatientPayload {
  first_name: string
  last_name: string
  age: number
  gender: string
  mobile: string
  village: string
}

export function extractPatientPayload(profile: PatientProfile): PatientPayload {
  const nameTrimmed = (profile.name || '').trim()
  const parts = nameTrimmed ? nameTrimmed.split(/\s+/) : []
  const firstName = parts[0] || nameTrimmed || 'Patient'
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''
  return {
    first_name: firstName,
    last_name: lastName,
    age: Number(profile.age) || 47,
    gender: profile.gender || 'Female',
    mobile: profile.phone || '+91 98765 43210',
    village: profile.village || 'Ramnagar',
  }
}

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  name: 'सुनीता देवी',
  userId: '94-8231-5612',
  phone: '+91 98765 43210',
  age: 47,
  gender: 'Female',
  village: 'Ramnagar',
  facilityId: 'PHC-NORTH-01',
}

const STORAGE_KEY = 'swasthyaq_patient_profile'

/**
 * Retrieves the current patient profile from localStorage or returns default.
 */
export function getPatientProfile(): PatientProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PATIENT_PROFILE
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_PATIENT_PROFILE,
        ...parsed,
        age: Number(parsed.age) || DEFAULT_PATIENT_PROFILE.age,
      }
    }
  } catch (err) {
    console.warn('Error reading patient profile from storage:', err)
  }

  return DEFAULT_PATIENT_PROFILE
}

/**
 * Updates patient profile in localStorage and notifies all listening components.
 */
export function savePatientProfile(updates: Partial<PatientProfile>): PatientProfile {
  const current = getPatientProfile()
  const updated: PatientProfile = {
    ...current,
    ...updates,
    age: updates.age !== undefined ? Number(updates.age) : current.age,
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('patientProfileChange'))
    } catch (err) {
      console.warn('Error saving patient profile to storage:', err)
    }
  }

  return updated
}

/**
 * Computes patient initials from profile name.
 */
export function getPatientInitials(name: string): string {
  if (!name || !name.trim()) return 'P'
  const trimmed = name.trim()
  
  // If Devanagari Hindi text
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return trimmed.slice(0, 2)
  }

  // English letters
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

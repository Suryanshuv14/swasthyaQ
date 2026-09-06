const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export type UserRole = 'doctor' | 'health_worker' | 'district_admin'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  facility_id?: string | null
  department?: string
  phone?: string
  avatar_url?: string
  medical_reg_no?: string
  qualification?: string
  experience_years?: number
  chamber_room?: string
  opd_days?: string[]
  shift_morning?: string
  shift_evening?: string
  max_tokens_per_shift?: number
  availability_status?: 'available' | 'on_rounds' | 'off_duty'
  emergency_alerts_enabled?: boolean
  auto_prescription_validity_days?: number
}

export type BackendAppointment = {
  id: string
  patient_id?: string
  token_no: string
  patient_name: string
  age: number
  symptom_category: string
  symptoms: string[]
  status: string
  waiting_since: string
  source?: string
  facility_id?: string
  risk_level?: 'low' | 'high'
  needs_human_callback?: boolean
}

export type Patient = {
  id: string
  patient_id: string
  token: string
  name: string
  age: number
  category: string
  categoryClass: string
  waiting: string
  relativeWaiting: string
  status: string
  statusClass: string
  symptoms: string[]
  source?: string
  facility_id?: string
  risk_level?: string
  needs_human_callback?: boolean
}

export type Medicine = {
  name: string
  dose: string
  duration: string
}

export type PrescriptionRecord = {
  id: string
  appointment_id: string
  patient_id?: string
  patient_name?: string
  token_no?: string
  age?: number
  doctor_email: string
  doctor_name: string
  medicines: Medicine[]
  notes: string
  created_at: string
}

export type Referral = {
  id: string
  patient_id: string
  patient_name: string
  from_facility: string
  to_facility: string
  reason: string
  status: string
  created_at: string
}

export type FollowUp = {
  id: string
  patient_id: string
  patient_name: string
  due_date: string
  assigned_to: string
  notes: string
  facility_id: string
  status: string
}

export type DistrictStats = {
  district_name: string
  total_opd_load: number
  avg_doctor_availability: number
  avg_wait_minutes: number
  active_referrals: number
  referral_flow: { facility: string; inflow: number; outflow: number }[]
  medicine_stock: { facility: string; medicine: string; status: string; level: 'green' | 'yellow' | 'red'; quantity: string }[]
  disease_trends: { category: string; cases: number }[]
}

export function formatCategoryClass(category: string): string {
  const cat = category.toLowerCase()
  if (cat.includes('general')) return 'blue'
  if (cat.includes('chronic')) return 'purple'
  if (cat.includes('respiratory')) return 'teal'
  if (cat.includes('maternal')) return 'orange'
  return 'orange'
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return '09:00 AM'
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.max(1, Math.floor(diffMs / 60000))
    if (diffMins < 60) {
      return `${diffMins} min waiting`
    }
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m waiting`
  } catch (e) {
    return '12 min waiting'
  }
}

export async function loginUser(email: string, password: string, role?: UserRole) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.detail || 'Invalid login credentials')
  }
  return res.json()
}

export async function loginDoctor(email: string, password: string) {
  return loginUser(email, password, 'doctor')
}

export async function fetchQueue(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/queue/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch patient queue')
  }
  const data: BackendAppointment[] = await res.json()
  return data.map((item) => ({
    id: item.id,
    patient_id: item.patient_id || `PAT-${item.token_no}`,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source || 'manual',
    facility_id: item.facility_id,
    risk_level: item.risk_level || 'low',
    needs_human_callback: item.needs_human_callback || false,
  }))
}

export async function addManualPatient(
  token: string,
  patientData: {
    patient_name: string
    age: number
    symptom_category: string
    symptoms: string[]
    risk_level?: 'low' | 'high'
    needs_human_callback?: boolean
  }
) {
  const res = await fetch(`${API_BASE}/queue/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...patientData,
      source: 'manual',
      status: 'waiting',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to add patient to queue')
  }
  return res.json()
}

export async function fetchAllAppointments(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/queue/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch patient history')
  }
  const data: BackendAppointment[] = await res.json()
  return data.map((item) => ({
    id: item.id,
    patient_id: item.patient_id || `PAT-${item.token_no}`,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source || 'manual',
    facility_id: item.facility_id,
    risk_level: item.risk_level || 'low',
    needs_human_callback: item.needs_human_callback || false,
  }))
}

export async function fetchPatients(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch patient directory')
  const data = await res.json()
  return data.map((item: any) => ({
    id: item.id,
    patient_id: item.patient_id,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source,
    facility_id: item.facility_id,
    risk_level: item.risk_level,
    needs_human_callback: item.needs_human_callback,
  }))
}

export async function fetchPrescriptions(token: string): Promise<PrescriptionRecord[]> {
  const res = await fetch(`${API_BASE}/prescriptions/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch prescriptions')
  return res.json()
}

export async function updateAppointmentStatus(token: string, appointmentId: string, status: string) {
  const res = await fetch(`${API_BASE}/queue/${appointmentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update appointment status')
  return res.json()
}

export async function createPrescription(
  token: string,
  appointmentId: string,
  medicines: Medicine[],
  notes: string
) {
  const res = await fetch(`${API_BASE}/prescriptions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      appointment_id: appointmentId,
      medicines,
      notes,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to submit prescription')
  }
  return res.json()
}

export async function fetchReferrals(token: string): Promise<Referral[]> {
  const res = await fetch(`${API_BASE}/referrals/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch referrals')
  return res.json()
}

export async function createReferral(
  token: string,
  referralData: { patient_id: string; patient_name: string; to_facility: string; reason: string }
) {
  const res = await fetch(`${API_BASE}/referrals/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(referralData),
  })
  if (!res.ok) throw new Error('Failed to create referral')
  return res.json()
}

export async function createFollowUp(
  token: string,
  followupData: { patient_id: string; patient_name: string; due_date: string; assigned_to?: string; notes?: string }
) {
  const res = await fetch(`${API_BASE}/follow-ups/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(followupData),
  })
  if (!res.ok) throw new Error('Failed to create follow-up task')
  return res.json()
}

export async function fetchHWPatients(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/health-worker/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch registered patients')
  const data = await res.json()
  return data.map((item: any) => ({
    id: item.id,
    patient_id: item.patient_id || `PAT-${item.token_no}`,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source,
    facility_id: item.facility_id,
    risk_level: item.risk_level,
    needs_human_callback: item.needs_human_callback,
  }))
}

export async function fetchHWHighRisk(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/health-worker/high-risk`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch high-risk patients')
  const data = await res.json()
  return data.map((item: any) => ({
    id: item.id,
    patient_id: item.patient_id || `PAT-${item.token_no}`,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source,
    facility_id: item.facility_id,
    risk_level: item.risk_level,
    needs_human_callback: item.needs_human_callback,
  }))
}

export async function fetchHWReferrals(token: string): Promise<Referral[]> {
  const res = await fetch(`${API_BASE}/health-worker/referrals`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch health worker referrals')
  return res.json()
}

export async function fetchHWFollowUps(token: string): Promise<FollowUp[]> {
  const res = await fetch(`${API_BASE}/health-worker/follow-ups`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch health worker follow-ups')
  return res.json()
}

export async function fetchHWCallbacks(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/health-worker/callbacks`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch callback patients')
  const data = await res.json()
  return data.map((item: any) => ({
    id: item.id,
    patient_id: item.patient_id || `PAT-${item.token_no}`,
    token: item.token_no,
    name: item.patient_name,
    age: item.age,
    category: item.symptom_category,
    categoryClass: formatCategoryClass(item.symptom_category),
    waiting: formatTime(item.waiting_since),
    relativeWaiting: formatRelativeTime(item.waiting_since),
    status: item.status === 'waiting' ? 'Waiting' : item.status === 'in_consultation' ? 'In consultation' : 'Done',
    statusClass: item.status === 'waiting' ? 'waiting' : item.status === 'in_consultation' ? 'consulting' : 'done',
    symptoms: item.symptoms || [],
    source: item.source,
    facility_id: item.facility_id,
    risk_level: item.risk_level,
    needs_human_callback: item.needs_human_callback,
  }))
}

export async function fetchDistrictStats(token: string): Promise<DistrictStats> {
  const res = await fetch(`${API_BASE}/district/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch district statistics')
  return res.json()
}

export async function fetchUserProfile(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}

export async function updateUserProfile(token: string, profileData: Partial<User>): Promise<{ message: string; access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to update user profile')
  }
  return res.json()
}

export async function changeUserPassword(token: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to change password')
  }
  return res.json()
}

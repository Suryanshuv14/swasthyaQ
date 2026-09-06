'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Patient,
  Medicine,
  PrescriptionRecord,
  Referral,
  fetchQueue,
  fetchPatients,
  fetchPrescriptions,
  fetchReferrals,
  updateAppointmentStatus,
  createPrescription,
  addManualPatient,
  createReferral,
  createFollowUp,
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '@/lib/api'
import '@/app/home.css'

import { DashboardSidebar, NavItem } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { DoctorQueueView } from './components/doctor-queue-view'
import { DoctorConsultationView } from './components/doctor-consultation-view'
import { DoctorRecordsView } from './components/doctor-records-view'
import { DoctorPrescriptionsView } from './components/doctor-prescriptions-view'
import { DoctorReferralsView } from './components/doctor-referrals-view'
import { DoctorSettingsView } from './components/doctor-settings-view'
import { AddPatientModal } from './components/modals/add-patient-modal'
import { ReferralModal } from './components/modals/referral-modal'
import { FollowupModal } from './components/modals/followup-modal'
import { PrescriptionDetailModal } from './components/modals/prescription-detail-modal'

type DoctorNav = 'Queue' | 'Patient Records' | 'Prescriptions' | 'Referrals' | 'Settings'

const DOCTOR_NAV_ITEMS: NavItem<DoctorNav>[] = [
  { id: 'Queue', label: 'OPD Queue', icon: 'groups' },
  { id: 'Patient Records', label: 'Patient Records', icon: 'folder_shared' },
  { id: 'Prescriptions', label: 'Prescriptions', icon: 'receipt_long' },
  { id: 'Referrals', label: 'Referrals', icon: 'swap_horiz' },
  { id: 'Settings', label: 'Settings', icon: 'settings' },
]

const initialMeds: Medicine[] = [
  { name: 'Paracetamol 500mg', dose: '1 tablet after meals', duration: '5 days' },
]

export default function DoctorDashboardPage() {
  const router = useRouter()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // Data states
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientDirectory, setPatientDirectory] = useState<Patient[]>([])
  const [prescriptionRecords, setPrescriptionRecords] = useState<PrescriptionRecord[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])

  // Loading states
  const [queueLoading, setQueueLoading] = useState(false)
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [rxLoading, setRxLoading] = useState(false)
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Navigation & Consultation View State
  const [activeNav, setActiveNav] = useState<DoctorNav>('Queue')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRecord | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Prescription builder state for active consultation
  const [medicines, setMedicines] = useState<Medicine[]>(initialMeds)
  const [notes, setNotes] = useState('Rest well and stay hydrated. Follow up if symptoms persist.')
  const [sent, setSent] = useState(false)

  // Modals state
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false)
  const [referralModalOpen, setReferralModalOpen] = useState(false)
  const [followupModalOpen, setFollowupModalOpen] = useState(false)
  const [modalTargetPatient, setModalTargetPatient] = useState<Patient | null>(null)

  // Doctor Profile & Settings Form States
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210')
  const [profileAvatar, setProfileAvatar] = useState('')
  const [profileDepartment, setProfileDepartment] = useState('General Medicine & OPD')
  const [profileRegNo, setProfileRegNo] = useState('MH-20481')
  const [profileQualification, setProfileQualification] = useState('MBBS, MD (Medicine)')
  const [profileExperience, setProfileExperience] = useState('8')
  const [profileRoom, setProfileRoom] = useState('Room #03 - Doctor Chamber')
  const [profileOpdDays, setProfileOpdDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  const [profileShiftMorning, setProfileShiftMorning] = useState('09:00 AM - 01:00 PM')
  const [profileShiftEvening, setProfileShiftEvening] = useState('04:00 PM - 07:00 PM')
  const [profileMaxTokens, setProfileMaxTokens] = useState('40')
  const [profileStatus, setProfileStatus] = useState<'available' | 'on_rounds' | 'off_duty'>('available')
  const [profileEmergencyAlerts, setProfileEmergencyAlerts] = useState(true)
  const [profileRxValidity, setProfileRxValidity] = useState('5')
  const [settingsSubTab, setSettingsSubTab] = useState<'personal' | 'schedule'>('personal')
  const [doctorGender, setDoctorGender] = useState<'Male' | 'Female' | 'Other'>('Male')

  // Password change states
  const [currPassword, setCurrPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // 1. Auth Guard & Initial Data Fetch
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('swasthyaq_sidebar_collapsed') === 'true'
    setSidebarCollapsed(savedCollapsed)

    const token = localStorage.getItem('swasthyaq_token')
    const userStr = localStorage.getItem('swasthyaq_user')
    if (!token || !userStr) {
      router.push('/')
      return
    }
    try {
      const parsedUser: User = JSON.parse(userStr)
      if (parsedUser.role !== 'doctor') {
        router.push('/')
        return
      }
      setAuthToken(token)
      setUser(parsedUser)
      applyUserProfileToState(parsedUser)

      loadPatientQueue(token)
      fetchUserProfile(token)
        .then((remoteUser) => {
          if (remoteUser) {
            setUser(remoteUser)
            applyUserProfileToState(remoteUser)
            localStorage.setItem('swasthyaq_user', JSON.stringify(remoteUser))
          }
        })
        .catch(() => {})
    } catch {
      localStorage.clear()
      router.push('/')
    }
  }, [router])

  // 2. Poll queue every 5s if in Queue view
  useEffect(() => {
    if (!authToken || activeNav !== 'Queue' || selectedPatient !== null) return
    const interval = window.setInterval(() => {
      loadPatientQueue(authToken)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [authToken, activeNav, selectedPatient])

  function applyUserProfileToState(u: User) {
    setProfileName(u.name || '')
    setProfileEmail(u.email || '')
    setProfileDepartment(u.department || 'General Medicine & OPD')
    setProfilePhone(u.phone || '+91 98765 43210')
    setProfileAvatar(u.avatar_url || '')
    setProfileRegNo(u.medical_reg_no || 'MH-20481')
    setProfileQualification(u.qualification || 'MBBS, MD (Medicine)')
    setProfileExperience(String(u.experience_years || 8))
    setProfileRoom(u.chamber_room || 'Room #03 - Doctor Chamber')
    if (u.opd_days) setProfileOpdDays(u.opd_days)
    if (u.shift_morning) setProfileShiftMorning(u.shift_morning)
    if (u.shift_evening) setProfileShiftEvening(u.shift_evening)
    if (u.max_tokens_per_shift) setProfileMaxTokens(String(u.max_tokens_per_shift))
    if (u.availability_status) setProfileStatus(u.availability_status)
    if (u.emergency_alerts_enabled !== undefined) setProfileEmergencyAlerts(u.emergency_alerts_enabled)
    if (u.auto_prescription_validity_days) setProfileRxValidity(String(u.auto_prescription_validity_days))
  }

  // API Loaders
  async function loadPatientQueue(token: string) {
    setQueueLoading(true)
    try {
      const liveQueue = await fetchQueue(token)
      setPatients(liveQueue)
      const refs = await fetchReferrals(token).catch(() => [])
      setReferrals(refs)
    } catch (err) {
      console.error('Failed to load queue:', err)
    } finally {
      setQueueLoading(false)
    }
  }

  async function loadPatientDirectoryData(token: string) {
    setPatientsLoading(true)
    try {
      const docs = await fetchPatients(token)
      setPatientDirectory(docs)
    } catch (e) {
      console.error(e)
    } finally {
      setPatientsLoading(false)
    }
  }

  async function loadPrescriptionsData(token: string) {
    setRxLoading(true)
    try {
      const rxData = await fetchPrescriptions(token)
      setPrescriptionRecords(rxData)
    } catch (e) {
      console.error(e)
    } finally {
      setRxLoading(false)
    }
  }

  async function loadReferralsData(token: string) {
    setReferralsLoading(true)
    try {
      const refs = await fetchReferrals(token)
      setReferrals(refs)
    } catch (e) {
      console.error(e)
    } finally {
      setReferralsLoading(false)
    }
  }

  async function handleNavChange(tab: DoctorNav) {
    if (authToken && selectedPatient && selectedPatient.id && !sent) {
      try {
        await updateAppointmentStatus(authToken, selectedPatient.id, 'waiting')
      } catch (e) {
        console.error(e)
      }
    }
    setActiveNav(tab)
    setSelectedPatient(null)
    setSent(false)
    if (tab === 'Queue' && authToken) await loadPatientQueue(authToken)
    else if (tab === 'Patient Records' && authToken) await loadPatientDirectoryData(authToken)
    else if (tab === 'Prescriptions' && authToken) await loadPrescriptionsData(authToken)
    else if (tab === 'Referrals' && authToken) await loadReferralsData(authToken)
  }

  async function handleGlobalRefresh() {
    if (!authToken) return
    setIsRefreshing(true)
    try {
      if (activeNav === 'Queue') await loadPatientQueue(authToken)
      else if (activeNav === 'Patient Records') await loadPatientDirectoryData(authToken)
      else if (activeNav === 'Prescriptions') await loadPrescriptionsData(authToken)
      else if (activeNav === 'Referrals') await loadReferralsData(authToken)
      else if (activeNav === 'Settings') {
        const remoteUser = await fetchUserProfile(authToken)
        if (remoteUser) {
          setUser(remoteUser)
          applyUserProfileToState(remoteUser)
          localStorage.setItem('swasthyaq_user', JSON.stringify(remoteUser))
        }
      }
    } catch (err) {
      console.error('Failed to refresh data:', err)
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
    }
  }

  function handleLogout() {
    localStorage.clear()
    router.push('/')
  }

  async function openPatientConsultation(patient: Patient) {
    setSelectedPatient(patient)
    setActiveNav('Queue')
    setMedicines(initialMeds)
    setNotes('Rest well and stay hydrated. Follow up if symptoms persist.')
    setSent(false)

    if (authToken && patient.id && patient.status === 'Waiting') {
      try {
        await updateAppointmentStatus(authToken, patient.id, 'in_consultation')
        setPatients((all) =>
          all.map((p) =>
            p.id === patient.id
              ? { ...p, status: 'In consultation', statusClass: 'consulting' }
              : p
          )
        )
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function handleBackToQueue() {
    if (authToken && selectedPatient && selectedPatient.id && !sent) {
      try {
        await updateAppointmentStatus(authToken, selectedPatient.id, 'waiting')
      } catch (e) {
        console.error(e)
      }
    }
    setSelectedPatient(null)
    setSent(false)
    if (authToken) {
      await loadPatientQueue(authToken)
    }
  }

  async function handleCompleteConsultationOnly() {
    if (!authToken || !selectedPatient || !selectedPatient.id) return
    setActionLoading(true)
    try {
      await updateAppointmentStatus(authToken, selectedPatient.id, 'done')
      setSelectedPatient(null)
      setSent(false)
      await loadPatientQueue(authToken)
      await loadPatientDirectoryData(authToken)
    } catch (e: any) {
      alert(e.message || 'Error completing consultation')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAddPatientSubmit(data: {
    name: string
    age: number
    category: string
    symptoms: string[]
  }) {
    if (!authToken) return
    setActionLoading(true)
    try {
      await addManualPatient(authToken, {
        patient_name: data.name,
        age: data.age,
        symptom_category: data.category,
        symptoms: data.symptoms,
      })
      setAddPatientModalOpen(false)
      await loadPatientQueue(authToken)
    } catch (err: any) {
      alert(err.message || 'Failed to add patient')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCreateReferralSubmit(data: {
    patient_id: string
    patient_name: string
    to_facility: string
    reason: string
  }) {
    if (!authToken) return
    setActionLoading(true)
    try {
      await createReferral(authToken, data)
      setReferralModalOpen(false)
      await loadReferralsData(authToken)
    } catch (e: any) {
      alert(e.message || 'Failed to create referral')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCreateFollowupSubmit(data: {
    patient_id: string
    patient_name: string
    due_date: string
    assigned_to: string
    notes: string
  }) {
    if (!authToken || !modalTargetPatient) return
    setActionLoading(true)
    try {
      await createFollowUp(authToken, data)
      setFollowupModalOpen(false)
      setModalTargetPatient(null)
      alert(`Follow-up task assigned to ASHA Worker for ${data.patient_name}!`)
    } catch (e: any) {
      alert(e.message || 'Failed to assign follow-up')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendPharmacy() {
    if (!authToken || !selectedPatient || !selectedPatient.id) return
    const validMedicines = medicines.filter(
      (m) => m.name.trim() && m.dose.trim() && m.duration.trim()
    )
    if (!validMedicines.length) {
      alert('Add at least one complete medicine before saving prescription.')
      return
    }

    setActionLoading(true)
    try {
      await createPrescription(authToken, selectedPatient.id, validMedicines, notes)
      setSent(true)
      await loadPatientQueue(authToken)
    } catch (e: any) {
      alert(e.message || 'Error sending prescription')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!authToken) return
    setProfileSaving(true)
    setProfileSuccessMsg('')
    setProfileErrorMsg('')
    try {
      if (currPassword || newPassword || confirmPassword) {
        if (!currPassword) {
          setProfileErrorMsg('Please enter your Current Password to change credentials.')
          setProfileSaving(false)
          return
        }
        if (newPassword !== confirmPassword) {
          setProfileErrorMsg('New password and confirm password do not match.')
          setProfileSaving(false)
          return
        }
        await changeUserPassword(authToken, currPassword, newPassword)
        setCurrPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }

      const res = await updateUserProfile(authToken, {
        name: profileName,
        department: profileDepartment,
        medical_reg_no: profileRegNo,
        phone: profilePhone,
        qualification: profileQualification,
        experience_years: parseInt(profileExperience, 10) || 8,
        chamber_room: profileRoom,
        opd_days: profileOpdDays,
        shift_morning: profileShiftMorning,
        shift_evening: profileShiftEvening,
        max_tokens_per_shift: parseInt(profileMaxTokens, 10) || 40,
        availability_status: profileStatus,
        emergency_alerts_enabled: profileEmergencyAlerts,
        auto_prescription_validity_days: parseInt(profileRxValidity, 10) || 5,
      })

      const updatedUser = res.user || res
      setUser(updatedUser)
      localStorage.setItem('swasthyaq_user', JSON.stringify(updatedUser))
      setProfileSuccessMsg('Profile and chamber schedule updated successfully!')
      setTimeout(() => setProfileSuccessMsg(''), 4000)
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  function handleDiscardChanges() {
    if (!user) return
    applyUserProfileToState(user)
    setCurrPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setProfileSuccessMsg('Changes discarded. Restored saved profile values.')
    setTimeout(() => setProfileSuccessMsg(''), 3000)
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleQuickStatusChange(status: 'available' | 'on_rounds' | 'off_duty') {
    setProfileStatus(status)
    if (!authToken) return
    try {
      const res = await updateUserProfile(authToken, { availability_status: status })
      const updatedUser = res.user || res
      setUser(updatedUser)
      localStorage.setItem('swasthyaq_user', JSON.stringify(updatedUser))
    } catch (e) {
      console.error('Failed to change status:', e)
    }
  }

  if (!user) return null

  const doctorName = profileName || user.name || 'Dr. Ananya Kapoor'
  const doctorDept = profileDepartment || user.department || 'General Medicine'
  const doctorInitials = doctorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 3)

  return (
    <main className="dashboard-shell">
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <DashboardSidebar<DoctorNav>
        collapsed={sidebarCollapsed}
        onToggleCollapse={(c) => {
          setSidebarCollapsed(c)
          localStorage.setItem('swasthyaq_sidebar_collapsed', String(c))
        }}
        sectionTitle="Doctor Workspace"
        navItems={DOCTOR_NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        user={{
          name: doctorName,
          roleTitle: doctorDept,
          avatarUrl: profileAvatar || user.avatar_url,
          statusDotColor:
            profileStatus === 'available'
              ? '#16a34a'
              : profileStatus === 'on_rounds'
              ? '#d97706'
              : '#dc2626',
          statusTitle: `Status: ${profileStatus}`,
          onProfileClick: () => handleNavChange('Settings'),
        }}
        onLogout={handleLogout}
      />

      {/* 2. MAIN CONTENT AREA */}
      <section className="main-content">
        {/* TOPBAR */}
        <DashboardTopbar
          eyebrow={`DOCTOR WORKSPACE · ${user.facility_id || 'PHC-NORTH-01'}`}
          title={selectedPatient ? `Consultation: ${selectedPatient.name}` : activeNav}
          loading={queueLoading || patientsLoading || rxLoading || referralsLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleGlobalRefresh}
          primaryAction={{
            icon: 'add',
            label: 'Add Patient',
            onClick: () => setAddPatientModalOpen(true),
          }}
        />

        {/* 3. ACTIVE SUB-VIEW */}
        {activeNav === 'Queue' && (
          <>
            {selectedPatient ? (
              <DoctorConsultationView
                patient={selectedPatient}
                doctorName={doctorName}
                prescriptionRecords={prescriptionRecords}
                medicines={medicines}
                notes={notes}
                sent={sent}
                loading={actionLoading}
                onUpdateMedicines={setMedicines}
                onUpdateNotes={setNotes}
                onBackToQueue={handleBackToQueue}
                onCompleteConsultation={handleCompleteConsultationOnly}
                onAssignFollowup={() => {
                  setModalTargetPatient(selectedPatient)
                  setFollowupModalOpen(true)
                }}
                onAssignReferral={() => {
                  setModalTargetPatient(selectedPatient)
                  setReferralModalOpen(true)
                }}
                onSendPharmacy={handleSendPharmacy}
                onDone={() => {
                  setSelectedPatient(null)
                  setSent(false)
                  if (authToken) loadPatientQueue(authToken)
                }}
              />
            ) : (
              <DoctorQueueView
                patients={patients}
                referrals={referrals}
                queueLoading={queueLoading}
                onOpenPatient={openPatientConsultation}
                onRefreshQueue={() => authToken && loadPatientQueue(authToken)}
              />
            )}
          </>
        )}

        {activeNav === 'Patient Records' && (
          <DoctorRecordsView
            user={user}
            patientDirectory={patientDirectory}
            patientsLoading={patientsLoading}
            onOpenPatient={openPatientConsultation}
            onAssignFollowup={(p) => {
              setModalTargetPatient(p)
              setFollowupModalOpen(true)
            }}
          />
        )}

        {activeNav === 'Prescriptions' && (
          <DoctorPrescriptionsView
            prescriptionRecords={prescriptionRecords}
            rxLoading={rxLoading}
            onSelectPrescription={setSelectedPrescription}
          />
        )}

        {activeNav === 'Referrals' && (
          <DoctorReferralsView
            referrals={referrals}
            referralsLoading={referralsLoading}
            onOpenCreateReferralModal={() => {
              setModalTargetPatient(null)
              setReferralModalOpen(true)
            }}
          />
        )}

        {activeNav === 'Settings' && (
          <DoctorSettingsView
            user={user}
            doctorName={doctorName}
            doctorDept={doctorDept}
            doctorInitials={doctorInitials}
            profileName={profileName}
            setProfileName={setProfileName}
            profileEmail={profileEmail}
            setProfileEmail={setProfileEmail}
            profilePhone={profilePhone}
            setProfilePhone={setProfilePhone}
            profileAvatar={profileAvatar}
            setProfileAvatar={setProfileAvatar}
            profileDepartment={profileDepartment}
            setProfileDepartment={setProfileDepartment}
            profileRegNo={profileRegNo}
            setProfileRegNo={setProfileRegNo}
            profileQualification={profileQualification}
            setProfileQualification={setProfileQualification}
            profileExperience={profileExperience}
            setProfileExperience={setProfileExperience}
            profileRoom={profileRoom}
            setProfileRoom={setProfileRoom}
            profileOpdDays={profileOpdDays}
            setProfileOpdDays={setProfileOpdDays}
            profileShiftMorning={profileShiftMorning}
            setProfileShiftMorning={setProfileShiftMorning}
            profileShiftEvening={profileShiftEvening}
            setProfileShiftEvening={setProfileShiftEvening}
            profileMaxTokens={profileMaxTokens}
            setProfileMaxTokens={setProfileMaxTokens}
            profileStatus={profileStatus}
            setProfileStatus={setProfileStatus}
            profileEmergencyAlerts={profileEmergencyAlerts}
            setProfileEmergencyAlerts={setProfileEmergencyAlerts}
            profileRxValidity={profileRxValidity}
            setProfileRxValidity={setProfileRxValidity}
            settingsSubTab={settingsSubTab}
            setSettingsSubTab={setSettingsSubTab}
            doctorGender={doctorGender}
            setDoctorGender={setDoctorGender}
            currPassword={currPassword}
            setCurrPassword={setCurrPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            profileSaving={profileSaving}
            profileSuccessMsg={profileSuccessMsg}
            profileErrorMsg={profileErrorMsg}
            onSaveProfile={handleSaveProfile}
            onDiscardChanges={handleDiscardChanges}
            onAvatarUpload={handleAvatarUpload}
            onQuickStatusChange={handleQuickStatusChange}
            onLogout={handleLogout}
          />
        )}
      </section>

      {/* 4. MODAL DIALOGS */}
      <AddPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onSubmit={handleAddPatientSubmit}
        loading={actionLoading}
      />

      <ReferralModal
        isOpen={referralModalOpen}
        patientId={modalTargetPatient?.patient_id || modalTargetPatient?.id || ''}
        patientName={modalTargetPatient?.name || ''}
        onClose={() => setReferralModalOpen(false)}
        onSubmit={handleCreateReferralSubmit}
        loading={actionLoading}
      />

      <FollowupModal
        isOpen={followupModalOpen}
        patient={modalTargetPatient}
        onClose={() => setFollowupModalOpen(false)}
        onSubmit={handleCreateFollowupSubmit}
        loading={actionLoading}
      />

      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </main>
  )
}

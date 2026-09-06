'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Patient,
  Referral,
  FollowUp,
  fetchHWPatients,
  fetchHWHighRisk,
  fetchHWReferrals,
  fetchHWFollowUps,
  fetchHWCallbacks,
  addManualPatient,
} from '@/lib/api'
import '@/app/home.css'

import { DashboardSidebar, NavItem } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { HwRegisteredView } from './components/hw-registered-view'
import { HwHighRiskView } from './components/hw-high-risk-view'
import { HwReferralsView } from './components/hw-referrals-view'
import { HwFollowupsView } from './components/hw-followups-view'
import { HwCallbacksView } from './components/hw-callbacks-view'
import { HwAddPatientModal } from './components/modals/hw-add-patient-modal'

type HWNav =
  | 'Registered Patients'
  | 'High-Risk Patients'
  | 'Referrals Created'
  | 'Follow-ups Due'
  | 'Needs Callback'

const HW_NAV_ITEMS: NavItem<HWNav>[] = [
  { id: 'Registered Patients', label: 'Registered Patients', icon: 'people' },
  { id: 'High-Risk Patients', label: 'High-Risk Patients', icon: 'warning' },
  { id: 'Referrals Created', label: 'Referrals Created', icon: 'swap_horiz' },
  { id: 'Follow-ups Due', label: 'Follow-ups Due', icon: 'event_available' },
  { id: 'Needs Callback', label: 'Needs Callback', icon: 'phone_callback' },
]

export default function HealthWorkerDashboardPage() {
  const router = useRouter()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [activeTab, setActiveTab] = useState<HWNav>('Registered Patients')
  const [registeredPatients, setRegisteredPatients] = useState<Patient[]>([])
  const [highRiskPatients, setHighRiskPatients] = useState<Patient[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [callbacks, setCallbacks] = useState<Patient[]>([])

  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Auth Guard
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
      if (parsedUser.role !== 'health_worker') {
        router.push('/')
        return
      }
      setAuthToken(token)
      setUser(parsedUser)
      loadData(token, 'Registered Patients')
    } catch {
      localStorage.clear()
      router.push('/')
    }
  }, [router])

  async function loadData(token: string, tab: HWNav) {
    setLoading(true)
    try {
      if (tab === 'Registered Patients') {
        const data = await fetchHWPatients(token)
        setRegisteredPatients(data)
      } else if (tab === 'High-Risk Patients') {
        const data = await fetchHWHighRisk(token)
        setHighRiskPatients(data)
      } else if (tab === 'Referrals Created') {
        const data = await fetchHWReferrals(token)
        setReferrals(data)
      } else if (tab === 'Follow-ups Due') {
        const data = await fetchHWFollowUps(token)
        setFollowups(data)
      } else if (tab === 'Needs Callback') {
        const data = await fetchHWCallbacks(token)
        setCallbacks(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleTabChange(tab: HWNav) {
    setActiveTab(tab)
    if (authToken) loadData(authToken, tab)
  }

  async function handleRefresh() {
    if (!authToken) return
    setIsRefreshing(true)
    try {
      await loadData(authToken, activeTab)
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
    }
  }

  async function handleAddPatientSubmit(patient: {
    name: string
    age: number
    category: string
    symptoms: string[]
    risk_level: 'low' | 'high'
    needs_human_callback: boolean
  }) {
    if (!authToken) return
    setModalLoading(true)
    try {
      await addManualPatient(authToken, {
        patient_name: patient.name,
        age: patient.age,
        symptom_category: patient.category,
        symptoms: patient.symptoms,
        risk_level: patient.risk_level,
        needs_human_callback: patient.needs_human_callback,
      })
      setAddPatientModalOpen(false)
      await loadData(authToken, activeTab)
    } catch (err: any) {
      alert(err.message || 'Failed to register patient')
    } finally {
      setModalLoading(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    router.push('/')
  }

  if (!user) return null

  return (
    <main className="dashboard-shell">
      <DashboardSidebar<HWNav>
        collapsed={sidebarCollapsed}
        onToggleCollapse={(c) => {
          setSidebarCollapsed(c)
          localStorage.setItem('swasthyaq_sidebar_collapsed', String(c))
        }}
        sectionTitle="Field Operations"
        navItems={HW_NAV_ITEMS}
        activeNav={activeTab}
        onNavChange={handleTabChange}
        primaryButton={{
          icon: 'person_add',
          label: 'Register Patient',
          onClick: () => setAddPatientModalOpen(true),
        }}
        user={{
          name: user.name,
          roleTitle: `${user.facility_id || 'PHC-NORTH-01'} · ASHA`,
          statusDotColor: '#16a34a',
          statusTitle: 'Active Field Duty',
        }}
        onLogout={handleLogout}
      />

      <section className="main-content">
        <DashboardTopbar
          eyebrow={`FIELD WORKER WORKSPACE · ${user.facility_id || 'PHC-NORTH-01'}`}
          title={activeTab}
          loading={loading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          primaryAction={{
            icon: 'person_add',
            label: 'Register Patient',
            onClick: () => setAddPatientModalOpen(true),
          }}
        />

        <div className="content-wrap">
          {activeTab === 'Registered Patients' && (
            <HwRegisteredView user={user} patients={registeredPatients} loading={loading} />
          )}
          {activeTab === 'High-Risk Patients' && (
            <HwHighRiskView patients={highRiskPatients} loading={loading} />
          )}
          {activeTab === 'Referrals Created' && (
            <HwReferralsView referrals={referrals} loading={loading} />
          )}
          {activeTab === 'Follow-ups Due' && (
            <HwFollowupsView followups={followups} loading={loading} />
          )}
          {activeTab === 'Needs Callback' && (
            <HwCallbacksView callbacks={callbacks} loading={loading} />
          )}
        </div>
      </section>

      <HwAddPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onSubmit={handleAddPatientSubmit}
        loading={modalLoading}
      />
    </main>
  )
}

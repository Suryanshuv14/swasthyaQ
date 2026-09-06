'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, DistrictStats, fetchDistrictStats } from '@/lib/api'
import '@/app/home.css'

import { DashboardSidebar, NavItem } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { DistrictOverviewView } from './components/district-overview-view'
import { DistrictFacilitiesView } from './components/district-facilities-view'
import { DistrictInventoryView } from './components/district-inventory-view'

type DistrictNav = 'District Overview' | 'Facility Network' | 'Medicine Inventory'

const DISTRICT_NAV_ITEMS: NavItem<DistrictNav>[] = [
  { id: 'District Overview', label: 'District Overview', icon: 'analytics' },
  { id: 'Facility Network', label: 'Facility Network', icon: 'local_hospital' },
  { id: 'Medicine Inventory', label: 'Medicine Inventory', icon: 'inventory_2' },
]

export default function DistrictDashboardPage() {
  const router = useRouter()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DistrictStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState<DistrictNav>('District Overview')

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
      if (parsedUser.role !== 'district_admin') {
        router.push('/')
        return
      }
      setAuthToken(token)
      setUser(parsedUser)
      loadStats(token)
    } catch {
      localStorage.clear()
      router.push('/')
    }
  }, [router])

  async function loadStats(token: string) {
    setLoading(true)
    try {
      const data = await fetchDistrictStats(token)
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    if (!authToken) return
    setIsRefreshing(true)
    try {
      await loadStats(authToken)
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
    }
  }

  function handleLogout() {
    localStorage.clear()
    router.push('/')
  }

  if (!user) return null

  return (
    <main className="dashboard-shell">
      <DashboardSidebar<DistrictNav>
        collapsed={sidebarCollapsed}
        onToggleCollapse={(c) => {
          setSidebarCollapsed(c)
          localStorage.setItem('swasthyaq_sidebar_collapsed', String(c))
        }}
        sectionTitle="District Administration"
        navItems={DISTRICT_NAV_ITEMS}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        user={{
          name: user.name,
          roleTitle: 'District CMO · North Healthcare Zone',
          statusDotColor: '#16a34a',
          statusTitle: 'Active Duty',
        }}
        onLogout={handleLogout}
      />

      <section className="main-content">
        <DashboardTopbar
          eyebrow="CHIEF MEDICAL OFFICER · NORTH CENTRAL HEALTHCARE ZONE"
          title={activeNav}
          loading={loading}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          refreshTooltip="Refresh District Metrics"
        />

        {activeNav === 'District Overview' && <DistrictOverviewView stats={stats} />}
        {activeNav === 'Facility Network' && <DistrictFacilitiesView />}
        {activeNav === 'Medicine Inventory' && <DistrictInventoryView />}
      </section>
    </main>
  )
}

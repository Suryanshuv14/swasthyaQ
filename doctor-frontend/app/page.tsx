'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, loginUser } from '@/lib/api'
import './home.css'

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('swasthyaq_token')
    const userStr = localStorage.getItem('swasthyaq_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'doctor') router.push('/dashboard/doctor')
        else if (user.role === 'health_worker') router.push('/dashboard/health-worker')
        else if (user.role === 'district_admin') router.push('/dashboard/district')
      } catch (e) {
        localStorage.clear()
      }
    }
  }, [router])

  function handleSelectRole(role: UserRole) {
    setSelectedRole(role)
    setLoginError(null)
    if (role === 'doctor') setEmail('doctor@swasthyaq.com')
    else if (role === 'health_worker') setEmail('worker@swasthyaq.com')
    else if (role === 'district_admin') setEmail('admin@swasthyaq.com')
  }

  async function handleSubmitLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) return
    setLoading(true)
    setLoginError(null)

    try {
      const data = await loginUser(email, password, selectedRole)
      const token = data.access_token
      const user = data.user
      localStorage.setItem('swasthyaq_token', token)
      localStorage.setItem('swasthyaq_user', JSON.stringify(user))

      if (user.role === 'doctor') router.push('/dashboard/doctor')
      else if (user.role === 'health_worker') router.push('/dashboard/health-worker')
      else if (user.role === 'district_admin') router.push('/dashboard/district')
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="role-select-shell">
      <div className="role-select-container">
        <div className="brand centered" style={{ paddingBottom: 12 }}>
          <span className="brand-mark">S</span>
          <span style={{ fontSize: 24 }}>SwasthyaQ</span>
        </div>
        <p className="eyebrow" style={{ textTransform: 'uppercase' }}>
          PUBLIC HEALTHCARE OPD & ACCESS WORKSPACE
        </p>

        {!selectedRole ? (
          <>
            <h1>Who are you?</h1>
            <p className="role-select-subtitle">
              Select your role to access your dedicated clinical or administration portal.
            </p>

            <div className="role-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <div
                className="role-card"
                onClick={() => handleSelectRole('doctor')}
              >
                <div className="role-icon-box">
                  <md-icon>medical_services</md-icon>
                </div>
                <h3>Doctor</h3>
                <p>Consult live OPD queue, write digital prescriptions, and manage patient referrals & follow-ups.</p>
                <span className="role-badge-tag">Facility Scope (PHC)</span>
              </div>

              <div
                className="role-card"
                onClick={() => handleSelectRole('health_worker')}
              >
                <div className="role-icon-box">
                  <md-icon>health_and_safety</md-icon>
                </div>
                <h3>Health Worker</h3>
                <p>Field patient registration, high-risk maternity/chronic tracking, and community follow-ups.</p>
                <span className="role-badge-tag">ASHA / ANM Portal</span>
              </div>

              <div
                className="role-card"
                onClick={() => handleSelectRole('district_admin')}
              >
                <div className="role-icon-box">
                  <md-icon>analytics</md-icon>
                </div>
                <h3>District Admin</h3>
                <p>District-wide OPD load analytics, doctor availability %, referral trends, and medicine stock monitoring.</p>
                <span className="role-badge-tag">Chief Medical Officer</span>
              </div>
            </div>

            <div className="demo-note">
              <span>Demo Mode</span> · Choose any role above to sign in with pre-configured accounts.
            </div>
          </>
        ) : (
          <div className="login-card" style={{ margin: '0 auto', maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button
                className="text-button"
                style={{ padding: 0, fontSize: 13, gap: 4 }}
                onClick={() => setSelectedRole(null)}
              >
                <md-icon>arrow_back</md-icon> Change Role
              </button>
              <span className="role-badge-tag" style={{ marginTop: 0 }}>
                {selectedRole === 'doctor' ? 'Doctor Workspace' : selectedRole === 'health_worker' ? 'Health Worker Portal' : 'District Admin'}
              </span>
            </div>

            <h2>Sign in as {selectedRole === 'doctor' ? 'Doctor' : selectedRole === 'health_worker' ? 'Health Worker' : 'District Admin'}</h2>
            <p className="login-copy">Enter your work email and password to access your dashboard.</p>

            {loginError && (
              <div className="error-banner">
                <md-icon>error</md-icon>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLogin}>
              <label>
                Work Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button className="primary-button wide" type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : `Enter ${selectedRole === 'doctor' ? 'Doctor' : selectedRole === 'health_worker' ? 'Health Worker' : 'District'} Dashboard`}
                <md-icon>arrow_forward</md-icon>
              </button>
            </form>

            <div className="demo-note" style={{ marginTop: 20 }}>
              <span>Demo Credentials</span> · Password: <strong>demo1234</strong>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
